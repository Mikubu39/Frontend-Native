"""Đánh giá TẦNG HỘI THOẠI (FSM) - thứ mà `evaluate.py` không nhìn thấy.

Chạy:  python -m nihongo_ai.evaluate_dialogue

Vì sao cần script riêng
-----------------------
`evaluate.py` đo bộ phân loại, `evaluate_system.py` đo bộ phân loại + luật
quyết định. Cả hai đều DỪNG TRƯỚC máy trạng thái. Nhưng người học không nói
chuyện với bộ phân loại - họ nói chuyện với FSM. Một mô hình hoàn hảo vẫn cho
trải nghiệm tệ nếu FSM từ chối những câu nó hiểu đúng.

Hai độ đo
---------
1. ĐỘ PHỦ CẤU TRÚC - phần trăm cặp (trạng thái x ý định hợp lệ) mà máy hội
   thoại có câu đáp. Đo trên sơ đồ, không cần mô hình.

2. PHÁT LẠI THẬT - đưa TOÀN BỘ câu trong tập huấn luyện qua MỌI trạng thái
   của kịch bản tương ứng, đếm phân bố kết cục. Đây là thứ gần nhất với trải
   nghiệm thật: người học có thể nói bất cứ câu nào ở bất cứ đâu.

Độ đo quan trọng nhất là WRONG_TIME TRÊN CÂU XÃ GIAO. Bot bảo "cảm ơn" là
"chưa hợp bước này" thì không có cách nào biện minh được - khác hẳn với việc
chặn đòi hoá đơn khi khách chưa ngồi vào bàn, vốn là chặn ĐÚNG.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

from .classifier import IntentClassifier
from .dataset import OUT_OF_SCOPE, load_dataset
from .dialogue import DialogueEngine, TurnOutcome, load_scenarios

#: Ý định xã giao: luôn tự nhiên ở mọi thời điểm của mọi cuộc hội thoại.
#: `wrong_time` trên nhóm này luôn là lỗi thiết kế.
SOCIAL_INTENTS = frozenset(
    {"thanks", "apologize", "greeting", "farewell", "not_understand", "meta_about_bot"}
)


def structural_coverage(scenarios, data) -> dict:
    """Bao nhiêu cặp (trạng thái, ý định) có đường đi? Không cần mô hình."""
    per_scenario: dict[str, dict] = {}
    total_pairs = total_reachable = 0

    for sid, scenario in sorted(scenarios.items()):
        valid = [i for i in data.intents_for_scenario(sid) if i != OUT_OF_SCOPE]
        pairs = reachable = 0
        holes: list[tuple[str, str]] = []

        for state in scenario.states.values():
            if state.terminal:
                continue
            for intent in valid:
                pairs += 1
                if _has_route(scenario, state, intent):
                    reachable += 1
                else:
                    holes.append((state.id, intent))

        per_scenario[sid] = {
            "pairs": pairs,
            "reachable": reachable,
            "coverage": reachable / pairs if pairs else 0.0,
            "holes": holes,
        }
        total_pairs += pairs
        total_reachable += reachable

    return {
        "per_scenario": per_scenario,
        "pairs": total_pairs,
        "reachable": total_reachable,
        "coverage": total_reachable / total_pairs if total_pairs else 0.0,
    }


def _has_route(scenario, state, intent: str) -> bool:
    """Máy hội thoại có câu đáp cho ý định này ở trạng thái này không?

    Ba nguồn, theo đúng thứ tự tra cứu của `DialogueEngine._decide`:
    kịch bản của trạng thái -> khối `anytime` của kịch bản -> tập luôn cho phép.
    Hai nguồn sau chưa tồn tại ở bản gốc, nên `getattr` để script chạy được
    trên CẢ hai bản, phục vụ so sánh trước/sau.
    """
    if intent in state.expects:
        return True
    if intent in getattr(scenario, "anytime", {}):
        return True

    from . import dialogue

    return intent in getattr(dialogue, "ALWAYS_ALLOWED", {dialogue.META_INTENT})


def replay(engine, scenarios, data) -> dict:
    """Phát lại mọi câu huấn luyện qua mọi trạng thái. Đếm kết cục."""
    outcomes: Counter = Counter()
    social_outcomes: Counter = Counter()
    per_scenario: dict[str, Counter] = defaultdict(Counter)
    examples_by_intent: dict[str, list[str]] = defaultdict(list)

    for spec in data.specs:
        if spec.intent == OUT_OF_SCOPE:
            continue
        examples_by_intent[spec.intent].extend(spec.examples)

    for sid, scenario in sorted(scenarios.items()):
        valid = [i for i in data.intents_for_scenario(sid) if i != OUT_OF_SCOPE]
        for state in scenario.states.values():
            if state.terminal:
                continue
            for intent in valid:
                for text in examples_by_intent[intent]:
                    result = engine.respond(sid, state.id, text, 0)
                    key = result.outcome.value
                    outcomes[key] += 1
                    per_scenario[sid][key] += 1
                    if intent in SOCIAL_INTENTS:
                        social_outcomes[key] += 1

    return {
        "outcomes": dict(outcomes),
        "social_outcomes": dict(social_outcomes),
        "per_scenario": {k: dict(v) for k, v in per_scenario.items()},
        "n_turns": sum(outcomes.values()),
    }


def main() -> None:
    data = load_dataset(strict=False)
    scenarios = load_scenarios()
    engine = DialogueEngine(IntentClassifier.load(), scenarios)

    struct = structural_coverage(scenarios, data)
    played = replay(engine, scenarios, data)

    total = played["n_turns"]
    wrong_time = played["outcomes"].get(TurnOutcome.WRONG_TIME.value, 0)
    social_total = sum(played["social_outcomes"].values())
    social_wrong = played["social_outcomes"].get(TurnOutcome.WRONG_TIME.value, 0)

    print()
    print("=" * 68)
    print("ĐÁNH GIÁ TẦNG HỘI THOẠI (FSM)")
    print("=" * 68)

    print(f"\n1. ĐỘ PHỦ CẤU TRÚC  (cặp trạng-thái x ý-định có đường đi)")
    for sid, s in struct["per_scenario"].items():
        print(f"  {sid:<12} {s['reachable']:>4}/{s['pairs']:<4} = {s['coverage']:6.1%}")
    print(
        f"  {'TỔNG':<12} {struct['reachable']:>4}/{struct['pairs']:<4} "
        f"= {struct['coverage']:6.1%}"
    )

    print(f"\n2. PHÁT LẠI THẬT  (n={total} lượt)")
    for key, count in sorted(played["outcomes"].items(), key=lambda kv: -kv[1]):
        print(f"  {key:<18} {count:>6}  {count / total:6.1%}")

    print(f"\n3. CÂU XÃ GIAO  (n={social_total} lượt) - wrong_time ở đây LUÔN là lỗi")
    for key, count in sorted(played["social_outcomes"].items(), key=lambda kv: -kv[1]):
        print(f"  {key:<18} {count:>6}  {count / social_total:6.1%}")

    print(f"\n{'-' * 68}")
    print(f"WRONG_TIME tổng thể      : {wrong_time}/{total} = {wrong_time / total:.1%}")
    print(
        f"WRONG_TIME trên câu xã giao: {social_wrong}/{social_total} "
        f"= {social_wrong / social_total:.1%}"
    )
    print(f"{'-' * 68}")

    payload = {
        "structural_coverage": struct,
        "replay": played,
        "wrong_time_rate": wrong_time / total,
        "social_wrong_time_rate": social_wrong / social_total if social_total else 0.0,
    }
    out = Path(__file__).resolve().parents[2] / "reports" / "dialogue-metrics.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nĐã ghi {out}")


if __name__ == "__main__":
    main()
