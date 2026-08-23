"""Máy hội thoại: kịch bản FSM + biến mọi lỗi thành một lượt dạy học.

Đây là tầng an toàn THỨ BA, sau tầng chặn và ngưỡng tin cậy. Kể cả khi bộ phân
loại tự tin và SAI, FSM vẫn thường cứu được: nếu ý định đoán ra không nằm
trong `expects` của trạng thái hiện tại, bot sẽ không hành động theo nó mà
đáp lại bằng câu "câu đó đúng tiếng Nhật, nhưng lúc này thì chưa hợp".

Nguyên tắc thiết kế bao trùm
----------------------------
Không bao giờ có ngõ cụt. Mọi nhánh - kể cả nhánh "mình không hiểu" - đều
kết thúc bằng một gợi ý cụ thể mà người học có thể gõ theo. Thất bại của mô
hình trở thành nội dung dạy học, không phải thông báo lỗi.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

import yaml

from .classifier import IntentClassifier, Prediction, PredictionStatus
from .dataset import OUT_OF_SCOPE
from .guards import RejectReason

#: Sau ngần này lượt hỏng liên tiếp, bot chủ động đưa đáp án và cho đi tiếp.
STUCK_AFTER = 3

#: Ý định "xin trợ giúp / hỏi về app". Được phục vụ ở MỌI trạng thái nên nó
#: không bao giờ đi qua bảng `expects` của kịch bản.
META_INTENT = "meta_about_bot"

#: Ý định XÃ GIAO: luôn tự nhiên ở mọi thời điểm của mọi cuộc hội thoại.
#:
#: Trả "chưa hợp bước này" cho một câu cảm ơn là điều không cách nào biện minh
#: được - người thật không bao giờ làm vậy. Nhóm này đi vòng qua `expects`,
#: giữ nguyên trạng thái và KHÔNG tính vào chuỗi hỏng.
#:
#: Lưu ý thứ tự tra cứu: `expects` của trạng thái vẫn được xét TRƯỚC, nên kịch
#: bản nào đã viết riêng cho `thanks` / `farewell` (ví dụ `paying` ở nhà hàng
#: kết thúc bằng lời cảm ơn) thì kịch bản đó vẫn thắng. Nhóm này chỉ là lưới
#: đỡ cho những trạng thái KHÔNG viết gì.
ALWAYS_ALLOWED = frozenset(
    {META_INTENT, "thanks", "apologize", "greeting", "farewell", "not_understand"}
)


class TurnOutcome(str, Enum):
    """Chuyện gì đã xảy ra ở lượt này - client dùng để chọn cách hiển thị."""

    ADVANCED = "advanced"          # hiểu đúng, hội thoại tiến lên
    COMPLETED = "completed"        # vừa tới trạng thái kết thúc
    REPEAT = "repeat"              # hiểu đúng nhưng ở nguyên trạng thái
    OFF_TOPIC = "off_topic"        # lạc đề - điều hướng lại
    WRONG_TIME = "wrong_time"      # câu đúng nhưng chưa hợp lúc này
    CLARIFY = "clarify"            # phân vân giữa hai ý định - hỏi lại
    NOT_UNDERSTOOD = "not_understood"  # tin cậy thấp
    INVALID_INPUT = "invalid_input"    # bị tầng chặn từ chối


@dataclass(frozen=True)
class Utterance:
    ja: str = ""
    vi: str = ""


@dataclass(frozen=True)
class ScenarioState:
    id: str
    bot: tuple[Utterance, ...]
    hints: tuple[Utterance, ...]
    #: intent -> (câu đáp, trạng thái kế tiếp)
    expects: dict[str, tuple[Utterance, str]]
    terminal: bool = False


@dataclass(frozen=True)
class Scenario:
    id: str
    title: str
    title_ja: str
    level: str
    icon: str
    color: str
    description: str
    goal: str
    persona: dict
    initial_state: str
    states: dict[str, ScenarioState]
    #: Ý định hợp lệ ở MỌI trạng thái của kịch bản này, kèm câu đáp dùng chung.
    #:
    #: Nhiều câu hỏi vốn không có thứ tự: hỏi đường thì "ở đâu" / "đi thế nào"
    #: / "mất bao lâu" đều tự nhiên ở bất kỳ đâu, và phần tự giới thiệu thì
    #: tên / quê / nghề / sở thích lại càng không có trình tự bắt buộc. Khai
    #: báo một lần ở đây thay vì chép cùng một cạnh vào từng trạng thái.
    #:
    #: Giữ nguyên trạng thái và không tính là hỏng. `expects` xét trước, nên
    #: khi câu đó đúng là bước đang chờ thì hội thoại vẫn tiến lên bình thường.
    anytime: dict[str, Utterance] = field(default_factory=dict)

    def state(self, state_id: str) -> ScenarioState:
        return self.states[state_id]


@dataclass
class TurnResult:
    outcome: TurnOutcome
    reply: Utterance
    next_state: str
    hints: list[Utterance] = field(default_factory=list)
    intent: str | None = None
    confidence: float = 0.0
    #: Đếm số lượt hỏng LIÊN TIẾP - dùng để quyết định khi nào cần cứu.
    consecutive_failures: int = 0
    #: Bật khi người học kẹt quá lâu: lộ luôn đáp án mẫu.
    rescue: bool = False
    completed: bool = False
    alternatives: list[tuple[str, float]] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Nạp kịch bản
# ---------------------------------------------------------------------------
def _utterances(raw) -> tuple[Utterance, ...]:
    if not raw:
        return ()
    return tuple(Utterance(ja=u.get("ja", ""), vi=u.get("vi", "")) for u in raw)


def load_scenarios(data_dir: Path | None = None) -> dict[str, Scenario]:
    directory = data_dir or (
        Path(__file__).resolve().parents[2] / "data" / "scenarios"
    )
    scenarios: dict[str, Scenario] = {}

    for path in sorted(directory.glob("*.yaml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        states: dict[str, ScenarioState] = {}

        for entry in raw["states"]:
            expects: dict[str, tuple[Utterance, str]] = {}
            for rule in entry.get("expects", []) or []:
                reply = rule.get("reply", {}) or {}
                expects[rule["intent"]] = (
                    Utterance(ja=reply.get("ja", ""), vi=reply.get("vi", "")),
                    rule["next"],
                )
            states[entry["id"]] = ScenarioState(
                id=entry["id"],
                bot=_utterances(entry.get("bot")),
                hints=_utterances(entry.get("hints")),
                expects=expects,
                terminal=bool(entry.get("terminal", False)),
            )

        anytime: dict[str, Utterance] = {}
        for rule in raw.get("anytime", []) or []:
            reply = rule.get("reply", {}) or {}
            anytime[rule["intent"]] = Utterance(
                ja=reply.get("ja", ""), vi=reply.get("vi", "")
            )

        scenario = Scenario(
            id=raw["id"],
            title=raw["title"],
            title_ja=raw.get("title_ja", ""),
            level=raw.get("level", "N5"),
            icon=raw.get("icon", "chatbubbles-outline"),
            color=raw.get("color", "#7C5CFF"),
            description=raw.get("description", ""),
            goal=raw.get("goal", ""),
            persona=raw.get("persona", {}),
            initial_state=raw["initial_state"],
            states=states,
            anytime=anytime,
        )

        # Kiểm tra tính toàn vẹn của FSM: mọi `next` phải trỏ tới state có thật,
        # và phải có ít nhất một đường tới trạng thái kết thúc.
        for state in states.values():
            for intent, (_, nxt) in state.expects.items():
                if nxt not in states:
                    raise ValueError(
                        f"{path.name}: state '{state.id}' (ý định '{intent}') "
                        f"trỏ tới state không tồn tại '{nxt}'"
                    )
        if not any(s.terminal for s in states.values()):
            raise ValueError(f"{path.name}: không có trạng thái kết thúc nào")

        scenarios[scenario.id] = scenario
    return scenarios


# ---------------------------------------------------------------------------
# Câu đáp khi hỏng - luôn kèm gợi ý, không bao giờ là ngõ cụt
# ---------------------------------------------------------------------------
_GUARD_REPLIES: dict[RejectReason, Utterance] = {
    RejectReason.EMPTY: Utterance(
        ja="はい？", vi="Bạn thử viết một câu tiếng Nhật xem nhé."
    ),
    RejectReason.TOO_SHORT: Utterance(
        ja="すみません、もう少し長く言ってください。",
        vi="Câu hơi ngắn nên mình chưa đoán được ý. Thử viết đầy đủ hơn nhé.",
    ),
    RejectReason.TOO_LONG: Utterance(
        ja="ちょっと長いですね。短く言ってみてください。",
        vi="Câu dài quá. Thử nói ngắn gọn lại xem nào.",
    ),
    RejectReason.WRONG_SCRIPT: Utterance(
        ja="日本語で話しましょう。",
        vi="Mình chỉ hiểu tiếng Nhật thôi. Thử gõ bằng hiragana/katakana/kanji nhé!",
    ),
    RejectReason.GIBBERISH: Utterance(
        ja="すみません、よく分かりませんでした。",
        vi="Mình chưa đọc được câu này. Thử lại bằng một câu tiếng Nhật nhé.",
    ),
    RejectReason.NO_LETTERS: Utterance(
        ja="すみません、よく分かりませんでした。",
        vi="Mình cần một câu có chữ để hiểu được. Thử lại nhé!",
    ),
}


#: Câu đáp cho ý định xã giao khi trạng thái hiện tại KHÔNG viết riêng.
#: Cố ý trung tính để nghe lọt tai ở mọi kịch bản và mọi vai (nhân viên phục
#: vụ, người qua đường, bạn cùng lớp).
#:
#: `meta_about_bot` và `not_understand` không nằm ở đây: cả hai cần trích câu
#: gợi ý của trạng thái hiện tại nên được dựng động trong `_social_reply`.
_SOCIAL_REPLIES: dict[str, Utterance] = {
    "thanks": Utterance(
        ja="いえいえ、どういたしまして。", vi="Không có gì đâu."
    ),
    "apologize": Utterance(
        ja="いえいえ、大丈夫ですよ。", vi="Không sao đâu mà."
    ),
    "greeting": Utterance(ja="こんにちは！", vi="Chào bạn!"),
    "farewell": Utterance(
        ja="はい、また会いましょう。気をつけてね。",
        vi="Ừ, hẹn gặp lại nhé. Bạn đi cẩn thận.",
    ),
}


class DialogueEngine:
    """Chạy một lượt hội thoại: câu người dùng -> câu đáp + trạng thái mới."""

    def __init__(
        self, classifier: IntentClassifier, scenarios: dict[str, Scenario]
    ) -> None:
        self.classifier = classifier
        self.scenarios = scenarios

    def start(self, scenario_id: str) -> TurnResult:
        scenario = self.scenarios[scenario_id]
        state = scenario.state(scenario.initial_state)
        return TurnResult(
            outcome=TurnOutcome.ADVANCED,
            reply=state.bot[0] if state.bot else Utterance(),
            next_state=state.id,
            hints=list(state.hints),
        )

    def respond(
        self,
        scenario_id: str,
        state_id: str,
        text: str,
        consecutive_failures: int = 0,
    ) -> TurnResult:
        scenario = self.scenarios[scenario_id]
        state = scenario.state(state_id)
        prediction = self.classifier.predict(text, scenario_id)

        result = self._decide(scenario, state, prediction, consecutive_failures)

        # Khi tiến lên, ghép thêm câu mở đầu của trạng thái mới (nếu có) để
        # người dùng không phải chờ thêm một lượt mới thấy bot nói tiếp.
        if result.outcome in (TurnOutcome.ADVANCED, TurnOutcome.COMPLETED):
            nxt = scenario.state(result.next_state)
            if nxt.bot:
                lead = nxt.bot[0]
                result.reply = Utterance(
                    ja=f"{result.reply.ja} {lead.ja}".strip(),
                    vi=f"{result.reply.vi} {lead.vi}".strip(),
                )
            result.hints = list(nxt.hints)
        return result

    # -- luật quyết định -------------------------------------------------
    def _decide(
        self,
        scenario: Scenario,
        state: ScenarioState,
        prediction: Prediction,
        failures: int,
    ) -> TurnResult:
        hints = list(state.hints)

        def failed(outcome: TurnOutcome, reply: Utterance) -> TurnResult:
            count = failures + 1
            return TurnResult(
                outcome=outcome,
                reply=reply,
                next_state=state.id,
                hints=hints,
                intent=prediction.intent,
                confidence=prediction.confidence,
                consecutive_failures=count,
                # Kẹt quá lâu -> lộ đáp án mẫu để người học đi tiếp được.
                rescue=count >= STUCK_AFTER,
                alternatives=prediction.alternatives,
            )

        # 1. Tầng chặn từ chối.
        if prediction.status is PredictionStatus.REJECTED:
            reply = _GUARD_REPLIES.get(
                prediction.reject_reason,
                Utterance(vi="Mình chưa hiểu câu này. Thử lại nhé!"),
            )
            return failed(TurnOutcome.INVALID_INPUT, reply)

        # 2. Mô hình nhận ra là lạc đề -> điều hướng lại, KHÔNG mắng.
        if prediction.status is PredictionStatus.OUT_OF_SCOPE:
            return failed(
                TurnOutcome.OFF_TOPIC,
                Utterance(
                    ja="すみません、ちょっと分かりません。",
                    vi=(
                        f"Câu này hơi lạc khỏi tình huống '{scenario.title}' rồi. "
                        "Thử một trong các câu gợi ý bên dưới nhé!"
                    ),
                ),
            )

        # 3. Tin cậy thấp -> hỏi lại, nhưng vẫn kèm gợi ý.
        if prediction.status is PredictionStatus.LOW_CONFIDENCE:
            return failed(
                TurnOutcome.NOT_UNDERSTOOD,
                Utterance(
                    ja="すみません、もう一度お願いします。",
                    vi="Mình chưa chắc hiểu đúng ý bạn. Thử nói cách khác xem nhé.",
                ),
            )

        # 4. Phân vân giữa hai ý định -> hỏi lại cho rõ. Đây là chỗ biến điểm
        #    yếu của mô hình thành một lượt hội thoại tự nhiên.
        if prediction.status is PredictionStatus.AMBIGUOUS:
            options = [
                intent for intent, _ in prediction.alternatives[:2] if intent
            ]
            return failed(
                TurnOutcome.CLARIFY,
                Utterance(
                    ja="すみません、どちらでしょうか。",
                    vi=(
                        "Mình đang phân vân giữa hai ý. Bạn nói rõ hơn một chút "
                        f"được không? ({' / ' .join(options)})"
                    ),
                ),
            )

        intent = prediction.intent or OUT_OF_SCOPE

        def stay(reply: Utterance) -> TurnResult:
            """Hiểu đúng, đáp lại, ở NGUYÊN bước - và không tính là hỏng."""
            return TurnResult(
                outcome=TurnOutcome.REPEAT,
                reply=reply,
                next_state=state.id,
                hints=hints,
                intent=intent,
                confidence=prediction.confidence,
                consecutive_failures=failures,  # giữ nguyên, không cộng thêm
                alternatives=prediction.alternatives,
            )

        # 5. Kịch bản của trạng thái được xét TRƯỚC TIÊN. Đây là đường đi soạn
        #    tay, mang ý đồ dạy học, nên nó luôn thắng hai lưới đỡ bên dưới -
        #    kể cả khi cùng một ý định cũng có mặt trong `anytime`.
        if intent in state.expects:
            reply, next_state_id = state.expects[intent]
            next_state = scenario.state(next_state_id)
            completed = next_state.terminal
            return TurnResult(
                outcome=TurnOutcome.COMPLETED if completed else (
                    TurnOutcome.REPEAT if next_state_id == state.id
                    else TurnOutcome.ADVANCED
                ),
                reply=reply,
                next_state=next_state_id,
                hints=list(next_state.hints),
                intent=intent,
                confidence=prediction.confidence,
                consecutive_failures=0,  # thành công -> reset chuỗi hỏng
                completed=completed,
                alternatives=prediction.alternatives,
            )

        # 6. Lưới đỡ 1 - câu hỏi vốn không có thứ tự trong kịch bản này.
        #    Chẳng ai bắt phải hỏi "ga ở đâu" xong mới được hỏi "đi thế nào".
        if intent in scenario.anytime:
            return stay(scenario.anytime[intent])

        # 7. Lưới đỡ 2 - câu xã giao, luôn tự nhiên ở mọi thời điểm.
        if intent in ALWAYS_ALLOWED:
            return stay(self._social_reply(intent, hints))

        # 8. Còn lại mới thật sự là sai bước: đòi hoá đơn khi chưa ngồi vào
        #    bàn, đòi trả tiền khi chưa chọn đồ. Ở ĐÂY `wrong_time` mới có giá
        #    trị dạy học - nó dạy trình tự, chứ không phạt cách diễn đạt.
        return failed(TurnOutcome.WRONG_TIME, self._wrong_time_reply(hints))

    # -- soạn câu đáp ----------------------------------------------------
    @staticmethod
    def _social_reply(intent: str, hints: list[Utterance]) -> Utterance:
        """Câu đáp xã giao khi trạng thái hiện tại không viết riêng.

        `meta_about_bot` và `not_understand` phải dựng động vì cả hai đều cần
        trích câu gợi ý của đúng bước đang đứng.
        """
        sample = hints[0] if hints else None

        if intent == META_INTENT:
            # Chủ động xin gợi ý là hành vi tốt - đưa thẳng câu mẫu.
            return Utterance(
                ja=sample.ja if sample else "",
                vi=(
                    f"Ở bước này bạn có thể nói: 「{sample.ja}」 ({sample.vi})"
                    if sample
                    else "Cứ thử một câu tiếng Nhật bất kỳ xem nhé!"
                ),
            )

        if intent == "not_understand":
            # "Mình không hiểu" -> nói lại chậm, kèm chính câu đang chờ.
            return Utterance(
                ja=(
                    f"ゆっくり言いますね。「{sample.ja}」"
                    if sample
                    else "すみません、ゆっくり言いますね。"
                ),
                vi=(
                    f"Mình nói chậm lại nhé. Bạn thử: 「{sample.ja}」 ({sample.vi})"
                    if sample
                    else "Mình nói chậm lại nhé."
                ),
            )

        return _SOCIAL_REPLIES[intent]

    @staticmethod
    def _wrong_time_reply(hints: list[Utterance]) -> Utterance:
        """Đúng tiếng Nhật nhưng sai bước - và phải nói rõ bước nào mới đúng.

        Bản cũ chỉ báo "chưa hợp bước này" rồi bỏ lửng, người học không có gì
        để bám vào. Nêu thẳng câu đang chờ thì lời từ chối biến thành một lượt
        dạy học.
        """
        sample = hints[0] if hints else None
        if sample:
            return Utterance(
                ja=f"はい…でも、今は「{sample.ja}」のほうがいいですよ。",
                vi=(
                    "Câu tiếng Nhật của bạn đúng rồi, chỉ là chưa hợp bước này. "
                    f"Ở đây thử: 「{sample.ja}」 ({sample.vi})"
                ),
            )
        return Utterance(
            ja="はい…でも、今はちょっと。",
            vi=(
                "Câu tiếng Nhật của bạn đúng rồi, nhưng ở bước này thì chưa hợp. "
                "Thử câu gợi ý bên dưới nhé!"
            ),
        )
