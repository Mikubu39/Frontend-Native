"""Sinh thêm câu huấn luyện bằng LLM - CHẠY OFFLINE, không phải lúc phục vụ.

Chạy:  python -m nihongo_ai.augment --intent directions_ask_how_to_get
       python -m nihongo_ai.augment --all --per-intent 40

Vì sao dùng LLM ở ĐÂY chứ không phải trong `api.py`
----------------------------------------------------
Điểm yếu đo được của hệ thống không phải kiến trúc mà là ĐỘ PHỦ DỮ LIỆU. Bộ
phân loại nhận đúng những mẫu câu nó từng thấy và trượt những mẫu chưa thấy -
`コンビニに行きたいです` là ví dụ điển hình. 730 câu gõ tay là quá ít để phủ
hết cách nói của người thật.

LLM giỏi đúng việc đó: đẻ ra hàng trăm cách diễn đạt cùng một ý. Nhưng nếu gọi
LLM lúc phục vụ thì phải trả tiền theo lượt, phải chịu độ trễ mạng, và mất khả
năng giải thích quyết định. Gọi lúc BUILD thì được toàn bộ cái lợi mà không
mất gì: mô hình xuất xưởng vẫn là TF-IDF + Hồi quy Logistic 959 KB, vẫn chạy
0.5 ms/câu, vẫn giải thích được từng trọng số.

Đổi lại phải trả giá bằng công kiểm duyệt - xem `_accept`.

Nhà cung cấp
------------
Mặc định Gemini (có gói miễn phí). Đặt `AI_AUGMENT_BASE_URL` để trỏ sang bất kỳ
endpoint nào tương thích OpenAI (Groq, Together, LM Studio chạy máy nhà...).
Dùng `urllib` của thư viện chuẩn CHỨ KHÔNG dùng SDK: `requirements.txt` là thứ
quyết định kích thước ảnh triển khai, và file này không bao giờ chạy trên server.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from . import guards
from .dataset import (
    GENERATED_SUBDIR,
    GLOBAL_SCENARIO,
    OUT_OF_SCOPE,
    Dataset,
    IntentSpec,
    load_dataset,
)
from .features import japanese_ratio

#: Phiên bản prompt. Đổi prompt thì TĂNG số này - nó được ghi vào file sinh ra,
#: nên luôn truy được câu nào đến từ lần prompt nào.
PROMPT_VERSION = 3

DEFAULT_MODEL = "gemini-2.0-flash"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

#: Câu dài hơn mức này gần như chắc chắn là LLM lan man, không phải câu người
#: học sẽ gõ. Ngưỡng của tầng chặn là 200 - ở đây siết chặt hơn nhiều.
MAX_CHARS = 40
MIN_CHARS = 3

#: Tỉ lệ ký tự tiếng Nhật tối thiểu cho DỮ LIỆU TRAIN.
#:
#: Lỏng hơn ta tưởng, và cố ý: 「Sサイズはありますか」「Wi-Fiはありますか」
#: 「AIですか」「Tシャツはありますか」 đều là tiếng Nhật hoàn toàn tự nhiên mà
#: tỉ lệ chỉ 0.55-0.90. Siết lên 0.9 là vứt mất đúng nhóm câu người học hay gõ.
#: Rác thật sự đã bị `_FOREIGN_SCRIPT_RE` và tầng chặn bắt rồi.
MIN_JAPANESE_RATIO = 0.5

#: Hệ chữ KHÔNG BAO GIỜ hợp lệ trong dữ liệu này: Hangul, Kirin, Thái, Ả Rập,
#: Devanagari, Hebrew, Hy Lạp.
#:
#: Cần luật riêng vì `japanese_ratio` KHÔNG bắt được: 「값段を教えてください」
#: có đúng một ký tự Hangul trên mười, tỉ lệ 0.90 - lọt sạch mọi ngưỡng hợp lý.
#: Đây chính xác là kiểu lỗi mô hình sinh văn bản hay mắc khi nó trượt ngôn ngữ
#: giữa chừng, và nó âm thầm đầu độc dataset vì không test nào đỏ.
_FOREIGN_SCRIPT_RE = re.compile(
    "["
    "\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF"  # Hangul
    "\u0400-\u04FF"                                # Kirin
    "\u0E00-\u0E7F"                                # Thái
    "\u0600-\u06FF"                                # Ả Rập
    "\u0900-\u097F"                                # Devanagari
    "\u0590-\u05FF"                                # Hebrew
    "\u0370-\u03FF"                                # Hy Lạp
    "]"
)

#: Chuỗi chữ Latin liên tiếp dài từ ngần này trở lên bị coi là tiếng Anh lọt vào.
#:
#: Vì sao cần luật này BÊN CẠNH `MIN_JAPANESE_RATIO`: hai nhóm dưới đây có tỉ
#: lệ ký tự tiếng Nhật CHỒNG LÊN NHAU, nên không ngưỡng tỉ lệ nào tách được.
#:
#:     hợp lệ  「Wi-Fiはありますか」 0.55   「AIですか」 0.67
#:     rác     「friendly になれたら…」 0.58  「窓side の席は…」 0.69
#:
#: Thứ thật sự khác nhau là ĐỘ DÀI chuỗi Latin: từ mượn và chữ viết tắt mà
#: người Nhật thật sự gõ đều rất ngắn (S・M・L・T・AI・Wi・Fi), còn tiếng Anh
#: lọt vào thì dài. Ngoại lệ là vài thương hiệu/viết tắt đã vào tiếng Nhật.
MAX_LATIN_RUN = 3

#: Chuỗi Latin dài nhưng vẫn hợp lệ - người Nhật gõ y như vậy hằng ngày.
#: Cố ý để ngắn: đây là DỮ LIỆU TRAIN, thà mất một câu hợp lệ còn hơn nhận một
#: câu rác, vì dữ liệu hạt giống viết tay đã có người soát rồi.
_LATIN_ALLOWLIST = frozenset(
    {"atm", "wifi", "paypay", "suica", "pasmo", "sns", "sim"}
)

_LATIN_RUN_RE = re.compile(r"[A-Za-z]+")


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------
def build_prompt(spec: IntentSpec, siblings: list[IntentSpec], n: int) -> str:
    """Dựng prompt cho MỘT ý định.

    Phần quan trọng nhất không phải mô tả ý định cần sinh, mà là danh sách ý
    định ANH EM kèm ví dụ. Thiếu nó, LLM trôi dần sang ý định lân cận và ta
    thu về dữ liệu sai nhãn - loại lỗi độc nhất, vì nó dạy mô hình điều sai mà
    không có cảnh báo nào nổi lên.
    """
    sib_lines = []
    for other in siblings:
        sample = "、".join(other.examples[:4])
        sib_lines.append(f"  - {other.intent}: {sample}")
    siblings_block = "\n".join(sib_lines) if sib_lines else "  (không có)"

    seed_block = "\n".join(f"  - {e}" for e in spec.examples[:25])

    return f"""Bạn đang giúp xây dựng dữ liệu huấn luyện cho một bộ phân loại ý định
