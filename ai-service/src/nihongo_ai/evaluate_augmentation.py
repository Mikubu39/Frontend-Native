"""Đo RIÊNG phần đóng góp của dữ liệu do LLM sinh.

Chạy:  python -m nihongo_ai.evaluate_augmentation

Vì sao không dùng thẳng `evaluate_system.py`
--------------------------------------------
Chạy `evaluate_system.py` trên dataset đã trộn cho ra con số ĐẸP nhưng SAI ý
nghĩa: câu do LLM sinh nằm cả trong tập test, nên một phần điểm số là đo khả
năng đọc chính văn máy sinh - vốn đều tay và dễ hơn câu người thật gõ.

Ở đây tập TEST luôn chỉ gồm câu VIẾT TAY. Dữ liệu sinh chỉ được phép vào tập
TRAIN. Cùng một tập test, cùng một seed, chỉ khác đúng một biến: có hay không
có 636 câu sinh thêm. Đó mới là câu trả lời cho "dữ liệu sinh có giúp gì trên
đầu vào thật không".

Cảnh báo còn lại
----------------
Trùng lặp Y HỆT đã bị `augment.py --check` loại, nhưng câu GẦN GIỐNG thì
không. Nếu LLM sinh ra một câu chỉ khác câu test đúng một trợ từ, phần cải
thiện đo được sẽ lạc quan hơn thực tế. Cách chặn triệt để là giữ một tập test
người viết mà LLM không bao giờ được nhìn thấy - xem mục "Bước tiếp theo" ở
cuối README.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.metrics import f1_score
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


def _run(seed_texts, seed_labels, extra_texts, extra_labels, data, label: str) -> dict:
    """5-fold trên câu viết tay; `extra_*` chỉ được cộng vào tập train."""
    skf = StratifiedKFold(N_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    candidate = get_candidate("char_logreg")
    all_scenarios = data.scenarios

    in_scope, oos = Counter(), Counter()
    y_true: list[str] = []
    y_pred: list[str] = []

    for train_idx, test_idx in skf.split(seed_texts, seed_labels):
        x_train = [seed_texts[i] for i in train_idx] + list(extra_texts)
        y_train = np.concatenate([seed_labels[train_idx], np.asarray(extra_labels)])

        pipeline = candidate.build()
        pipeline.fit(x_train, y_train)
        clf = IntentClassifier(
            pipeline, data, threshold=DEFAULT_THRESHOLD, margin=DEFAULT_MARGIN
        )

        for i in test_idx:
            text, truth = seed_texts[i], seed_labels[i]
            scenario_of_truth = data.scenario_of(truth)
            contexts = (
                [scenario_of_truth]
                if scenario_of_truth != GLOBAL_SCENARIO
                else all_scenarios
            )
            for scenario in contexts:
                pred = clf.predict(text, scenario)
                y_true.append(truth)
                y_pred.append(pred.intent or OUT_OF_SCOPE)

                if truth == OUT_OF_SCOPE:
                    if pred.status in (
                        PredictionStatus.REJECTED,
                        PredictionStatus.OUT_OF_SCOPE,
                        PredictionStatus.LOW_CONFIDENCE,
                    ):
                        oos["blocked"] += 1
                    elif pred.status is PredictionStatus.AMBIGUOUS:
                        oos["clarify"] += 1
                    else:
                        oos["leaked"] += 1
                    continue

                if pred.status is PredictionStatus.REJECTED:
                    in_scope["blocked_by_guard"] += 1
                elif pred.status is PredictionStatus.OUT_OF_SCOPE:
                    in_scope["called_offtopic"] += 1
                elif pred.status is PredictionStatus.LOW_CONFIDENCE:
                    in_scope["asked_again"] += 1
                elif pred.status is PredictionStatus.AMBIGUOUS:
                    in_scope["clarified"] += 1
                elif pred.intent == truth:
                    in_scope["correct"] += 1
                else:
                    in_scope["wrong"] += 1

    ti, to = sum(in_scope.values()), sum(oos.values())
    harmful = in_scope["wrong"] + oos["leaked"]
    return {
        "label": label,
        "n_train_extra": len(extra_texts),
        "correct": in_scope["correct"] / ti,
        "wrong": in_scope["wrong"] / ti,
        "called_offtopic": in_scope["called_offtopic"] / ti,
        "asked_again": in_scope["asked_again"] / ti,
        "blocked": oos["blocked"] / to,
        "leaked": oos["leaked"] / to,
        "harmful": harmful / (ti + to),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
    }


def main() -> None:
    full = load_dataset(strict=False, include_generated=True)
    seed = load_dataset(strict=False, include_generated=False)

    seed_set = set(zip(seed.texts, seed.labels))
    extra = [(t, l) for t, l in zip(full.texts, full.labels) if (t, l) not in seed_set]
    extra_texts = [t for t, _ in extra]
    extra_labels = [l for _, l in extra]

    seed_texts = list(seed.texts)
    seed_labels = np.asarray(seed.labels)

    print()
    print("=" * 72)
    print("ĐÓNG GÓP CỦA DỮ LIỆU SINH  (tập test LUÔN chỉ gồm câu viết tay)")
    print("=" * 72)
    print(f"\nhạt giống {len(seed_texts)} câu · sinh thêm {len(extra_texts)} câu\n")

    # `full` được truyền vào IntentClassifier vì nó chỉ dùng để tra bảng
    # nhãn-theo-kịch-bản, không dính gì tới việc huấn luyện.
    base = _run(seed_texts, seed_labels, [], [], full, "chỉ hạt giống")
    aug = _run(seed_texts, seed_labels, extra_texts, extra_labels, full, "+ sinh thêm")

    rows = [
        ("Trả lời đúng", "correct", True),
        ("Trả lời SAI (gây hại)", "wrong", False),
        ("Gọi nhầm là lạc đề", "called_offtopic", False),
        ("Hỏi lại (tin cậy thấp)", "asked_again", False),
        ("Chặn được lạc đề", "blocked", True),
        ("Lạc đề LỌT (gây hại)", "leaked", False),
        ("Tỉ lệ lỗi gây hại", "harmful", False),
        ("Macro-F1", "macro_f1", True),
    ]
    print(f"{'chỉ số':<26}{'hạt giống':>12}{'+ sinh':>10}{'Δ':>10}")
    print("-" * 60)
    for name, key, higher_better in rows:
        a, b = base[key], aug[key]
        delta = b - a
        good = (delta > 0) == higher_better
        flag = "" if abs(delta) < 0.003 else ("  ✓" if good else "  ✗")
        print(f"{name:<26}{a:>11.1%}{b:>10.1%}{delta:>+10.1%}{flag}")

    payload = {"seed_only": base, "augmented": aug}
    out = Path(__file__).resolve().parents[2] / "reports" / "augmentation-metrics.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nĐã ghi {out}")


if __name__ == "__main__":
    main()
