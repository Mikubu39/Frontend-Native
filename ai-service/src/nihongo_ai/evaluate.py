"""So sánh có kiểm soát giữa mọi mô hình ứng viên.

Chạy:  python -m nihongo_ai.evaluate            (bỏ qua mô hình nặng)
       python -m nihongo_ai.evaluate --heavy    (kèm cả mô hình nhúng câu)

Sinh ra reports/metrics.json và reports/EVALUATION.md.

Mọi ứng viên đều thấy CÙNG các fold (StratifiedKFold, seed cố định), nên các
con số so được với nhau. Bốn nhóm độ đo được ghi lại:

1. Chất lượng toàn cục   - accuracy, macro-F1 trên toàn bộ 30 nhãn
2. Chất lượng khi vận hành - accuracy khi đã biết kịch bản người dùng đang ở
                             (không gian nhãn bị thu hẹp -> đây mới là con số
                             người dùng thực sự cảm nhận)
3. Chất lượng từ chối     - precision/recall trên nhãn out_of_scope, vì bỏ sót
                             câu lạc đề là kiểu lỗi gây khó chịu nhất
4. Chi phí vận hành       - thời gian huấn luyện, độ trễ suy luận, dung lượng
                             mô hình trên đĩa (quyết định có deploy free được
                             hay không)
"""

from __future__ import annotations

import argparse
import io
import json
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import StratifiedKFold

from .dataset import GLOBAL_SCENARIO, OUT_OF_SCOPE, Dataset, load_dataset
from .models import CANDIDATES, Candidate, embeddings_available

N_SPLITS = 5
RANDOM_STATE = 42
LATENCY_REPEATS = 200


def _reports_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "reports"


@dataclass
class CandidateResult:
    name: str
    label: str
    family: str
    rationale: str
    accuracy: float
    macro_f1: float
    scenario_accuracy: float
    oos_precision: float
    oos_recall: float
    oos_f1: float
    fit_seconds: float
    latency_ms: float
    model_kb: float
    gives_proba: bool
    heavy: bool
    tags: list[str] = field(default_factory=list)
    error: str | None = None


def _scores(pipeline, texts: list[str]) -> tuple[np.ndarray, list[str]]:
    """Trả về ma trận điểm (n_samples, n_classes) và danh sách nhãn theo cột."""
    classes = list(pipeline.classes_)
    if hasattr(pipeline, "predict_proba"):
        try:
            return np.asarray(pipeline.predict_proba(texts)), classes
        except (AttributeError, NotImplementedError):
            pass
    if hasattr(pipeline, "decision_function"):
        margins = np.asarray(pipeline.decision_function(texts))
        if margins.ndim == 1:  # nhị phân
            margins = np.column_stack([-margins, margins])
        return margins, classes
    # Phương án cuối: one-hot từ predict.
    preds = pipeline.predict(texts)
    out = np.zeros((len(texts), len(classes)))
    index = {c: i for i, c in enumerate(classes)}
    for row, p in enumerate(preds):
        out[row, index[p]] = 1.0
    return out, classes


def _scenario_conditioned_correct(
    score_row: np.ndarray,
    classes: list[str],
    true_label: str,
    data: Dataset,
    all_scenarios: list[str],
) -> float:
    """Đúng/sai khi không gian nhãn bị thu hẹp theo kịch bản đang chạy.

    Nhãn riêng của một kịch bản -> chỉ xét đúng kịch bản đó.
    Nhãn dùng chung / từ chối  -> người dùng có thể đang ở BẤT KỲ kịch bản nào,
    nên lấy trung bình độ đúng trên tất cả các kịch bản.
    """
    scenario_of_true = data.scenario_of(true_label)
    if scenario_of_true != GLOBAL_SCENARIO:
        contexts = [scenario_of_true]
    else:
        contexts = all_scenarios

    hits = 0.0
    for scenario in contexts:
        allowed = set(data.intents_for_scenario(scenario))
        mask = np.array([c in allowed for c in classes])
        masked = np.where(mask, score_row, -np.inf)
        if np.all(~np.isfinite(masked)):
            continue
        if classes[int(np.argmax(masked))] == true_label:
            hits += 1.0
    return hits / len(contexts)


