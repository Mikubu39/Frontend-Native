"""FastAPI service cho tính năng luyện hội thoại (chạy trên Gemini).

Chạy:  uvicorn nihongo_ai.api:app --reload --port 8000

Thiết kế PHI TRẠNG THÁI (stateless): client giữ lịch sử hội thoại và đồng hồ
đếm ngược rồi gửi kèm mỗi lượt. Lý do:

  * Gói hosting miễn phí hay ngủ đông và khởi động lại container -> phiên lưu
    trong RAM sẽ bốc hơi giữa chừng cuộc hội thoại.
  * Không cần Redis/DB -> hạ tầng bằng không, đúng ràng buộc "không tốn phí".
  * Scale ngang thoải mái mà không cần sticky session.

Vì sao đồng hồ 5 phút do CLIENT giữ chứ không phải server
----------------------------------------------------------
Server không có phiên thì cũng không có "lúc bắt đầu" để trừ đi. Client gửi
`remainingSeconds` ở mỗi lượt, và server chỉ dùng con số đó để nhắc model lái
hội thoại về phần kết. Người dùng khai gian được, nhưng gian lận ở đây chỉ có
nghĩa là "tự cho mình luyện thêm vài phút" - không đáng để dựng hạ tầng phiên.
"""

from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import __version__, engine, llm, prompts, topics
from .topics import CUSTOM_TOPIC_ID, MAX_CUSTOM_TOPIC_LENGTH, Topic

# Nạp `ai-service/.env` NGAY khi khởi động, trước mọi lần đọc khoá. Chỉ có tác
# dụng lúc phát triển; trên hosting thật thì file không tồn tại và khoá đi qua
# biến môi trường của nền tảng. Đặt ở đây chứ không phải trong `llm.py` để việc
# import `llm` (ví dụ trong test) không kéo theo tác dụng phụ lên `os.environ`.
llm.load_env_file()

app = FastAPI(
    title="Nihongo Conversation AI",
    version=__version__,
    description=(
        "Luyện hội thoại tiếng Nhật theo chủ đề bằng LLM (Gemini), "
        "kèm tổng kết lỗi cuối mỗi phiên 5 phút."
    ),
)

# App di động gọi từ origin bất kỳ; service này không giữ cookie hay session.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
class UtteranceOut(BaseModel):
    ja: str = ""
    vi: str = ""


class TopicOut(BaseModel):
    id: str
    title: str
    titleJa: str
    level: str
    icon: str
    color: str
    description: str
    goal: str
    personaName: str
    personaEmoji: str


class CorrectionOut(BaseModel):
    severity: Literal["error", "suggestion", "praise"]
    category: Literal[
        "grammar", "vocabulary", "politeness", "naturalness", "spelling"
    ]
    original: str = ""
    suggestion: str = ""
    explanationVi: str = ""


class HistoryTurnIn(BaseModel):
    role: Literal["ai", "user"]
    text: str = Field(max_length=1000)


class TopicRef(BaseModel):
    """Phần định danh chủ đề, lặp lại ở cả ba endpoint vì service phi trạng thái."""

    topicId: str
    #: Chỉ dùng khi `topicId == "custom"`: chủ đề người học tự gõ.
    customTopic: str | None = Field(default=None, max_length=MAX_CUSTOM_TOPIC_LENGTH)


class StartRequest(TopicRef):
    pass


class StartResponse(BaseModel):
    topic: TopicOut
    reply: UtteranceOut
    hints: list[UtteranceOut]
    #: Độ dài phiên, do server quyết định để client không tự đặt luật riêng.
    durationSeconds: int


class RespondRequest(TopicRef):
    text: str = Field(max_length=500)
    history: list[HistoryTurnIn] = Field(default_factory=list, max_length=60)
    remainingSeconds: int = Field(default=prompts.SESSION_MINUTES * 60, ge=0, le=3600)


class RespondResponse(BaseModel):
    reply: UtteranceOut
    hints: list[UtteranceOut]
    corrections: list[CorrectionOut]
    understood: bool


class SummaryRequest(TopicRef):
    history: list[HistoryTurnIn] = Field(default_factory=list, max_length=60)
    durationSeconds: int = Field(default=prompts.SESSION_MINUTES * 60, ge=0, le=3600)


class MistakeOut(BaseModel):
    original: str
    corrected: str = ""
    explanationVi: str
    category: str = "grammar"
    severity: str = "error"


class GrammarPointOut(BaseModel):
    pattern: str
    explanationVi: str
    exampleJa: str = ""
    exampleVi: str = ""


class NaturalnessTipOut(BaseModel):
    instead: str = ""
    prefer: str
    whyVi: str


class SummaryResponse(BaseModel):
    overallVi: str
    score: int
    strengths: list[str]
    mistakes: list[MistakeOut]
    grammarPoints: list[GrammarPointOut]
    naturalnessTips: list[NaturalnessTipOut]
    nextFocus: list[str]
    turnCount: int
    durationSeconds: int