tiếng Nhật trình độ N5, dùng trong app luyện hội thoại cho người Việt học tiếng Nhật.

Ý ĐỊNH CẦN SINH: {spec.intent}
Mô tả: {spec.description}
Bối cảnh: {spec.scenario}

Câu ví dụ đã có:
{seed_block}

Các ý định KHÁC trong cùng bối cảnh - câu bạn sinh ra TUYỆT ĐỐI không được
thuộc về những ý định này:
{siblings_block}

Hãy viết {n} câu tiếng Nhật MỚI cho ý định "{spec.intent}".

Quy tắc:
1. Chỉ viết tiếng Nhật (hiragana/katakana/kanji). Không romaji, không tiếng Việt.
2. Trình độ N5-N4. Đây là câu người MỚI HỌC gõ ra, không phải văn viết trang trọng.
3. Mỗi câu dưới {MAX_CHARS} ký tự.
4. Đa dạng: đổi danh từ, đổi mức lịch sự (です/ます và thể thường), thêm bớt
   すみません, dùng cả dạng kana lẫn kanji của cùng một từ, thêm 〜んですが.
5. KHÔNG lặp lại câu đã có ở trên.
6. Nếu một câu có thể hiểu theo ý định anh em nào đó, ĐỪNG viết câu đó.

