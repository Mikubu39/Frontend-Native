"""Prompt hệ thống + lược đồ JSON cho mọi lời gọi Gemini.

Tách khỏi `api.py` có chủ đích: prompt là thứ được chỉnh đi chỉnh lại nhiều
nhất trong một hệ thống LLM, và nó cần đọc được như một tài liệu chứ không
phải như những chuỗi rải rác giữa mã xử lý HTTP.

Ba nguyên tắc chi phối toàn bộ prompt ở đây
--------------------------------------------
1. **Không bao giờ phá vai.** AI là người Nhật trong tình huống đó, không phải
   trợ lý. Phần sửa lỗi đi ở TRƯỜNG RIÊNG của JSON, không chen vào lời thoại -
   nếu không người học sẽ nghe câu tiếng Nhật lẫn lời giảng tiếng Việt và mất
   hẳn cảm giác đang trò chuyện thật.

2. **Sửa lỗi phải tiết chế.** Bắt mọi lỗi nhỏ ở mọi lượt sẽ dập tắt ý muốn
   nói của người mới học. Prompt yêu cầu tối đa 2 góp ý mỗi lượt và ưu tiên
   lỗi cản trở giao tiếp trước lỗi hình thức. Bản tổng kết cuối phiên mới là
   chỗ nói đầy đủ.

3. **Luôn có lối đi tiếp.** Mỗi lượt đều kèm gợi ý câu nói - đây là thứ giữ
   cho người học không bao giờ bị kẹt ở màn hình trắng, vai trò mà FSM cũ phải
   dùng cả một cơ chế `rescue` mới làm được.
"""

from __future__ import annotations

from .topics import Topic

#: Mỗi phiên là 5 phút (khớp `SESSION_DURATION_SECONDS` phía client). AI cần
#: biết con số này để tự chia nhịp câu chuyện chứ không sa đà.
SESSION_MINUTES = 5

#: Còn dưới ngần này giây thì AI được yêu cầu lái hội thoại về phần kết.
WRAP_UP_SECONDS = 60


# ---------------------------------------------------------------------------
# Lược đồ JSON (định dạng responseSchema của Gemini - tập con của OpenAPI)
# ---------------------------------------------------------------------------
_UTTERANCE = {
    "type": "OBJECT",
    "properties": {
        "ja": {"type": "STRING", "description": "Câu tiếng Nhật"},
        "vi": {"type": "STRING", "description": "Bản dịch tiếng Việt"},
    },
    "required": ["ja", "vi"],
    "propertyOrdering": ["ja", "vi"],
}

_CORRECTION = {
    "type": "OBJECT",
    "properties": {
        "severity": {
            "type": "STRING",
            "enum": ["error", "suggestion", "praise"],
            "description": (
                "error = sai thật sự; suggestion = đúng nhưng có cách hay hơn; "
                "praise = dùng tốt"
            ),
        },
        "category": {
            "type": "STRING",
            "enum": ["grammar", "vocabulary", "politeness", "naturalness", "spelling"],
        },
        "original": {
            "type": "STRING",
            "description": "Nguyên văn phần người học đã viết",
        },
        "suggestion": {
            "type": "STRING",
            "description": "Bản sửa; để rỗng nếu là lời khen",
        },
        "explanationVi": {
            "type": "STRING",
            "description": "Giải thích ngắn bằng tiếng Việt",
        },
    },
    "required": ["severity", "category", "original", "suggestion", "explanationVi"],
    "propertyOrdering": [
        "severity",
        "category",
        "original",
        "suggestion",
        "explanationVi",
    ],
}

OPENING_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "reply": _UTTERANCE,
        "hints": {"type": "ARRAY", "items": _UTTERANCE, "minItems": 2, "maxItems": 3},
    },
    "required": ["reply", "hints"],
    "propertyOrdering": ["reply", "hints"],
}

