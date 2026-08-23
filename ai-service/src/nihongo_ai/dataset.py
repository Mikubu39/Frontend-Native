"""Nạp và kiểm tra tính toàn vẹn của dataset ý định.

Dataset nằm ở `data/intents/*.yaml`. Module này KHÔNG chỉ đọc file - nó còn
kiểm tra chất lượng dữ liệu, vì lỗi nhãn im lặng là nguyên nhân số một khiến
một bộ phân loại nhỏ hoạt động tệ mà không ai biết tại sao:

* trùng lặp TRONG CÙNG một ý định  -> lãng phí, làm lệch trọng số lớp
* trùng lặp GIỮA hai ý định KHÁC scenario -> CHẤP NHẬN ĐƯỢC (xem ghi chú dưới)
* trùng lặp GIỮA hai ý định CÙNG scenario -> LỖI, không thể học được

Ghi chú về trùng lặp giữa các scenario
--------------------------------------
"いくらですか" (Bao nhiêu tiền?) tồn tại ở cả `restaurant_ask_price` lẫn
`shopping_ask_price`. Xét trên toàn cục thì đây là nhãn mâu thuẫn và tạo ra
một SÀN LỖI không thể vượt qua. Nhưng lúc chạy thật ta LUÔN biết người dùng
đang ở kịch bản nào, nên không gian nhãn được thu hẹp lại và mâu thuẫn biến
mất. Vì vậy `evaluate.py` báo cáo hai con số: độ chính xác toàn cục (có sàn
lỗi) và độ chính xác theo-kịch-bản (con số thật sự có ý nghĩa khi vận hành).
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

import yaml

# Nhãn từ chối. Không phải một ý định "thật" - nó là lớp bắt tất cả mọi thứ
# nằm ngoài phạm vi kịch bản.
OUT_OF_SCOPE = "out_of_scope"

# Các ý định dùng chung, hợp lệ ở MỌI kịch bản.
GLOBAL_SCENARIO = "global"


@dataclass(frozen=True)
class IntentSpec:
    """Một ý định và toàn bộ câu ví dụ của nó."""

    intent: str
    scenario: str
    description: str
    examples: tuple[str, ...]
    #: Bao nhiêu câu trong `examples` đến từ `data/intents/generated/` thay vì
    #: được viết tay. Giữ lại để báo cáo tách bạch phần hạt giống và phần sinh
    #: thêm - đây là con số hội đồng sẽ hỏi.
    n_generated: int = 0

    @property
    def n_seed(self) -> int:
        return len(self.examples) - self.n_generated


@dataclass(frozen=True)
class Dataset:
    """Dataset đã làm phẳng, sẵn sàng đưa vào scikit-learn."""

    texts: tuple[str, ...]
    labels: tuple[str, ...]
    specs: tuple[IntentSpec, ...]

    @property
    def intents(self) -> list[str]:
        return sorted({s.intent for s in self.specs})

    @property
    def n_generated(self) -> int:
        """Số câu đến từ `data/intents/generated/`."""
        return sum(s.n_generated for s in self.specs)

    @property
    def n_seed(self) -> int:
        """Số câu viết tay."""
        return len(self.texts) - self.n_generated

    @property
    def scenarios(self) -> list[str]:
        return sorted({s.scenario for s in self.specs if s.scenario != GLOBAL_SCENARIO})

    def scenario_of(self, intent: str) -> str:
        for spec in self.specs:
            if spec.intent == intent:
                return spec.scenario
        raise KeyError(intent)

    def intents_for_scenario(self, scenario: str) -> list[str]:
        """Không gian nhãn hợp lệ khi người dùng đang ở `scenario`.

        Gồm ý định riêng của kịch bản + ý định dùng chung + nhãn từ chối.
        """
        allowed = {
            s.intent
            for s in self.specs
            if s.scenario in (scenario, GLOBAL_SCENARIO)
        }
        allowed.add(OUT_OF_SCOPE)
        return sorted(allowed)

    def counts(self) -> dict[str, int]:
        return dict(Counter(self.labels))


class DatasetError(ValueError):
    """Dataset vi phạm một bất biến khiến việc học trở nên vô nghĩa."""


def _default_data_dir() -> Path:
    # src/nihongo_ai/dataset.py -> ai-service/
    return Path(__file__).resolve().parents[2] / "data" / "intents"


#: Dữ liệu do LLM sinh nằm TÁCH BIỆT khỏi dữ liệu viết tay.
#:
#: Tách ra vì ba lý do: (1) kiểm toán được - luôn trả lời được "câu này người
#: viết hay máy sinh"; (2) revert gọn - xoá thư mục là quay về hạt giống;
#: (3) đo được phần đóng góp - train hai lần, có và không có, rồi so.
GENERATED_SUBDIR = "generated"


def load_intent_specs(
    data_dir: Path | None = None, include_generated: bool = True
) -> list[IntentSpec]:
    """Đọc mọi file YAML ý định và trả về danh sách IntentSpec.

    Câu viết tay nằm ở `data/intents/*.yaml`, câu do LLM sinh nằm ở
    `data/intents/generated/*.yaml`. Phần sinh được GỘP vào đúng ý định hạt
    giống tương ứng, không tạo nhãn mới - nên `include_generated=False` cho ra
    đúng dataset hạt giống, dùng để đo phần đóng góp của dữ liệu sinh.
    """
    directory = data_dir or _default_data_dir()
    if not directory.is_dir():
        raise DatasetError(f"Không tìm thấy thư mục dataset: {directory}")

    specs: list[IntentSpec] = []
    seen_intents: set[str] = set()

    for path in sorted(directory.glob("*.yaml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, list):
            raise DatasetError(f"{path.name}: phải là một danh sách các ý định")

        for entry in raw:
            intent = entry["intent"]
            if intent in seen_intents:
                raise DatasetError(f"Ý định '{intent}' bị khai báo hai lần")
            seen_intents.add(intent)

            examples = [str(e).strip() for e in entry.get("examples", [])]
            examples = [e for e in examples if e]
            if not examples:
                raise DatasetError(f"Ý định '{intent}' không có câu ví dụ nào")

            specs.append(
                IntentSpec(
                    intent=intent,
                    scenario=entry.get("scenario", GLOBAL_SCENARIO),
                    description=entry.get("description", ""),
                    examples=tuple(examples),
                )
            )

    if OUT_OF_SCOPE not in seen_intents:
        raise DatasetError(
            f"Thiếu nhãn từ chối '{OUT_OF_SCOPE}'. Không có nó, mô hình buộc "
            "phải gán mọi câu vào một ý định hợp lệ."
        )

    if include_generated:
        specs = _merge_generated(specs, directory / GENERATED_SUBDIR)
    return specs


def _merge_generated(specs: list[IntentSpec], gen_dir: Path) -> list[IntentSpec]:
    """Gộp câu do LLM sinh vào các ý định hạt giống, có cổng lọc an toàn.

    Hai thứ bị loại thẳng tay ở đây thay vì để nổ ở `check_integrity`:

    1. Câu trùng y hệt một câu đã có (bất kể ở ý định nào) - vô dụng, và nếu
       nó nằm ở ý định KHÁC trong CÙNG kịch bản thì còn làm hỏng dataset.
    2. Ý định không tồn tại trong dữ liệu hạt giống - dữ liệu sinh chỉ được
       làm dày ý định đã có, không được đẻ nhãn mới. Nhãn mới phải do người
       quyết định, kèm cạnh FSM tương ứng.
    """
    if not gen_dir.is_dir():
        return specs

    by_intent = {spec.intent: spec for spec in specs}
    # Câu nào đã bị "chiếm" bởi ý định nào, trong kịch bản nào.
    owner: dict[tuple[str, str], str] = {}
    for spec in specs:
        for text in spec.examples:
            owner[(spec.scenario, text)] = spec.intent

    added: dict[str, list[str]] = defaultdict(list)

    for path in sorted(gen_dir.glob("*.yaml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, list):
            raise DatasetError(f"{path.name}: phải là một danh sách các ý định")

        for entry in raw:
            intent = entry["intent"]
            seed = by_intent.get(intent)
            if seed is None:
                raise DatasetError(
                    f"{path.name}: ý định '{intent}' không có trong dữ liệu hạt "
                    "giống. Dữ liệu sinh chỉ được làm dày ý định đã có."
                )

            for example in entry.get("examples", []):
                text = str(example).strip()
                if not text:
                    continue
                key = (seed.scenario, text)
                if owner.get(key) is not None:
                    continue  # đã có ai đó giữ câu này rồi -> bỏ
                owner[key] = intent
                added[intent].append(text)

    merged: list[IntentSpec] = []
    for spec in specs:
        extra = added.get(spec.intent, [])
        if not extra:
            merged.append(spec)
            continue
        merged.append(
            IntentSpec(
                intent=spec.intent,
                scenario=spec.scenario,
                description=spec.description,
                examples=spec.examples + tuple(extra),
                n_generated=spec.n_generated + len(extra),
            )
        )
    return merged


def check_integrity(specs: list[IntentSpec]) -> list[str]:
    """Trả về danh sách cảnh báo. Ném DatasetError nếu gặp lỗi chí mạng."""
    warnings: list[str] = []
    by_text: dict[str, list[IntentSpec]] = defaultdict(list)

    for spec in specs:
        # Trùng trong cùng một ý định.
        dupes = [t for t, n in Counter(spec.examples).items() if n > 1]
        if dupes:
            warnings.append(
                f"'{spec.intent}': {len(dupes)} câu ví dụ bị lặp -> {dupes[:3]}"
            )
        for text in set(spec.examples):
            by_text[text].append(spec)

    for text, owners in by_text.items():
        if len(owners) < 2:
            continue
        scenarios = {o.scenario for o in owners}
        names = sorted(o.intent for o in owners)
        if len(scenarios) == 1:
            # Cùng kịch bản + cùng câu chữ nhưng khác nhãn = không thể học.
            raise DatasetError(
                f"Câu {text!r} xuất hiện ở nhiều ý định CÙNG kịch bản {names}. "
                "Hãy gộp hai ý định hoặc sửa lại câu ví dụ."
            )
        warnings.append(
            f"Nhập nhằng giữa các kịch bản (chấp nhận được): {text!r} -> {names}"
        )

    # Lớp quá nhỏ khiến k-fold phân tầng không chạy được.
    for spec in specs:
        if len(set(spec.examples)) < 5:
            warnings.append(
                f"'{spec.intent}' chỉ có {len(set(spec.examples))} câu duy nhất "
                "- quá ít để đánh giá đáng tin"
            )
    return warnings


def load_dataset(
    data_dir: Path | None = None,
    strict: bool = True,
    include_generated: bool = True,
) -> Dataset:
    """Nạp, kiểm tra và làm phẳng dataset.

    `include_generated=False` bỏ qua `data/intents/generated/` - dùng khi cần
    đo xem dữ liệu sinh thực sự đóng góp bao nhiêu.
    """
    specs = load_intent_specs(data_dir, include_generated=include_generated)
    warnings = check_integrity(specs)
    if strict:
        for w in warnings:
            print(f"[dataset] CẢNH BÁO: {w}")

    texts: list[str] = []
    labels: list[str] = []
    for spec in specs:
        # Khử trùng lặp trong cùng ý định - giữ nguyên thứ tự xuất hiện.
        for text in dict.fromkeys(spec.examples):
            texts.append(text)
            labels.append(spec.intent)

    return Dataset(tuple(texts), tuple(labels), tuple(specs))