def evaluate_candidate(candidate: Candidate, data: Dataset) -> CandidateResult:
    texts = list(data.texts)
    labels = np.asarray(data.labels)
    all_scenarios = data.scenarios

    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

    predictions = np.empty(len(texts), dtype=object)
    scenario_scores = np.zeros(len(texts))
    fit_seconds = 0.0

    for train_idx, test_idx in skf.split(texts, labels):
        pipeline = candidate.build()
        x_train = [texts[i] for i in train_idx]
        y_train = labels[train_idx]

        started = time.perf_counter()
        pipeline.fit(x_train, y_train)
        fit_seconds += time.perf_counter() - started

        x_test = [texts[i] for i in test_idx]
        score_matrix, classes = _scores(pipeline, x_test)

        for row, sample_idx in enumerate(test_idx):
            predictions[sample_idx] = classes[int(np.argmax(score_matrix[row]))]
            scenario_scores[sample_idx] = _scenario_conditioned_correct(
                score_matrix[row], classes, labels[sample_idx], data, all_scenarios
            )

    y_pred = np.asarray([str(p) for p in predictions])
    accuracy = float(np.mean(y_pred == labels))
    macro_f1 = float(f1_score(labels, y_pred, average="macro", zero_division=0))

    report = classification_report(
        labels, y_pred, output_dict=True, zero_division=0
    )
    oos = report.get(OUT_OF_SCOPE, {"precision": 0.0, "recall": 0.0, "f1-score": 0.0})

    # Huấn luyện lần cuối trên TOÀN BỘ dữ liệu để đo độ trễ và dung lượng.
    final = candidate.build()
    final.fit(texts, labels)

    probe = "すみません、駅はどこですか"
    final.predict([probe])  # làm nóng cache
    started = time.perf_counter()
    for _ in range(LATENCY_REPEATS):
        final.predict([probe])
    latency_ms = (time.perf_counter() - started) / LATENCY_REPEATS * 1000

    buffer = io.BytesIO()
    joblib.dump(final, buffer, compress=3)
    model_kb = buffer.tell() / 1024

    return CandidateResult(
        name=candidate.name,
        label=candidate.label,
        family=candidate.family,
        rationale=candidate.rationale,
        accuracy=accuracy,
        macro_f1=macro_f1,
        scenario_accuracy=float(np.mean(scenario_scores)),
        oos_precision=float(oos["precision"]),
        oos_recall=float(oos["recall"]),
        oos_f1=float(oos["f1-score"]),
        fit_seconds=fit_seconds / N_SPLITS,
        latency_ms=latency_ms,
        model_kb=model_kb,
        gives_proba=candidate.gives_proba,
        heavy=candidate.heavy,
        tags=list(candidate.tags),
    )