TURN_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "reply": _UTTERANCE,
        "hints": {"type": "ARRAY", "items": _UTTERANCE, "minItems": 2, "maxItems": 3},
        "corrections": {"type": "ARRAY", "items": _CORRECTION, "maxItems": 2},
        "understood": {
            "type": "BOOLEAN",
            "description": (
                "false khi câu của người học không hiểu được hoặc lạc hẳn khỏi "
                "tình huống"
            ),
        },
    },
    "required": ["reply", "hints", "corrections", "understood"],
    "propertyOrdering": ["reply", "hints", "corrections", "understood"],
}

_MISTAKE = {
    "type": "OBJECT",
    "properties": {
        "original": {
            "type": "STRING",
            "description": "Câu sai nguyên văn của người học",
        },
        "corrected": {"type": "STRING", "description": "Câu đã sửa đúng"},
        "explanationVi": {"type": "STRING", "description": "Vì sao sai và sửa thế nào"},
        "category": {
            "type": "STRING",
            "enum": ["grammar", "vocabulary", "politeness", "naturalness", "spelling"],
        },
        "severity": {"type": "STRING", "enum": ["error", "suggestion"]},
    },
    "required": ["original", "corrected", "explanationVi", "category", "severity"],
    "propertyOrdering": [
        "original",
        "corrected",
        "explanationVi",
        "category",
        "severity",
    ],
}

_GRAMMAR_POINT = {
    "type": "OBJECT",
    "properties": {
        "pattern": {
            "type": "STRING",
            "description": "Mẫu ngữ pháp, ví dụ 〜てもいいですか",
        },
        "explanationVi": {"type": "STRING"},
        "exampleJa": {"type": "STRING"},
        "exampleVi": {"type": "STRING"},
    },
    "required": ["pattern", "explanationVi", "exampleJa", "exampleVi"],
    "propertyOrdering": ["pattern", "explanationVi", "exampleJa", "exampleVi"],
}

_NATURALNESS_TIP = {
    "type": "OBJECT",
    "properties": {
        "instead": {"type": "STRING", "description": "Cách người học đã nói"},
        "prefer": {"type": "STRING", "description": "Cách người Nhật thường nói"},
        "whyVi": {"type": "STRING", "description": "Vì sao tự nhiên hơn"},
    },
    "required": ["instead", "prefer", "whyVi"],
    "propertyOrdering": ["instead", "prefer", "whyVi"],
}

SUMMARY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "overallVi": {
            "type": "STRING",
            "description": "Nhận xét tổng quan 2-3 câu, giọng động viên nhưng trung thực",
        },
        "score": {
            "type": "INTEGER",
            "description": "Điểm 0-100 cho phần thể hiện trong phiên này",
        },
        "strengths": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "maxItems": 4,
            "description": "Những điểm người học làm tốt, bằng tiếng Việt",
        },
        "mistakes": {"type": "ARRAY", "items": _MISTAKE, "maxItems": 8},
        "grammarPoints": {
            "type": "ARRAY",
            "items": _GRAMMAR_POINT,
            "maxItems": 4,
            "description": "Điểm ngữ pháp nên ôn lại, rút ra từ chính lỗi trong phiên",
        },
        "naturalnessTips": {
            "type": "ARRAY",
            "items": _NATURALNESS_TIP,
            "maxItems": 4,
            "description": (
                "Câu đúng ngữ pháp nhưng người Nhật không nói vậy - và cách nói "
                "tự nhiên hơn"
            ),
        },
        "nextFocus": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "maxItems": 3,
            "description": "Việc cụ thể nên luyện ở phiên sau, bằng tiếng Việt",
        },
    },
    "required": [
        "overallVi",
        "score",
        "strengths",
        "mistakes",
        "grammarPoints",
        "naturalnessTips",
        "nextFocus",
    ],
    "propertyOrdering": [
        "overallVi",
        "score",
        "strengths",
        "mistakes",
        "grammarPoints",
        "naturalnessTips",
        "nextFocus",
    ],
}


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------
def _persona_block(topic: Topic) -> str:
    persona = topic.persona_name_ja or topic.persona_name or "日本人"
    return (
        f"# Vai của bạn\n"
        f"Bạn là {persona} ({topic.persona_name}) trong tình huống: {topic.title}.\n"
        f"Mục tiêu của cuộc trò chuyện: {topic.goal}\n\n"
        f"# Bối cảnh\n{topic.guidance}\n"
    )


