"""Đánh giá TOÀN HỆ THỐNG: tầng chặn + mô hình + luật quyết định.

Chạy:  python -m nihongo_ai.evaluate_system

`evaluate.py` đo riêng bộ phân loại. Script này đo thứ người dùng thực sự gặp:
toàn bộ chuỗi xử lý, có điều kiện kịch bản, kèm tầng chặn và ngưỡng tin cậy.

Độ đo quan trọng nhất là TỈ LỆ LỖI GÂY HẠI - phần trăm lượt mà bot tự tin
hành động theo một ý định SAI. Đây là kiểu lỗi duy nhất người dùng thực sự bị
tổn hại: bị hỏi lại thì hơi phiền nhưng vẫn dạy được, còn trả lời sai tự tin
thì làm người học bối rối và dạy sai luôn.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.model_selection import StratifiedKFold

from .classifier import (
    DEFAULT_MARGIN,
    DEFAULT_THRESHOLD,
    IntentClassifier,
    PredictionStatus,
)
from .dataset import GLOBAL_SCENARIO, OUT_OF_SCOPE, load_dataset
from .models import get_candidate

N_SPLITS = 5
RANDOM_STATE = 42


def main() -> None:
    data = load_dataset(strict=False)
    texts, labels = list(data.texts), np.asarray(data.labels)
    all_scenarios = data.scenarios
    candidate = get_candidate("char_logreg")

    skf = StratifiedKFold(N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

    in_scope = Counter()
    oos = Counter()
    harmful_examples: list[tuple[str, str, str]] = []

    for train_idx, test_idx in skf.split(texts, labels):
        pipeline = candidate.build()
        pipeline.fit([texts[i] for i in train_idx], labels[train_idx])
        clf = IntentClassifier(
            pipeline, data, threshold=DEFAULT_THRESHOLD, margin=DEFAULT_MARGIN
        )

        for i in test_idx:
            text, truth = texts[i], labels[i]
            scenario_of_truth = data.scenario_of(truth)
            contexts = (
                [scenario_of_truth]
                if scenario_of_truth != GLOBAL_SCENARIO
                else all_scenarios
            )

            for scenario in contexts:
                pred = clf.predict(text, scenario)

                if truth == OUT_OF_SCOPE:
                    if pred.status in (
                        PredictionStatus.REJECTED,
                        PredictionStatus.OUT_OF_SCOPE,
                        PredictionStatus.LOW_CONFIDENCE,
                    ):
                        oos["blocked"] += 1
                    elif pred.status is PredictionStatus.AMBIGUOUS:
                        oos["asked_to_clarify"] += 1
                    else:
                        oos["leaked_confidently"] += 1
                        if len(harmful_examples) < 12:
                            harmful_examples.append((text, truth, str(pred.intent)))
                    continue

                # Câu hợp lệ.
                if pred.status is PredictionStatus.REJECTED:
                    in_scope["wrongly_blocked_by_guard"] += 1
                elif pred.status is PredictionStatus.OUT_OF_SCOPE:
                    in_scope["wrongly_called_offtopic"] += 1
                elif pred.status is PredictionStatus.LOW_CONFIDENCE:
                    in_scope["asked_again"] += 1
                elif pred.status is PredictionStatus.AMBIGUOUS:
                    if pred.intent == truth:
                        in_scope["clarified_top_was_right"] += 1
                    else:
                        in_scope["clarified_top_was_wrong"] += 1
                elif pred.intent == truth:
                    in_scope["answered_correctly"] += 1
                else:
                    in_scope["answered_wrongly"] += 1
                    if len(harmful_examples) < 12:
                        harmful_examples.append((text, truth, str(pred.intent)))

    total_in = sum(in_scope.values())
    total_oos = sum(oos.values())
    total = total_in + total_oos
    harmful = in_scope["answered_wrongly"] + oos["leaked_confidently"]

    def pct(n: int, d: int) -> str:
        return f"{n / d:6.1%}" if d else "   n/a"

    print()
    print("=" * 66)
    print(f"ĐÁNH GIÁ TOÀN HỆ THỐNG  (ngưỡng={DEFAULT_THRESHOLD}, biên={DEFAULT_MARGIN})")
    print("=" * 66)
    print(f"\nCÂU HỢP LỆ  (n={total_in})")
    for key in (
        "answered_correctly",
        "clarified_top_was_right",
        "asked_again",
        "clarified_top_was_wrong",
        "wrongly_called_offtopic",
        "answered_wrongly",
        "wrongly_blocked_by_guard",
    ):
        print(f"  {key:<28} {in_scope[key]:>5}  {pct(in_scope[key], total_in)}")

    print(f"\nCÂU LẠC ĐỀ  (n={total_oos})")
    for key in ("blocked", "asked_to_clarify", "leaked_confidently"):
        print(f"  {key:<28} {oos[key]:>5}  {pct(oos[key], total_oos)}")

    print(f"\n{'-' * 66}")
    print(f"TỈ LỆ LỖI GÂY HẠI (tự tin nhưng sai): {harmful}/{total} = {harmful / total:.1%}")
    print(f"{'-' * 66}")

    print("\nVí dụ lỗi gây hại:")
    for text, truth, got in harmful_examples[:10]:
        print(f"  {text!r:<32} thật={truth:<24} đoán={got}")

    payload = {
        "threshold": DEFAULT_THRESHOLD,
        "margin": DEFAULT_MARGIN,
        "in_scope": dict(in_scope),
        "out_of_scope": dict(oos),
        "harmful_error_rate": harmful / total,
        "n_trials": total,
    }
    out = Path(__file__).resolve().parents[2] / "reports" / "system-metrics.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nĐã ghi {out}")


if __name__ == "__main__":
    main()
