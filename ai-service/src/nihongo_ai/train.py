"""Huấn luyện mô hình phục vụ production và lưu ra đĩa.

Chạy:  python -m nihongo_ai.train

Mô hình đưa vào production là `char_logreg` - TF-IDF n-gram ký tự + hồi quy
logistic. Lý do chọn được ghi đầy đủ trong reports/EVALUATION.md; tóm tắt:

  * Độ chính xác cao nhất trong các ứng viên đo được (đồng hạng), và CAO HƠN
    mô hình nhúng Transformer đã pretrain.
  * Cho xác suất hiệu chỉnh sẵn - điều kiện BẮT BUỘC cho ngưỡng tin cậy, thứ
    mà toàn bộ thiết kế chống-lạc-đề dựa vào. LinearSVC không có, và bọc thêm
    bộ hiệu chỉnh làm chi phí huấn luyện gấp 3 mà chất lượng không hơn.
  * Nhỏ hơn ~450 lần và nhanh hơn ~34 lần so với phương án Transformer, nên
    chạy lọt gói hosting miễn phí 512 MB RAM.

Kèm theo mô hình là một "thẻ mô hình" (model card): phiên bản, số liệu, và
hash của dataset - để về sau còn biết mô hình đang chạy được huấn luyện từ dữ
liệu nào.
"""

from __future__ import annotations

import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import sklearn
from sklearn.metrics import classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_predict

from . import __version__
from .classifier import DEFAULT_MARGIN, DEFAULT_THRESHOLD, default_model_path
from .dataset import load_dataset
from .models import get_candidate

PRODUCTION_MODEL = "char_logreg"
N_SPLITS = 5
RANDOM_STATE = 42


def dataset_fingerprint(texts: tuple[str, ...], labels: tuple[str, ...]) -> str:
    """Hash ổn định của dataset, để truy vết mô hình về đúng dữ liệu nguồn."""
    digest = hashlib.sha256()
    for text, label in sorted(zip(texts, labels)):
        digest.update(text.encode("utf-8"))
        digest.update(b"\x00")
        digest.update(label.encode("utf-8"))
        digest.update(b"\n")
    return digest.hexdigest()[:16]


def main() -> None:
    data = load_dataset()
    texts, labels = list(data.texts), np.asarray(data.labels)
    candidate = get_candidate(PRODUCTION_MODEL)

    print(f"[train] mô hình     : {candidate.name} - {candidate.label}")
    print(f"[train] dữ liệu     : {len(texts)} câu / {len(data.intents)} ý định")

    # Kiểm chứng chéo trước, để thẻ mô hình mang số liệu trung thực.
    skf = StratifiedKFold(N_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    predictions = cross_val_predict(candidate.build(), texts, labels, cv=skf)
    report = classification_report(
        labels, predictions, output_dict=True, zero_division=0
    )

    pipeline = candidate.build()
    pipeline.fit(texts, labels)

    path = default_model_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    bundle = {
        "pipeline": pipeline,
        "card": {
            "service_version": __version__,
            "model": candidate.name,
            "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "sklearn_version": sklearn.__version__,
            "python_version": platform.python_version(),
            "dataset_fingerprint": dataset_fingerprint(data.texts, data.labels),
            "n_examples": len(texts),
            "n_intents": len(data.intents),
            "scenarios": data.scenarios,
            "threshold": DEFAULT_THRESHOLD,
            "margin": DEFAULT_MARGIN,
            "cv_accuracy": round(float(report["accuracy"]), 4),
            "cv_macro_f1": round(float(report["macro avg"]["f1-score"]), 4),
        },
    }
    joblib.dump(bundle, path, compress=3)

    size_kb = path.stat().st_size / 1024
    print(f"[train] accuracy CV : {bundle['card']['cv_accuracy']}")
    print(f"[train] macro-F1 CV : {bundle['card']['cv_macro_f1']}")
    print(f"[train] đã lưu      : {path} ({size_kb:.0f} KB)")

    card_path = path.parent / "model-card.json"
    card_path.write_text(
        json.dumps(bundle["card"], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[train] thẻ mô hình : {card_path}")


if __name__ == "__main__":
    main()