def threshold_sweep(data: Dataset, candidate_name: str = "char_logreg") -> list[dict]:
    """Quét ngưỡng tin cậy CÓ ĐIỀU KIỆN KỊCH BẢN - đúng như lúc chạy thật.

    Lúc vận hành ta luôn biết người dùng đang ở kịch bản nào, nên không gian
    nhãn bị thu hẹp còn (ý định của kịch bản + ý định chung + nhãn từ chối) và
    xác suất được CHUẨN HOÁ LẠI trên tập nhãn đó. Nếu không chuẩn hoá lại,
    ngưỡng sẽ mang ý nghĩa khác nhau ở mỗi kịch bản vì số lượng nhãn khác nhau.

    Đánh đổi cốt lõi:
      ngưỡng cao -> ít nhận nhầm câu lạc đề, nhưng câu HỢP LỆ cũng hay bị
                    hỏi lại -> người dùng thấy phiền
      ngưỡng thấp -> mượt mà, nhưng bot tự tin trả lời sai
    """
    from .models import get_candidate

    candidate = get_candidate(candidate_name)
    texts = list(data.texts)
    labels = np.asarray(data.labels)
    all_scenarios = data.scenarios
    skf = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

    # Mỗi phần tử: (nhãn thật, nhãn dự đoán trong ngữ cảnh, xác suất đã chuẩn hoá)
    trials: list[tuple[str, str, float]] = []

    for train_idx, test_idx in skf.split(texts, labels):
        pipeline = candidate.build()
        pipeline.fit([texts[i] for i in train_idx], labels[train_idx])
        matrix, classes = _scores(pipeline, [texts[i] for i in test_idx])

        for row, sample_idx in enumerate(test_idx):
            true_label = labels[sample_idx]
            scenario_of_true = data.scenario_of(true_label)
            contexts = (
                [scenario_of_true]
                if scenario_of_true != GLOBAL_SCENARIO
                else all_scenarios
            )
            for scenario in contexts:
                allowed = set(data.intents_for_scenario(scenario))
                mask = np.array([c in allowed for c in classes])
                scores = np.where(mask, matrix[row], 0.0)
                total = scores.sum()
                if total <= 0:
                    continue
                scores = scores / total  # chuẩn hoá lại trên nhãn hợp lệ
                best = int(np.argmax(scores))
                trials.append((true_label, classes[best], float(scores[best])))

    y_true = np.array([t[0] for t in trials])
    y_pred = np.array([t[1] for t in trials])
    conf = np.array([t[2] for t in trials])

    is_oos_true = y_true == OUT_OF_SCOPE
    in_scope = ~is_oos_true

    rows: list[dict] = []
    for threshold in [round(t, 2) for t in np.arange(0.20, 0.85, 0.05)]:
        rejected = conf < threshold
        # Bot "không nhận" khi hoặc dưới ngưỡng, hoặc nhãn top chính là từ chối.
        refused = rejected | (y_pred == OUT_OF_SCOPE)
        accepted_correct = in_scope & ~refused & (y_pred == y_true)

        rows.append(
            {
                "threshold": threshold,
                # Tỉ lệ câu hợp lệ được trả lời ĐÚNG (không bị hỏi lại oan).
                "in_scope_answered_correctly": float(
                    accepted_correct.sum() / in_scope.sum()
                ),
                # Tỉ lệ câu hợp lệ bị hỏi lại oan.
                "in_scope_false_reject": float(refused[in_scope].mean()),
                # Tỉ lệ câu lạc đề bị chặn đúng.
                "oos_caught": float(refused[is_oos_true].mean()),
            }
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="So sánh các mô hình phân loại ý định")
    parser.add_argument(
        "--heavy",
        action="store_true",
        help="Bao gồm cả mô hình nhúng câu (cần sentence-transformers + torch)",
    )
    args = parser.parse_args()

    data = load_dataset()
    print(
        f"[eval] {len(data.texts)} câu, {len(data.intents)} ý định, "
        f"{len(data.scenarios)} kịch bản"
    )

    results: list[CandidateResult] = []
    for candidate in CANDIDATES:
        if candidate.heavy and not args.heavy:
            print(f"[eval] bỏ qua {candidate.name} (cần cờ --heavy)")
            continue
        if candidate.heavy and not embeddings_available():
            print(f"[eval] bỏ qua {candidate.name} (chưa cài sentence-transformers)")
            continue

        print(f"[eval] đang chạy {candidate.name} ...", flush=True)
        try:
            results.append(evaluate_candidate(candidate, data))
        except Exception as exc:  # noqa: BLE001 - báo cáo rồi đi tiếp
            print(f"[eval] {candidate.name} THẤT BẠI: {exc}")

    sweep = threshold_sweep(data)

    payload = {
        "dataset": {
            "n_examples": len(data.texts),
            "n_intents": len(data.intents),
            "n_scenarios": len(data.scenarios),
            "counts": data.counts(),
        },
        "cv": {"n_splits": N_SPLITS, "random_state": RANDOM_STATE},
        "results": [asdict(r) for r in results],
        "threshold_sweep": sweep,
    }

    reports = _reports_dir()
    reports.mkdir(parents=True, exist_ok=True)
    (reports / "metrics.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[eval] đã ghi {reports / 'metrics.json'}")

    # Bảng tóm tắt in ra màn hình.
    print()
    header = f"{'mô hình':<22}{'acc':>7}{'macroF1':>9}{'theo KB':>9}{'OOS-F1':>8}{'ms':>7}{'KB':>9}"
    print(header)
    print("-" * len(header))
    for r in sorted(results, key=lambda x: -x.scenario_accuracy):
        print(
            f"{r.name:<22}{r.accuracy:>7.3f}{r.macro_f1:>9.3f}"
            f"{r.scenario_accuracy:>9.3f}{r.oos_f1:>8.3f}"
            f"{r.latency_ms:>7.2f}{r.model_kb:>9.1f}"
        )


if __name__ == "__main__":
    main()