def conversation_system(topic: Topic) -> str:
    """System prompt dùng cho CẢ câu mở đầu lẫn mọi lượt sau đó.

    Giữ một prompt duy nhất thay vì hai bản riêng: mọi ràng buộc về độ dài câu,
    trình độ từ vựng và giọng điệu đều phải giống hệt nhau ở mọi lượt, và hai
    bản song song chắc chắn sẽ trôi lệch nhau sau vài lần chỉnh sửa.
    """
    level = topic.level
    return f"""Bạn là bạn luyện hội thoại tiếng Nhật cho người Việt Nam mới học (trình độ {level}).

{_persona_block(topic)}
# Cách nói chuyện
- LUÔN nói bằng tiếng Nhật tự nhiên, đúng như người Nhật thật nói trong tình huống này.
- Mỗi lượt chỉ 1-2 câu ngắn. Người mới học không theo kịp đoạn dài.
- Dùng thể lịch sự ですます, từ vựng và ngữ pháp trong phạm vi {level}.
- Viết kanji thông dụng, tránh kanji hiếm.
- KHÔNG BAO GIỜ phá vai. Không giảng bài trong lời thoại, không chen tiếng Việt vào trường "ja".
- Luôn đẩy hội thoại tiến lên: kết lượt bằng một câu hỏi hoặc một lời mời phản hồi.
- Nếu người học viết bằng tiếng Việt hoặc romaji, cứ đáp bằng tiếng Nhật thật ngắn và nhẹ nhàng
  mời họ thử viết bằng tiếng Nhật, đừng trách móc.

# Trường "vi"
Bản dịch tiếng Việt sát nghĩa của chính câu tiếng Nhật bạn vừa nói. Không thêm bình luận.

# Trường "hints"
2-3 câu tiếng Nhật mà người học CÓ THỂ nói ở lượt tiếp theo, kèm bản dịch tiếng Việt.
Phải là câu đáp hợp lý cho lượt vừa rồi của bạn, khác nhau rõ rệt, và đúng trình độ {level}.

# Trường "corrections"
Góp ý cho câu VỪA RỒI của người học. Quy tắc bắt buộc:
- TỐI ĐA 2 mục mỗi lượt. Thà bỏ sót còn hơn làm người học ngợp.
- Ưu tiên lỗi cản trở giao tiếp (sai trợ từ, sai động từ) hơn lỗi hình thức.
- Câu đã đúng và tự nhiên thì trả về mảng RỖNG. Đừng bịa lỗi để có cái mà nói.
- Thỉnh thoảng (khi người học dùng đúng một mẫu khó) hãy dùng severity "praise".
- "explanationVi" viết bằng tiếng Việt, ngắn gọn, nói rõ VÌ SAO chứ không chỉ nêu bản sửa.

# Trường "understood"
false chỉ khi câu của người học thật sự không hiểu được hoặc lạc hẳn khỏi tình huống.
Kể cả lúc đó bạn vẫn phải đáp trong vai và kéo họ về lại mạch chuyện.

# Nhịp phiên
Cả phiên chỉ kéo dài {SESSION_MINUTES} phút. Hãy chia nhịp để đi hết mục tiêu trong khoảng đó."""