# ---------------------------------------------------------------------------
# Trợ giúp
# ---------------------------------------------------------------------------
def _to_topic_out(topic: Topic) -> TopicOut:
    return TopicOut(
        id=topic.id,
        title=topic.title,
        titleJa=topic.title_ja,
        level=topic.level,
        icon=topic.icon,
        color=topic.color,
        description=topic.description,
        goal=topic.goal,
        personaName=topic.persona_name,
        personaEmoji=topic.persona_emoji,
    )


def _resolve_topic(ref: TopicRef) -> Topic:
    """Tra chủ đề, hoặc ném lỗi HTTP đã có sẵn thông điệp tiếng Việt."""
    topic = topics.resolve(ref.topicId, ref.customTopic)
    if topic is not None:
        return topic

    if ref.topicId == CUSTOM_TOPIC_ID:
        raise HTTPException(400, "Bạn chưa nhập chủ đề muốn luyện.")
    raise HTTPException(404, f"Không có chủ đề '{ref.topicId}'.")


def _history(turns: list[HistoryTurnIn]) -> list[engine.HistoryTurn]:
    return [
        engine.HistoryTurn(role=turn.role, text=turn.text)
        for turn in turns
        if turn.text.strip()
    ]


def _guard_llm() -> None:
    """Chặn sớm khi chưa cấu hình khoá, để lỗi nói đúng nguyên nhân.

    Không có bước này thì mọi endpoint đều trả 502 "gọi Gemini thất bại" -
    đúng về kỹ thuật nhưng vô dụng với người đang dựng môi trường.
    """
    if not llm.is_configured():
        raise HTTPException(
            503,
            "Máy chủ AI chưa được cấu hình khoá Gemini (biến môi trường "
            "GEMINI_API_KEY). Xem ai-service/README.md.",
        )


def _call(fn, *args, **kwargs):
    """Chạy một lời gọi LLM và đổi mọi lỗi của nó thành HTTP 502.

    Chọn 502 chứ không phải 500: lỗi nằm ở dịch vụ THƯỢNG NGUỒN (Gemini), và
    phân biệt được hai loại này rất đáng giá lúc đọc log sự cố.
    """
    try:
        return fn(*args, **kwargs)
    except llm.LlmNotConfigured as exc:
        raise HTTPException(503, str(exc)) from exc
    except llm.LlmError as exc:
        raise HTTPException(502, str(exc)) from exc


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
def health() -> dict:
    """Trạng thái dịch vụ. KHÔNG bao giờ lộ giá trị khoá, chỉ lộ có/không."""
    return {
        "status": "ok" if llm.is_configured() else "unconfigured",
        "version": __version__,
        "provider": "gemini",
        "model": llm.model_name(),
        "sessionSeconds": prompts.SESSION_MINUTES * 60,
    }


@app.get("/api/v1/conversation/topics", response_model=list[TopicOut])
def list_topics() -> list[TopicOut]:
    return [_to_topic_out(topic) for topic in topics.load_topics().values()]


@app.post("/api/v1/conversation/start", response_model=StartResponse)
def start(request: StartRequest) -> StartResponse:
    _guard_llm()
    topic = _resolve_topic(request)
    result = _call(engine.open_session, topic)

    return StartResponse(
        topic=_to_topic_out(topic),
        reply=UtteranceOut(**result["reply"]),
        hints=[UtteranceOut(**hint) for hint in result["hints"]],
        durationSeconds=prompts.SESSION_MINUTES * 60,
    )


@app.post("/api/v1/conversation/respond", response_model=RespondResponse)
def respond(request: RespondRequest) -> RespondResponse:
    _guard_llm()
    topic = _resolve_topic(request)

    if not request.text.strip():
        raise HTTPException(400, "Bạn chưa nhập câu nào.")

    result = _call(
        engine.respond,
        topic,
        _history(request.history),
        request.text.strip(),
        request.remainingSeconds,
    )

    return RespondResponse(
        reply=UtteranceOut(**result["reply"]),
        hints=[UtteranceOut(**hint) for hint in result["hints"]],
        corrections=[CorrectionOut(**item) for item in result["corrections"]],
        understood=result["understood"],
    )


@app.post("/api/v1/conversation/summary", response_model=SummaryResponse)
def summary(request: SummaryRequest) -> SummaryResponse:
    _guard_llm()
    topic = _resolve_topic(request)
    history = _history(request.history)

    if not any(turn.role == "user" for turn in history):
        raise HTTPException(
            400, "Chưa có lượt nói nào của bạn nên chưa tổng kết được."
        )

    result = _call(engine.summarize, topic, history, request.durationSeconds)
    return SummaryResponse(**result)
