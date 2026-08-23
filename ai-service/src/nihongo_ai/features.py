"""Chuẩn hoá văn bản tiếng Nhật và bộ trích đặc trưng.

Vì sao dùng n-gram KÝ TỰ chứ không phải n-gram TỪ
--------------------------------------------------
Tiếng Nhật không có dấu cách giữa các từ. Muốn tách từ phải cần một bộ phân
tích hình vị (MeCab / Sudachi / Janome) kèm từ điển 50-100 MB, phải biên dịch
native trên Windows, và làm nặng thêm phần triển khai.

n-gram ký tự đi vòng qua toàn bộ vấn đề đó: chúng ta cắt trực tiếp trên chuỗi
ký tự. Với tiếng Nhật cách này đặc biệt hiệu quả vì các hình vị chức năng mang
nhiều thông tin nhất lại chỉ dài 1-3 ký tự và nằm ở cuối câu:
    ...ですか / ...ください / ...お願いします / ...はどこ / ...はいくら
Đây chính xác là những gì n-gram ký tự 2-4 bắt được. `evaluate.py` đo lại
khẳng định này bằng cách so trực tiếp với biến thể n-gram từ.
"""

from __future__ import annotations

import re
import unicodedata

from sklearn.feature_extraction.text import TfidfVectorizer

# Khoảng mã Unicode dùng để phân loại ký tự.
_HIRAGANA = (0x3041, 0x309F)
_KATAKANA = (0x30A0, 0x30FF)
_KANJI = (0x4E00, 0x9FFF)
_HALFWIDTH_KATAKANA = (0xFF66, 0xFF9D)

_WHITESPACE_RE = re.compile(r"\s+")


def _in(cp: int, rng: tuple[int, int]) -> bool:
    return rng[0] <= cp <= rng[1]


def is_japanese_char(ch: str) -> bool:
    """Ký tự có thuộc hệ chữ viết tiếng Nhật không (kana hoặc kanji)."""
    cp = ord(ch)
    return (
        _in(cp, _HIRAGANA)
        or _in(cp, _KATAKANA)
        or _in(cp, _KANJI)
        or _in(cp, _HALFWIDTH_KATAKANA)
    )


def japanese_ratio(text: str) -> float:
    """Tỉ lệ ký tự tiếng Nhật trên tổng số ký tự KHÔNG PHẢI khoảng trắng.

    Dùng ở tầng chặn đầu vào để bắt trường hợp người dùng gõ nhầm ngôn ngữ
    (romaji / tiếng Việt) trước khi tốn công chạy mô hình.
    """
    meaningful = [c for c in text if not c.isspace()]
    if not meaningful:
        return 0.0
    return sum(1 for c in meaningful if is_japanese_char(c)) / len(meaningful)


def katakana_to_hiragana(text: str) -> str:
    """Đưa katakana về hiragana (giữ nguyên dấu kéo dài ー).

    Người mới học thường viết một từ ở dạng kana "sai" (めにゅー thay vì
    メニュー). Gộp hai hệ về một giúp mô hình khớp được cả hai cách viết.
    Lợi ích của bước này được đo bằng ablation trong `evaluate.py`.
    """
    out = []
    for ch in text:
        cp = ord(ch)
        # 0x30A1..0x30F6 ánh xạ 1-1 sang hiragana bằng cách trừ 0x60.
        if 0x30A1 <= cp <= 0x30F6:
            out.append(chr(cp - 0x60))
        else:
            out.append(ch)
    return "".join(out)


def normalize(text: str, fold_katakana: bool = True) -> str:
    """Chuẩn hoá một câu người dùng nhập trước khi vector hoá.

    Các bước, theo đúng thứ tự:
      1. NFKC  - gộp ký tự latin/katakana nửa độ rộng về dạng đầy đủ, để
                 "ｑｗｅｒｔｙ" và "qwerty" thành một, "ｶﾀｶﾅ" và "カタカナ"
                 cũng vậy.
      2. lower  - chỉ ảnh hưởng ký tự latin (Tシャツ / tシャツ).
      3. gộp khoảng trắng - người học hay chèn dấu cách theo thói quen tiếng Anh.
      4. katakana -> hiragana (tuỳ chọn).
    """
    text = unicodedata.normalize("NFKC", text)
    text = text.lower()
    text = _WHITESPACE_RE.sub(" ", text).strip()
    if fold_katakana:
        text = katakana_to_hiragana(text)
    return text


class JapaneseNormalizer:
    """Bộ tiền xử lý picklable dùng cho TfidfVectorizer.

    Phải là một lớp ở cấp module chứ không phải lambda: joblib cần pickle nó
    cùng với pipeline khi lưu mô hình ra đĩa.
    """

    def __init__(self, fold_katakana: bool = True) -> None:
        self.fold_katakana = fold_katakana

    def __call__(self, text: str) -> str:
        return normalize(text, fold_katakana=self.fold_katakana)

    def __repr__(self) -> str:  # giúp log của GridSearch đọc được
        return f"JapaneseNormalizer(fold_katakana={self.fold_katakana})"


def build_char_vectorizer(
    # Mặc định lấy từ grid search 280 tổ hợp trong `tune.py`
    # (reports/tuning.json). n-gram tới 5 ký tự bắt trọn được các đuôi câu dài
    # như "ください" / "ますか" vốn là nơi tiếng Nhật mã hoá ý định.
    ngram_range: tuple[int, int] = (2, 5),
    fold_katakana: bool = True,
    min_df: int = 1,
    sublinear_tf: bool = True,
) -> TfidfVectorizer:
    """TF-IDF trên n-gram ký tự - bộ trích đặc trưng mặc định.

    `analyzer="char_wb"` giới hạn n-gram trong phạm vi từng "từ" (chuỗi không
    có khoảng trắng). Với tiếng Nhật gần như cả câu là một "từ" nên nó hoạt
    động rất giống `char`, nhưng vẫn thêm được đệm ở biên giúp bắt các mẫu
    "bắt đầu câu" và "kết thúc câu" - mà kết thúc câu chính là chỗ tiếng Nhật
    đặt thông tin về ý định (ですか / ください / お願いします).
    """
    return TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=ngram_range,
        preprocessor=JapaneseNormalizer(fold_katakana),
        lowercase=False,  # đã xử lý trong preprocessor
        min_df=min_df,
        sublinear_tf=sublinear_tf,
    )


def build_word_vectorizer(
    ngram_range: tuple[int, int] = (1, 2),
    fold_katakana: bool = True,
) -> TfidfVectorizer:
    """TF-IDF n-gram TỪ - chỉ dùng để làm ĐỐI CHỨNG.

    Không có bộ tách từ, `token_pattern` mặc định của scikit-learn coi một
    chuỗi kana/kanji liền nhau là MỘT token duy nhất. Nghĩa là "駅はどこですか"
    trở thành đúng một đặc trưng, không khớp được với "駅はどこにありますか".
    Đây chính là điều ta muốn chứng minh là kém - xem bảng so sánh trong
    reports/EVALUATION.md.
    """
    return TfidfVectorizer(
        analyzer="word",
        ngram_range=ngram_range,
        token_pattern=r"(?u)\b\w+\b",
        preprocessor=JapaneseNormalizer(fold_katakana),
        lowercase=False,
        min_df=1,
    )
