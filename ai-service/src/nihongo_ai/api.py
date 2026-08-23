"""FastAPI service cho tính năng luyện hội thoại.

Chạy:  uvicorn nihongo_ai.api:app --reload --port 8000

Thiết kế PHI TRẠNG THÁI (stateless): client giữ `state` và `consecutiveFailures`
rồi gửi kèm mỗi lượt. Lý do:

  * Gói hosting miễn phí hay ngủ đông và khởi động lại container -> phiên lưu
    trong RAM sẽ bốc hơi giữa chừng cuộc hội thoại.
  * Không cần Redis/DB -> hạ tầng bằng không, đúng ràng buộc "không tốn phí".
  * Scale ngang thoải mái mà không cần sticky session.

Đổi lại, client phải trung thực về trạng thái của mình. Với một app học tập
thì rủi ro gian lận gần như bằng không (tự khai gian chỉ tự làm hỏng bài học
của chính mình), nên đánh đổi này chấp nhận được.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import __version__, grammar
from .classifier import IntentClassifier
from .dialogue import DialogueEngine, Scenario, load_scenarios

# Điền trong lifespan lúc khởi động.
_engine: DialogueEngine | None = None
_scenarios: dict[str, Scenario] = {}
_model_card: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Nạp mô hình MỘT LẦN lúc khởi động, không phải mỗi request."""
    global _engine, _scenarios, _model_card

    import joblib

    from .classifier import default_model_path
    from .dataset import load_dataset

    path = default_model_path()
    if not path.exists():
        raise RuntimeError(
            f"Chưa có mô hình ở {path}. Chạy trước: python -m nihongo_ai.train"
        )

    bundle = joblib.load(path)
    _model_card = bundle.get("card", {})
    classifier = IntentClassifier(bundle["pipeline"], load_dataset(strict=False))
    _scenarios = load_scenarios()
    _engine = DialogueEngine(classifier, _scenarios)
    yield
    _engine = None


app = FastAPI(
    title="Nihongo Conversation AI",
    version=__version__,
    description="Phân loại ý định + máy hội thoại FSM để luyện giao tiếp tiếng Nhật.",
    lifespan=lifespan,
)

# App di động gọi từ origin bất kỳ; service này không giữ cookie hay session.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _require_engine() -> DialogueEngine:
    if _engine is None:
        raise HTTPException(status_code=503, detail="Mô hình chưa sẵn sàng")
    return _engine


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
class UtteranceOut(BaseModel):
    ja: str = ""
    vi: str = ""


class ScenarioSummary(BaseModel):
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


class StartRequest(BaseModel):
    scenarioId: str


class StartResponse(BaseModel):
    scenarioId: str
    state: str
    reply: UtteranceOut
    hints: list[UtteranceOut]


class GrammarNoteOut(BaseModel):
    kind: Literal["spelling", "politeness", "praise"]
    messageVi: str
    suggestion: str | None = None
    original: str | None = None


class RespondRequest(BaseModel):
    scenarioId: str
    state: str
    text: str = Field(max_length=500)
    consecutiveFailures: int = Field(default=0, ge=0, le=99)


class RespondResponse(BaseModel):
    outcome: str
    reply: UtteranceOut
    state: str
    hints: list[UtteranceOut]
    intent: str | None
    confidence: float
    consecutiveFailures: int
    rescue: bool
    completed: bool
    grammarNotes: list[GrammarNoteOut]
    #: Chỉ có ở chế độ debug - dùng để dựng màn hình "vì sao bot hiểu vậy".
    alternatives: list[dict]


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
def health() -> dict:
    return {
        "status": "ok" if _engine is not None else "loading",
        "version": __version__,
        "model": _model_card,
    }


@app.get("/api/v1/conversation/scenarios", response_model=list[ScenarioSummary])
def list_scenarios() -> list[ScenarioSummary]:
    _require_engine()
    return [
        ScenarioSummary(
            id=s.id,
            title=s.title,
            titleJa=s.title_ja,
            level=s.level,
            icon=s.icon,
            color=s.color,
            description=s.description,
            goal=s.goal,
            personaName=s.persona.get("name", ""),
            personaEmoji=s.persona.get("emoji", "💬"),
        )
        for s in _scenarios.values()
    ]


@app.post("/api/v1/conversation/start", response_model=StartResponse)
def start(request: StartRequest) -> StartResponse:
    engine = _require_engine()
    if request.scenarioId not in _scenarios:
        raise HTTPException(404, f"Không có kịch bản '{request.scenarioId}'")

    turn = engine.start(request.scenarioId)
    return StartResponse(
        scenarioId=request.scenarioId,
        state=turn.next_state,
        reply=UtteranceOut(ja=turn.reply.ja, vi=turn.reply.vi),
        hints=[UtteranceOut(ja=h.ja, vi=h.vi) for h in turn.hints],
    )


@app.post("/api/v1/conversation/respond", response_model=RespondResponse)
def respond(request: RespondRequest) -> RespondResponse:
    engine = _require_engine()

    scenario = _scenarios.get(request.scenarioId)
    if scenario is None:
        raise HTTPException(404, f"Không có kịch bản '{request.scenarioId}'")
    if request.state not in scenario.states:
        raise HTTPException(
            400, f"Không có trạng thái '{request.state}' trong '{request.scenarioId}'"
        )

    turn = engine.respond(
        request.scenarioId,
        request.state,
        request.text,
        consecutive_failures=request.consecutiveFailures,
    )

    # Góp ý ngữ pháp chạy ĐỘC LẬP với việc hiểu ý định: một câu có thể hiểu
    # đúng mà vẫn sai chính tả, hoặc ngược lại.
    notes = [
        GrammarNoteOut(
            kind=n.kind.value,
            messageVi=n.message_vi,
            suggestion=n.suggestion,
            original=n.original,
        )
        for n in grammar.analyse(request.text)
    ]

    return RespondResponse(
        outcome=turn.outcome.value,
        reply=UtteranceOut(ja=turn.reply.ja, vi=turn.reply.vi),
        state=turn.next_state,
        hints=[UtteranceOut(ja=h.ja, vi=h.vi) for h in turn.hints],
        intent=turn.intent,
        confidence=round(turn.confidence, 4),
        consecutiveFailures=turn.consecutive_failures,
        rescue=turn.rescue,
        completed=turn.completed,
        grammarNotes=notes,
        alternatives=[
            {"intent": intent, "probability": prob}
            for intent, prob in turn.alternatives
        ],
    )