def opening_user_message(topic: Topic) -> str:
    """Lời nhắc kích hoạt câu chào đầu tiên.

    Gemini cần ít nhất một `content` vai user; ta không có câu nào của người
    học nên dùng một chỉ thị sân khấu ngắn.
    """
    return (
        "Hãy mở màn cuộc trò chuyện: nói câu đầu tiên trong vai của bạn, "
        "tự nhiên đúng như tình huống này bắt đầu ngoài đời, và kèm gợi ý "
        f"cho người học đáp lại. (Tình huống: {topic.title})"
    )


def turn_user_message(text: str, remaining_seconds: int) -> str:
    """Bọc câu của người học kèm ngữ cảnh thời gian còn lại.

    Thời gian được gắn vào TỪNG lượt chứ không đặt trong system prompt vì nó
    thay đổi liên tục; nhét vào system prompt sẽ phá phần tiền tố dùng chung
    của cả phiên.
    """
    if remaining_seconds > WRAP_UP_SECONDS:
        return text

    return (
        f"{text}\n\n"
        f"[Chỉ thị sân khấu: phiên chỉ còn khoảng {max(remaining_seconds, 0)} giây. "
        "Hãy lái cuộc trò chuyện về phần kết một cách tự nhiên - chốt lại việc đang "
        "làm rồi chào tạm biệt. Đừng mở chủ đề mới.]"
    )


def summary_system(topic: Topic) -> str:
    """System prompt cho bản tổng kết cuối phiên.

    Ở đây AI CỞI BỎ vai diễn và trở thành giáo viên - đó là lý do nó là một
    lời gọi riêng chứ không phải lượt cuối của cuộc hội thoại.
    """
    return f"""Bạn là giáo viên tiếng Nhật người Việt, đang nhận xét một buổi luyện hội thoại vừa kết thúc.

Tình huống vừa luyện: {topic.title} — {topic.description}
Mục tiêu đặt ra: {topic.goal}
Trình độ người học: {topic.level}

# Nhiệm vụ
Đọc toàn bộ đoạn hội thoại rồi viết bản tổng kết cho NGƯỜI HỌC (không phải cho giáo viên khác).

# Quy tắc bắt buộc
- Toàn bộ phần giải thích viết bằng TIẾNG VIỆT. Chỉ ví dụ mới bằng tiếng Nhật.
- Chỉ nhận xét những gì THẬT SỰ có trong đoạn hội thoại. Tuyệt đối không bịa lỗi
  người học chưa từng mắc, không bịa câu họ chưa từng nói.
- "mistakes": trích nguyên văn câu sai của người học vào "original". Nếu cả phiên
  không có lỗi nào đáng kể thì trả mảng rỗng, đừng cố nặn ra cho đủ.
- "grammarPoints": chỉ nêu mẫu ngữ pháp LIÊN QUAN tới lỗi hoặc tới điều họ đã cố
  diễn đạt mà chưa được. Mỗi mẫu kèm một ví dụ dùng đúng.
- "naturalnessTips": phần quan trọng nhất - câu đúng ngữ pháp nhưng nghe không
  giống người bản xứ, và cách người Nhật thật sự nói. Không có thì trả mảng rỗng.
- "score": chấm theo mức độ hoàn thành mục tiêu, độ chính xác và độ tự nhiên.
  Người học mới bắt đầu mà dám nói hết phiên thì không nên dưới 50.
- Giọng văn động viên nhưng trung thực. Không sáo rỗng, không tâng bốc.
- Nếu người học gần như không nói gì (dưới 2 lượt), hãy nói thẳng điều đó trong
  "overallVi", để "score" thấp và các mảng còn lại rỗng."""


def summary_user_message(
    transcript: str, turn_count: int, duration_seconds: int
) -> str:
    minutes = max(1, round(duration_seconds / 60))
    return (
        f"Đoạn hội thoại vừa diễn ra ({turn_count} lượt của người học, "
        f"khoảng {minutes} phút):\n\n"
        f"{transcript}\n\n"
        "Hãy viết bản tổng kết theo đúng lược đồ JSON được yêu cầu."
    )
