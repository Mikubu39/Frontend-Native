"""Tìm siêu tham số cho bộ trích đặc trưng n-gram ký tự + hồi quy logistic.

Chạy:  python -m nihongo_ai.tune

Tối ưu theo macro-F1 chứ KHÔNG phải accuracy: `out_of_scope` chiếm 18% dữ liệu
nên accuracy có thể được đẩy lên chỉ bằng cách chiều lớp đông, trong khi thứ ta
quan tâm là mọi ý định đều hoạt động được.

Kết quả tốt nhất được ghi vào reports/tuning.json và chép tay vào
`features.py` / `models.py` để mô hình phục vụ production là mô hình đã tinh
chỉnh, tái lập được.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline

from .dataset import load_dataset
from .features import JapaneseNormalizer
from sklearn.feature_extraction.text import TfidfVectorizer

RANDOM_STATE = 42


def main() -> None:
    data = load_dataset(strict=False)
    texts = list(data.texts)
    labels = np.asarray(data.labels)

    pipeline = Pipeline(
        [
            (
                "vec",
                TfidfVectorizer(
                    analyzer="char_wb",
                    preprocessor=JapaneseNormalizer(True),
                    lowercase=False,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=4000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )

    grid = {
        "vec__ngram_range": [(1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (2, 5), (3, 5)],
        "vec__sublinear_tf": [True, False],
        "vec__min_df": [1, 2],
        "vec__preprocessor": [JapaneseNormalizer(True), JapaneseNormalizer(False)],
        "clf__C": [1.0, 5.0, 10.0, 30.0, 100.0],
    }

    search = GridSearchCV(
        pipeline,
        grid,
        scoring="f1_macro",
        cv=StratifiedKFold(5, shuffle=True, random_state=RANDOM_STATE),
        n_jobs=-1,
        verbose=1,
    )
    search.fit(texts, labels)

    print()
    print("macro-F1 tốt nhất:", round(search.best_score_, 4))
    for key, value in sorted(search.best_params_.items()):
        print(f"  {key} = {value}")

    print()
    print("10 tổ hợp dẫn đầu:")
    order = np.argsort(-search.cv_results_["mean_test_score"])[:10]
    for rank, idx in enumerate(order, 1):
        score = search.cv_results_["mean_test_score"][idx]
        params = search.cv_results_["params"][idx]
        compact = {
            "ngram": params["vec__ngram_range"],
            "C": params["clf__C"],
            "sublinear": params["vec__sublinear_tf"],
            "min_df": params["vec__min_df"],
            "fold_kana": params["vec__preprocessor"].fold_katakana,
        }
        print(f"  {rank:>2}. {score:.4f}  {compact}")

    reports = Path(__file__).resolve().parents[2] / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    best = dict(search.best_params_)
    best["vec__preprocessor"] = f"fold_katakana={best['vec__preprocessor'].fold_katakana}"
    best["vec__ngram_range"] = list(best["vec__ngram_range"])
    (reports / "tuning.json").write_text(
        json.dumps(
            {
                "best_macro_f1": float(search.best_score_),
                "best_params": best,
                "n_candidates": len(search.cv_results_["params"]),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\nĐã ghi {reports / 'tuning.json'}")


if __name__ == "__main__":
    main()
