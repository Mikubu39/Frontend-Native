"""Suy luận ý định: tầng chặn + mô hình + luật quyết định.

Đây là nơi mọi thứ trong tài liệu "xử lý tình huống khó" hội tụ lại. Bộ phân
loại KHÔNG BAO GIỜ được phép trả ra một ý định trần. Nó luôn trả về một
`Prediction` mang theo trạng thái, và tầng hội thoại quyết định phải nói gì.

Luật quyết định, theo thứ tự
----------------------------
1. Tầng chặn từ chối       -> REJECTED       (rỗng / sai chữ viết / rác)
2. Nhãn top là out_of_scope -> OUT_OF_SCOPE  (mô hình nhận ra là lạc đề)
3. p(top) < ngưỡng          -> LOW_CONFIDENCE (không đủ chắc để hành động)
4. p(top) - p(top2) < biên  -> AMBIGUOUS      (hỏi lại cho rõ - biến điểm yếu
                                               của mô hình thành một lượt hội
                                               thoại tự nhiên)
5. còn lại                  -> OK

Xác suất luôn được CHUẨN HOÁ LẠI trên tập nhãn hợp lệ của kịch bản hiện tại
trước khi so ngưỡng. Không làm vậy thì cùng một ngưỡng sẽ mang ý nghĩa khác
nhau ở mỗi kịch bản, vì mỗi kịch bản có số lượng nhãn khác nhau.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

import joblib
import numpy as np

from . import guards
from .dataset import GLOBAL_SCENARIO, OUT_OF_SCOPE, Dataset, load_dataset
from .guards import RejectReason

#: Chọn từ bảng quét ngưỡng trong reports/EVALUATION.md.
#: Tại 0.30: trả lời đúng 70.8% câu hợp lệ, hỏi lại oan 14.9%, chặn 82.2% lạc đề.
DEFAULT_THRESHOLD = 0.30

#: Khoảng cách tối thiểu giữa nhãn nhất và nhì; hẹp hơn thì hỏi lại cho rõ.
DEFAULT_MARGIN = 0.12


class PredictionStatus(str, Enum):
    OK = "ok"
    AMBIGUOUS = "ambiguous"
    LOW_CONFIDENCE = "low_confidence"
    OUT_OF_SCOPE = "out_of_scope"
    REJECTED = "rejected"


@dataclass(frozen=True)
class Prediction:
    status: PredictionStatus
    intent: str | None
    confidence: float
    #: Vài nhãn dẫn đầu (tên, xác suất) - dùng cho câu hỏi làm rõ và để debug.
    alternatives: list[tuple[str, float]] = field(default_factory=list)
    reject_reason: RejectReason | None = None
    normalized_text: str = ""

    @property
    def actionable(self) -> bool:
        """Tầng hội thoại có được phép hành động theo ý định này không."""
        return self.status is PredictionStatus.OK


class IntentClassifier:
    """Bọc pipeline đã huấn luyện kèm toàn bộ luật quyết định."""

    def __init__(
        self,
        pipeline,
        dataset: Dataset,
        threshold: float = DEFAULT_THRESHOLD,
        margin: float = DEFAULT_MARGIN,
    ) -> None:
        self.pipeline = pipeline
        self.dataset = dataset
        self.threshold = threshold
        self.margin = margin
        self._classes = list(pipeline.classes_)

    # -- nạp / lưu ------------------------------------------------------
    @classmethod
    def load(
        cls,
        model_path: Path | None = None,
        threshold: float = DEFAULT_THRESHOLD,
        margin: float = DEFAULT_MARGIN,
    ) -> "IntentClassifier":
        path = model_path or default_model_path()
        if not path.exists():
            raise FileNotFoundError(
                f"Chưa có mô hình ở {path}. Chạy: python -m nihongo_ai.train"
            )
        bundle = joblib.load(path)
        return cls(
            bundle["pipeline"],
            load_dataset(strict=False),
            threshold=threshold,
            margin=margin,
        )

    # -- suy luận -------------------------------------------------------
    def _restricted_probabilities(
        self, text: str, scenario: str
    ) -> list[tuple[str, float]]:
        """Xác suất trên các nhãn hợp lệ của kịch bản, đã chuẩn hoá lại."""
        raw = self.pipeline.predict_proba([text])[0]
        allowed = set(self.dataset.intents_for_scenario(scenario))

        pairs = [
            (label, float(p))
            for label, p in zip(self._classes, raw)
            if label in allowed
        ]
        total = sum(p for _, p in pairs)
        if total <= 0:
            return sorted(pairs, key=lambda kv: -kv[1])
        return sorted(((l, p / total) for l, p in pairs), key=lambda kv: -kv[1])

    def predict(self, text: str, scenario: str) -> Prediction:
        verdict = guards.inspect(text)
        if verdict.rejected:
            return Prediction(
                status=PredictionStatus.REJECTED,
                intent=None,
                confidence=0.0,
                reject_reason=verdict.reason,
                normalized_text=verdict.normalized,
            )

        ranked = self._restricted_probabilities(verdict.normalized, scenario)
        top_label, top_prob = ranked[0]
        runner_up = ranked[1][1] if len(ranked) > 1 else 0.0
        alternatives = [(l, round(p, 4)) for l, p in ranked[:3]]

        if top_label == OUT_OF_SCOPE:
            return Prediction(
                status=PredictionStatus.OUT_OF_SCOPE,
                intent=OUT_OF_SCOPE,
                confidence=top_prob,
                alternatives=alternatives,
                normalized_text=verdict.normalized,
            )

        if top_prob < self.threshold:
            return Prediction(
                status=PredictionStatus.LOW_CONFIDENCE,
                intent=top_label,
                confidence=top_prob,
                alternatives=alternatives,
                normalized_text=verdict.normalized,
            )

        if (top_prob - runner_up) < self.margin and ranked[1][0] != OUT_OF_SCOPE:
            return Prediction(
                status=PredictionStatus.AMBIGUOUS,
                intent=top_label,
                confidence=top_prob,
                alternatives=alternatives,
                normalized_text=verdict.normalized,
            )

        return Prediction(
            status=PredictionStatus.OK,
            intent=top_label,
            confidence=top_prob,
            alternatives=alternatives,
            normalized_text=verdict.normalized,
        )


def default_model_path() -> Path:
    return Path(__file__).resolve().parents[2] / "artifacts" / "intent-model.joblib"
