"""Danh mục mô hình ứng viên dùng cho việc so sánh có kiểm soát.

Mọi ứng viên đều là một `Pipeline` của scikit-learn nhận vào chuỗi thô, nên
việc so sánh là công bằng: cùng dữ liệu, cùng cách chia fold, cùng độ đo.

Ứng viên "nặng" (`embed_logreg`) cần sentence-transformers + torch. Nó được
nạp lười (lazy) và tự bỏ qua nếu không cài, để việc huấn luyện mô hình phục
vụ production không bao giờ phụ thuộc vào một gói 2 GB.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.calibration import CalibratedClassifierCV
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from .features import build_char_vectorizer, build_word_vectorizer

RANDOM_STATE = 42


@dataclass
class Candidate:
    """Một mô hình ứng viên kèm phần lý giải vì sao nó có mặt ở đây."""

    name: str
    label: str
    build: Callable[[], Pipeline]
    family: str
    rationale: str
    #: Có sinh ra xác suất hiệu chỉnh được dùng làm ngưỡng tin cậy không.
    gives_proba: bool = True
    #: Cần phụ thuộc nặng (torch) hay không.
    heavy: bool = False
    tags: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Bộ nhúng câu (chỉ dùng để đối chứng)
# ---------------------------------------------------------------------------
class SentenceEmbedder(BaseEstimator, TransformerMixin):
    """Bọc SentenceTransformer thành một transformer của scikit-learn."""

    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2") -> None:
        self.model_name = model_name
        self._model = None

    def _ensure(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        return self._model

    def fit(self, X, y=None):  # noqa: N803 - quy ước sklearn
        self._ensure()
        return self

    def transform(self, X):  # noqa: N803
        model = self._ensure()
        return np.asarray(model.encode(list(X), show_progress_bar=False))


def embeddings_available() -> bool:
    try:
        import sentence_transformers  # noqa: F401

        return True
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Các hàm dựng pipeline
# ---------------------------------------------------------------------------
def _majority() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            ("clf", DummyClassifier(strategy="most_frequent")),
        ]
    )


def _char_knn() -> Pipeline:
    # 1-NN cosine trên TF-IDF ~ so khớp mẫu câu (template matching), tức là
    # xấp xỉ tốt nhất của một hệ thống viết luật thủ công.
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            ("clf", KNeighborsClassifier(n_neighbors=1, metric="cosine")),
        ]
    )


def _char_nb() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            ("clf", MultinomialNB(alpha=0.1)),
        ]
    )


def _char_logreg() -> Pipeline:
    # C=30 lấy từ grid search trong `tune.py` (reports/tuning.json).
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            (
                "clf",
                LogisticRegression(
                    C=30.0,
                    max_iter=4000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def _char_linsvc() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            (
                "clf",
                LinearSVC(C=1.0, class_weight="balanced", random_state=RANDOM_STATE),
            ),
        ]
    )


def _char_linsvc_calibrated() -> Pipeline:
    # LinearSVC không có predict_proba. Bọc bằng CalibratedClassifierCV để có
    # xác suất - nhưng việc này nhân số mô hình phải huấn luyện lên gấp `cv`
    # lần và xác suất thu được vẫn kém hiệu chỉnh hơn hồi quy logistic.
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            (
                "clf",
                CalibratedClassifierCV(
                    LinearSVC(C=1.0, class_weight="balanced", random_state=RANDOM_STATE),
                    cv=3,
                    method="sigmoid",
                ),
            ),
        ]
    )


def _char_sgd() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            (
                "clf",
                SGDClassifier(
                    loss="modified_huber",  # cho phép predict_proba
                    alpha=1e-4,
                    max_iter=3000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def _char_mlp() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_char_vectorizer()),
            (
                "clf",
                MLPClassifier(
                    hidden_layer_sizes=(256,),
                    max_iter=600,
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def _word_logreg() -> Pipeline:
    return Pipeline(
        [
            ("vec", build_word_vectorizer()),
            (
                "clf",
                LogisticRegression(
                    C=10.0,
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def _char_logreg_no_fold() -> Pipeline:
    # Ablation: bỏ bước gộp katakana -> hiragana.
    return Pipeline(
        [
            ("vec", build_char_vectorizer(fold_katakana=False)),
            (
                "clf",
                LogisticRegression(
                    C=10.0,
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


def _embed_logreg() -> Pipeline:
    return Pipeline(
        [
            ("vec", SentenceEmbedder()),
            (
                "clf",
                LogisticRegression(
                    C=10.0,
                    max_iter=3000,
                    class_weight="balanced",
                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )


# ---------------------------------------------------------------------------
# Bảng đăng ký
# ---------------------------------------------------------------------------
CANDIDATES: list[Candidate] = [
    Candidate(
        name="majority",
        label="Đoán bừa lớp đông nhất",
        build=_majority,
        family="baseline",
        rationale="Sàn tuyệt đối. Mọi mô hình phải vượt xa con số này mới có ý nghĩa.",
        tags=["baseline"],
    ),
    Candidate(
        name="char_knn",
        label="1-NN cosine (so khớp mẫu)",
        build=_char_knn,
        family="retrieval",
        rationale=(
            "Đại diện cho cách làm 'viết luật tay / so khớp mẫu câu'. Nếu một "
            "mô hình học được không thắng nổi nó thì không đáng để huấn luyện."
        ),
        gives_proba=False,
        tags=["baseline"],
    ),
    Candidate(
        name="char_nb",
        label="TF-IDF ký tự + Naive Bayes",
        build=_char_nb,
        family="linear",
        rationale="Chuẩn mực kinh điển cho phân loại văn bản ít dữ liệu, huấn luyện cực nhanh.",
    ),
    Candidate(
        name="char_logreg",
        label="TF-IDF ký tự + Hồi quy Logistic",
        build=_char_logreg,
        family="linear",
        rationale=(
            "Ứng viên chính. Cho xác suất hiệu chỉnh sẵn - điều kiện BẮT BUỘC "
            "để đặt ngưỡng tin cậy phát hiện câu lạc đề."
        ),
        tags=["primary"],
    ),
    Candidate(
        name="char_linsvc",
        label="TF-IDF ký tự + LinearSVC",
        build=_char_linsvc,
        family="linear",
        rationale="Thường nhỉnh hơn về độ chính xác thô, nhưng không có xác suất.",
        gives_proba=False,
    ),
    Candidate(
        name="char_linsvc_cal",
        label="TF-IDF ký tự + LinearSVC (hiệu chỉnh)",
        build=_char_linsvc_calibrated,
        family="linear",
        rationale="LinearSVC có thêm xác suất, đổi lại chi phí huấn luyện gấp 3 lần.",
    ),
    Candidate(
        name="char_sgd",
        label="TF-IDF ký tự + SGD (modified huber)",
        build=_char_sgd,
        family="linear",
        rationale="Huấn luyện trực tuyến được, hữu ích nếu sau này muốn học tăng dần.",
    ),
    Candidate(
        name="char_mlp",
        label="TF-IDF ký tự + MLP 256 nơ-ron",
        build=_char_mlp,
        family="neural",
        rationale="Kiểm chứng xem phi tuyến có thêm được gì trên tập dữ liệu cỡ này không.",
    ),
    Candidate(
        name="word_logreg",
        label="TF-IDF TỪ + Hồi quy Logistic (ablation)",
        build=_word_logreg,
        family="ablation",
        rationale=(
            "Đối chứng cho lựa chọn n-gram ký tự. Không có bộ tách từ, cả câu "
            "tiếng Nhật bị coi là MỘT token."
        ),
        tags=["ablation"],
    ),
    Candidate(
        name="char_logreg_nofold",
        label="TF-IDF ký tự, KHÔNG gộp katakana (ablation)",
        build=_char_logreg_no_fold,
        family="ablation",
        rationale="Đo riêng phần đóng góp của bước chuẩn hoá katakana -> hiragana.",
        tags=["ablation"],
    ),
    Candidate(
        name="embed_logreg",
        label="Nhúng câu đa ngữ MiniLM + Hồi quy Logistic",
        build=_embed_logreg,
        family="neural",
        rationale=(
            "Đối thủ nặng ký: mô hình Transformer đã pretrain, hiểu ngữ nghĩa "
            "chứ không chỉ mặt chữ. Cái giá là ~470 MB trọng số + torch."
        ),
        heavy=True,
        tags=["heavy"],
    ),
]


def get_candidate(name: str) -> Candidate:
    for c in CANDIDATES:
        if c.name == name:
            return c
    raise KeyError(f"Không có mô hình ứng viên tên '{name}'")
