"""Điều phối hội thoại: ghép chủ đề + lịch sử + prompt rồi gọi LLM.

Vì sao tầng này tồn tại tách khỏi `api.py`
------------------------------------------
`api.py` chỉ nên lo chuyện HTTP: kiểm tra request, dựng response, ánh xạ lỗi.
Còn "một lượt hội thoại nghĩa là gì" là logic nghiệp vụ - và nó cần test được
mà không phải dựng cả một ứng dụng FastAPI.

Phi trạng thái, y như kiến trúc cũ
-----------------------------------
Server KHÔNG giữ phiên. Client gửi kèm toàn bộ lịch sử ở mỗi lượt. Đánh đổi
này giữ nguyên từ bản trước vì lý do vẫn còn nguyên giá trị: hosting free ngủ
đông và khởi động lại bất cứ lúc nào, phiên lưu trong RAM sẽ bốc hơi giữa
chừng cuộc trò chuyện. Với LLM nó còn có thêm một cái lợi: người học bấm "gửi
lại" sau lỗi mạng không mất mạch chuyện.

Cái giá phải trả là kích thước request lớn dần theo lượt. Một phiên 5 phút
hiếm khi quá 20 lượt nên chuyện đó không đáng lo, nhưng `MAX_HISTORY_TURNS`
vẫn cắt bớt để một client lỗi không thổi request lên vô hạn.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from . import llm, prompts
from .topics import Topic

#: Số lượt tối đa gửi cho model. Vượt quá thì cắt phần ĐẦU chứ không phải phần
#: cuối - ngữ cảnh gần luôn quan trọng hơn với hội thoại.
MAX_HISTORY_TURNS = 40

Role = Literal["ai", "user"]


@dataclass(frozen=True)
class HistoryTurn:
    role: Role
    text: str


def _to_contents(history: list[HistoryTurn]) -> list[dict[str, Any]]:
    """Đổi lịch sử của ta sang định dạng `contents` của Gemini."""
    trimmed = history[-MAX_HISTORY_TURNS:]
    return [
        {
            "role": "model" if turn.role == "ai" else "user",
            "parts": [{"text": turn.text}],
        }
        for turn in trimmed
    ]


def _utterance(raw: Any) -> dict[str, str]:
    """Chuẩn hoá một câu thoại từ JSON của model.

    Model đã được ép theo lược đồ nên trường hợp thiếu khoá gần như không xảy
    ra, nhưng một `None` lọt ra UI sẽ làm vỡ màn hình - rẻ hơn nhiều nếu chặn
    ngay ở đây.
    """
    if not isinstance(raw, dict):
        return {"ja": "", "vi": ""}
    return {
        "ja": str(raw.get("ja") or "").strip(),
        "vi": str(raw.get("vi") or "").strip(),
    }


def _hints(raw: Any, limit: int = 3) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    hints = [_utterance(item) for item in raw[:limit]]
    return [hint for hint in hints if hint["ja"]]


def _corrections(raw: Any, limit: int = 2) -> list[dict[str, str]]:
    """Lọc góp ý, bỏ mục rỗng và mục không có gì để nói.

    Lời khen (`praise`) được phép không có `suggestion`; các loại còn lại mà
    thiếu cả bản sửa lẫn lời giải thích thì chỉ là nhiễu.
    """
    if not isinstance(raw, list):
        return []

    result: list[dict[str, str]] = []
    for item in raw[:limit]:
        if not isinstance(item, dict):
            continue
        severity = str(item.get("severity") or "suggestion")
        explanation = str(item.get("explanationVi") or "").strip()
        suggestion = str(item.get("suggestion") or "").strip()
        if not explanation and not suggestion:
            continue
        result.append(
            {
                "severity": severity
                if severity in ("error", "suggestion", "praise")
                else "suggestion",
                "category": str(item.get("category") or "grammar"),
                "original": str(item.get("original") or "").strip(),
                "suggestion": suggestion,
                "explanationVi": explanation,
            }
        )
    return result


def open_session(topic: Topic) -> dict[str, Any]:
    """Sinh câu chào mở màn + gợi ý đầu tiên cho một chủ đề."""
    raw = llm.generate_json(
        system=prompts.conversation_system(topic),
        contents=[
            {
                "role": "user",
                "parts": [{"text": prompts.opening_user_message(topic)}],
            }
        ],
        schema=prompts.OPENING_SCHEMA,
        # Câu mở màn nên đa dạng giữa các lần luyện lại cùng một chủ đề, nếu
        # không người học sẽ thuộc lòng câu chào và bỏ qua nó.
        temperature=1.0,
    )
    return {"reply": _utterance(raw.get("reply")), "hints": _hints(raw.get("hints"))}


def respond(
    topic: Topic,
    history: list[HistoryTurn],
    text: str,
    remaining_seconds: int,
) -> dict[str, Any]:
    """Một lượt hội thoại: đáp lời, gợi ý câu tiếp, và góp ý cho câu vừa rồi."""
    contents = _to_contents(history)
    contents.append(
        {
            "role": "user",
            "parts": [{"text": prompts.turn_user_message(text, remaining_seconds)}],
        }
    )

    raw = llm.generate_json(
        system=prompts.conversation_system(topic),
        contents=contents,
        schema=prompts.TURN_SCHEMA,
        temperature=0.85,
    )

    return {
        "reply": _utterance(raw.get("reply")),
        "hints": _hints(raw.get("hints")),
        "corrections": _corrections(raw.get("corrections")),
        "understood": bool(raw.get("understood", True)),
    }


def render_transcript(topic: Topic, history: list[HistoryTurn]) -> str:
    """Dựng bản ghi hội thoại dạng chữ để đưa vào prompt tổng kết.

    Dùng nhãn rõ ràng thay vì định dạng `contents` nhiều lượt: ở bước này model
    KHÔNG đóng vai nữa mà đọc lại cuộc thoại như một tài liệu, nên nó cần thấy
    ai nói câu nào một cách tường minh.
    """
    lines = [f"[Tình huống: {topic.title} — {topic.description}]"]
    for turn in history[-MAX_HISTORY_TURNS:]:
        speaker = "NGƯỜI HỌC" if turn.role == "user" else f"AI ({topic.persona_name})"
        lines.append(f"{speaker}: {turn.text}")
    return "\n".join(lines)


def summarize(
    topic: Topic,
    history: list[HistoryTurn],
    duration_seconds: int,
) -> dict[str, Any]:
    """Bản tổng kết cuối phiên: lỗi, cách sửa, ngữ pháp và độ tự nhiên."""
    turn_count = sum(1 for turn in history if turn.role == "user")
    transcript = render_transcript(topic, history)

    raw = llm.generate_json(
        system=prompts.summary_system(topic),
        contents=[
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompts.summary_user_message(
                            transcript, turn_count, duration_seconds
                        )
                    }
                ],
            }
        ],
        schema=prompts.SUMMARY_SCHEMA,
        # Tổng kết là việc phân tích, không phải sáng tác. Nhiệt độ thấp để
        # model bám vào đúng những gì có trong bản ghi thay vì bịa thêm.
        temperature=0.3,
        timeout=llm.SUMMARY_TIMEOUT_S,
    )

    return {
        "overallVi": str(raw.get("overallVi") or "").strip(),
        "score": _clamp_score(raw.get("score")),
        "strengths": _string_list(raw.get("strengths")),
        "mistakes": _mistakes(raw.get("mistakes")),
        "grammarPoints": _grammar_points(raw.get("grammarPoints")),
        "naturalnessTips": _naturalness_tips(raw.get("naturalnessTips")),
        "nextFocus": _string_list(raw.get("nextFocus")),
        "turnCount": turn_count,
        "durationSeconds": duration_seconds,
    }


def _clamp_score(raw: Any) -> int:
    try:
        return max(0, min(100, int(raw)))
    except (TypeError, ValueError):
        return 0


def _string_list(raw: Any) -> list[str]:
    if not isinstance(raw, list):
        return []
    return [str(item).strip() for item in raw if str(item).strip()]


def _mistakes(raw: Any) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    result = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        original = str(item.get("original") or "").strip()
        corrected = str(item.get("corrected") or "").strip()
        explanation = str(item.get("explanationVi") or "").strip()
        # Không có câu gốc thì người học không đối chiếu được - bỏ.
        if not original or not explanation:
            continue
        result.append(
            {
                "original": original,
                "corrected": corrected,
                "explanationVi": explanation,
                "category": str(item.get("category") or "grammar"),
                "severity": str(item.get("severity") or "error"),
            }
        )
    return result


def _grammar_points(raw: Any) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    result = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        pattern = str(item.get("pattern") or "").strip()
        explanation = str(item.get("explanationVi") or "").strip()
        if not pattern or not explanation:
            continue
        result.append(
            {
                "pattern": pattern,
                "explanationVi": explanation,
                "exampleJa": str(item.get("exampleJa") or "").strip(),
                "exampleVi": str(item.get("exampleVi") or "").strip(),
            }
        )
    return result


def _naturalness_tips(raw: Any) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return []
    result = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        prefer = str(item.get("prefer") or "").strip()
        why = str(item.get("whyVi") or "").strip()
        if not prefer or not why:
            continue
        result.append(
            {
                "instead": str(item.get("instead") or "").strip(),
                "prefer": prefer,
                "whyVi": why,
            }
        )
    return result