Chỉ trả về JSON, không giải thích, không markdown:
{{"sentences": ["câu 1", "câu 2", ...]}}"""


# ---------------------------------------------------------------------------
# Gọi nhà cung cấp
# ---------------------------------------------------------------------------
def _post(url: str, payload: dict, headers: dict, timeout: int = 120) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def call_llm(prompt: str, model: str, api_key: str) -> list[str]:
    """Trả về danh sách câu thô. Mọi việc lọc diễn ra ở nơi khác."""
    base = os.environ.get("AI_AUGMENT_BASE_URL")

    if base:  # endpoint tương thích OpenAI (Groq, Together, LM Studio...)
        data = _post(
            base.rstrip("/") + "/chat/completions",
            {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 1.0,
            },
            {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )
        text = data["choices"][0]["message"]["content"]
    else:  # Gemini
        data = _post(
            GEMINI_URL.format(model=model) + f"?key={api_key}",
            {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 1.0,
                    "responseMimeType": "application/json",
                },
            },
            {"Content-Type": "application/json"},
        )
        text = data["candidates"][0]["content"]["parts"][0]["text"]

    return _parse_sentences(text)


def _parse_sentences(text: str) -> list[str]:
    """Bóc danh sách câu ra khỏi phản hồi, chịu được vài kiểu lệch định dạng."""
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.S)
    if fence:
        text = fence.group(1)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Cứu vãn: nhặt mọi chuỗi trong ngoặc kép.
        return re.findall(r'"([^"\\]{2,60})"', text)
    if isinstance(data, dict):
        for key in ("sentences", "examples", "data", "items"):
            if isinstance(data.get(key), list):
                return [str(x) for x in data[key]]
        return []
    if isinstance(data, list):
        return [str(x) for x in data]
    return []


# ---------------------------------------------------------------------------
# Kiểm duyệt
# ---------------------------------------------------------------------------
def _accept(text: str, taken: dict[tuple[str, str], str], scenario: str) -> str | None:
    """Trả về lý do LOẠI, hoặc None nếu câu dùng được.

    Đây là phần đáng giá nhất của cả file. Mô hình sinh văn bản đẻ ra rất nhiều
    câu trông hợp lý nhưng không dùng được, và nếu để lọt thì chúng làm hỏng
    dataset một cách âm thầm - không test nào đỏ, chỉ có số liệu tụt dần.

    Thứ tự xếp từ rẻ tới đắt, và luật chắc chắn nhất đặt trước.
    """
    text = text.strip()
    if not (MIN_CHARS <= len(text) <= MAX_CHARS):
        return "độ dài"
    if _FOREIGN_SCRIPT_RE.search(text):
        return "lẫn hệ chữ lạ"
    if japanese_ratio(text) < MIN_JAPANESE_RATIO:
        return "quá ít chữ tiếng Nhật"
    for run in _LATIN_RUN_RE.findall(text):
        if len(run) >= MAX_LATIN_RUN and run.lower() not in _LATIN_ALLOWLIST:
            return f"lẫn chữ Latin dài ({run})"
    if guards.inspect(text).rejected:
        return "tầng chặn từ chối"
    if (scenario, text) in taken:
        return f"trùng với {taken[(scenario, text)]}"
    return None


def check_generated(strip: bool = False) -> int:
    """Soi lại các file trong `generated/` bằng đúng bộ luật lúc sinh.

    Tồn tại như một lệnh RIÊNG vì dữ liệu sinh không nhất thiết đến từ
    `augment.py` - có thể do người dán vào, do một nhà cung cấp khác, hoặc do
    một phiên trợ lý viết thẳng. Cổng kiểm duyệt phải chạy được độc lập với
    cái cổng sinh, nếu không nó chỉ bảo vệ được đúng con đường mà nó canh.

    Trả về số câu hỏng. `strip=True` thì viết lại file, bỏ hẳn câu hỏng.
    """
    import yaml

    seed = load_dataset(strict=False, include_generated=False)
    by_intent = {spec.intent: spec for spec in seed.specs}
    taken: dict[tuple[str, str], str] = {}
    for spec in seed.specs:
        for text in spec.examples:
            taken[(spec.scenario, text)] = spec.intent

    gen_dir = Path(__file__).resolve().parents[2] / "data" / "intents" / GENERATED_SUBDIR
    if not gen_dir.is_dir():
        print("Không có thư mục generated/ - không có gì để kiểm.")
        return 0

    total_bad = total_ok = 0

    for path in sorted(gen_dir.glob("*.yaml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        cleaned: list[tuple[str, list[str]]] = []
        file_bad = 0

        for entry in raw:
            intent = entry["intent"]
            spec = by_intent.get(intent)
            if spec is None:
                print(f"  {path.name}: ý định lạ '{intent}' - BỎ TOÀN BỘ")
                file_bad += len(entry.get("examples", []))
                continue

            keep: list[str] = []
            for example in entry.get("examples", []):
                text = str(example).strip()
                reason = _accept(text, taken, spec.scenario)
                if reason:
                    print(f"  {path.name}  {intent:<26} LOẠI [{reason}] {text}")
                    file_bad += 1
                    continue
                taken[(spec.scenario, text)] = intent
                keep.append(text)
            cleaned.append((intent, keep))
            total_ok += len(keep)

        total_bad += file_bad
        if strip and file_bad:
            header = []
            for line in path.read_text(encoding="utf-8").splitlines():
                if line.startswith("#") or not line.strip():
                    header.append(line)
                else:
                    break
            lines = header
            for intent, examples in cleaned:
                if not examples:
                    continue
                lines.append(f"- intent: {intent}")
                lines.append("  examples:")
                lines.extend(f"    - {e}" for e in examples)
                lines.append("")
            path.write_text("\n".join(lines), encoding="utf-8")
            print(f"  -> đã viết lại {path.name}, bỏ {file_bad} câu")

    print(f"\nGiữ được {total_ok} câu, loại {total_bad} câu.")
    return total_bad


def generate_for_intent(
    spec: IntentSpec,
    siblings: list[IntentSpec],
    n: int,
    model: str,
    api_key: str,
    taken: dict[tuple[str, str], str],
) -> tuple[list[str], dict[str, int]]:
    raw = call_llm(build_prompt(spec, siblings, n), model, api_key)
    kept: list[str] = []
    rejected: dict[str, int] = defaultdict(int)

    for text in raw:
        reason = _accept(text, taken, spec.scenario)
        if reason:
            rejected[reason] += 1
            continue
        taken[(spec.scenario, text.strip())] = spec.intent
        kept.append(text.strip())

    return kept, dict(rejected)


# ---------------------------------------------------------------------------
# Ghi ra đĩa
# ---------------------------------------------------------------------------
def write_generated(
    by_scenario: dict[str, list[tuple[str, list[str]]]], model: str, out_dir: Path
) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    written: list[Path] = []

    for scenario, entries in sorted(by_scenario.items()):
        if not entries:
            continue
        lines = [
            "# TỰ ĐỘNG SINH - ĐỪNG SỬA TAY.",
            "#",
            "# Sinh bởi: python -m nihongo_ai.augment",
            f"# Mô hình  : {model}",
            f"# Prompt   : v{PROMPT_VERSION}",
            f"# Thời điểm: {stamp}",
            "#",
            "# Đây KHÔNG phải dữ liệu hạt giống. Câu viết tay nằm ở thư mục cha.",
            "# Xoá cả thư mục `generated/` là quay về đúng dataset hạt giống.",
            "",
        ]
        for intent, examples in entries:
            lines.append(f"- intent: {intent}")
            lines.append("  examples:")
            lines.extend(f"    - {e}" for e in examples)
            lines.append("")

        path = out_dir / f"{scenario}.yaml"
        path.write_text("\n".join(lines), encoding="utf-8")
        written.append(path)

    return written


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="chỉ kiểm duyệt lại generated/ đang có, không gọi LLM",
    )
    parser.add_argument(
        "--strip",
        action="store_true",
        help="đi kèm --check: viết lại file, bỏ hẳn câu hỏng",
    )
    parser.add_argument("--intent", action="append", help="chỉ sinh cho ý định này")
    parser.add_argument("--all", action="store_true", help="sinh cho mọi ý định")
    parser.add_argument("--per-intent", type=int, default=40)
    parser.add_argument("--model", default=os.environ.get("AI_AUGMENT_MODEL", DEFAULT_MODEL))
    parser.add_argument(
        "--skip-out-of-scope",
        action="store_true",
        help="bỏ qua lớp từ chối (nó cần chăm sóc riêng, xem README)",
    )
    args = parser.parse_args()

    if args.check:
        bad = check_generated(strip=args.strip)
        sys.exit(1 if (bad and not args.strip) else 0)

    api_key = os.environ.get("AI_AUGMENT_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit(
            "Thiếu khoá API. Đặt AI_AUGMENT_API_KEY (hoặc GEMINI_API_KEY).\n"
            "Khoá Gemini miễn phí lấy ở https://aistudio.google.com/apikey"
        )

    # Hạt giống thôi: sinh dựa trên dữ liệu người viết, không tự bồi lên chính
    # đầu ra của mình. Bồi nhiều vòng lên dữ liệu máy sinh là con đường ngắn
    # nhất tới một dataset đồng huyết.
    data: Dataset = load_dataset(strict=False, include_generated=False)

    targets = [
        s
        for s in data.specs
        if (args.all or (args.intent and s.intent in args.intent))
        and not (args.skip_out_of_scope and s.intent == OUT_OF_SCOPE)
    ]
    if not targets:
        sys.exit("Không có ý định nào được chọn. Dùng --all hoặc --intent <tên>.")

    taken: dict[tuple[str, str], str] = {}
    for spec in data.specs:
        for text in spec.examples:
            taken[(spec.scenario, text)] = spec.intent

    by_scenario: dict[str, list[tuple[str, list[str]]]] = defaultdict(list)
    total_kept = 0

    for spec in targets:
        siblings = [
            s
            for s in data.specs
            if s.intent != spec.intent
            and s.scenario in (spec.scenario, GLOBAL_SCENARIO)
        ]
        try:
            kept, rejected = generate_for_intent(
                spec, siblings, args.per_intent, args.model, api_key, taken
            )
        except urllib.error.HTTPError as exc:
            print(f"  {spec.intent:<28} LỖI HTTP {exc.code} - bỏ qua")
            continue
        except (urllib.error.URLError, KeyError, IndexError) as exc:
            print(f"  {spec.intent:<28} LỖI {type(exc).__name__} - bỏ qua")
            continue

        by_scenario[spec.scenario].append((spec.intent, kept))
        total_kept += len(kept)
        note = "  ".join(f"{k}={v}" for k, v in sorted(rejected.items()))
        print(f"  {spec.intent:<28} giữ {len(kept):>3}   {note}")

    out_dir = Path(__file__).resolve().parents[2] / "data" / "intents" / GENERATED_SUBDIR
    written = write_generated(by_scenario, args.model, out_dir)

    print(f"\nGiữ lại {total_kept} câu, ghi vào {len(written)} file:")
    for path in written:
        print(f"  {path}")
    print("\nBước tiếp theo: python -m nihongo_ai.train && python -m nihongo_ai.evaluate_system")


if __name__ == "__main__":
    main()
