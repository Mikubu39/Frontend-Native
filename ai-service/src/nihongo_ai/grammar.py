"""Góp ý ngữ pháp / chính tả bằng LUẬT - cố ý giữ phạm vi rất hẹp.

Phạm vi và giới hạn (đọc trước khi mở rộng)
-------------------------------------------
Đây KHÔNG phải bộ kiểm tra ngữ pháp. Kiểm tra ngữ pháp tiếng Nhật cho đúng
cần bộ phân tích hình vị (MeCab/Sudachi) kèm từ điển vài chục MB - thứ mà dự
án đã cố tình tránh (xem `features.py`).

Thay vào đó, module này chỉ bắt những lỗi mà ta có thể khẳng định CHẮC CHẮN
bằng so khớp chuỗi thuần tuý, và mỗi luật đều được viết sao cho tỉ lệ báo nhầm
gần bằng 0. Báo nhầm ở đây đắt hơn bỏ sót nhiều lần: sửa sai một câu vốn đúng
sẽ dạy người học điều sai và làm họ mất niềm tin vào app.

Hệ quả: bộ này BỎ SÓT phần lớn lỗi ngữ pháp. Đó là đánh đổi có chủ ý, được
ghi rõ trong reports/EVALUATION.md mục "Giới hạn đã biết".
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum

from .features import normalize


class NoteKind(str, Enum):
    SPELLING = "spelling"        # sai chính tả chắc chắn
    POLITENESS = "politeness"    # gợi ý mức lịch sự, không phải lỗi
    PRAISE = "praise"            # ghi nhận khi người học dùng đúng mẫu khó


@dataclass(frozen=True)
class GrammarNote:
    kind: NoteKind
    message_vi: str
    #: Dạng viết đúng, khi luật đề xuất được một bản sửa cụ thể.
    suggestion: str | None = None
    original: str | None = None


# --- Lỗi chính tả kana kinh điển của người mới học -------------------------
# Chỉ đưa vào đây những cặp mà dạng "sai" gần như KHÔNG BAO GIỜ hợp lệ.
_SPELLING_FIXES: list[tuple[str, str, str]] = [
    ("こんにちわ", "こんにちは", "Trợ từ は trong lời chào viết là は, đọc là 'wa'."),
    ("こんばんわ", "こんばんは", "Tương tự こんにちは - viết は chứ không phải わ."),
    (
        "ありがとうごさいます",
        "ありがとうございます",
        "Thiếu dấu đục (dakuten): ざ chứ không phải さ.",
    ),
    (
        "ありがとうござます",
        "ありがとうございます",
        "Thiếu chữ い: ござ・い・ます.",
    ),
    (
        "おはようごさいます",
        "おはようございます",
        "Thiếu dấu đục (dakuten): ざ chứ không phải さ.",
    ),
    ("すいません", "すみません", "Dạng chuẩn khi viết là すみません (すいません là khẩu ngữ)."),
]

# --- Dấu hiệu của thể lịch sự ---------------------------------------------
_POLITE_MARKERS = ("です", "ます", "ください", "お願い", "ございます", "でしょうか")

# Động từ thể thường kết câu: kết thúc bằng nguyên âm u-dòng, không có です/ます.
_PLAIN_VERB_TAIL = re.compile(r"[うくぐすつぬぶむるい]$")

# Mẫu khó, đáng khen khi người học dùng đúng.
_ADVANCED_PATTERNS: list[tuple[str, str]] = [
    ("てもいいですか", "Dùng đúng mẫu xin phép 〜てもいいですか. Rất tự nhiên!"),
    ("ていただけますか", "Mẫu 〜ていただけますか rất lịch sự, dùng chuẩn!"),
    ("ませんか", "Mẫu rủ rê 〜ませんか dùng rất đúng chỗ."),
    ("と申します", "と申します là kính ngữ khi giới thiệu tên - rất chuẩn!"),
    ("かしこまりました", "Dùng được kính ngữ かしこまりました, ấn tượng đấy!"),
]


def analyse(text: str) -> list[GrammarNote]:
    """Trả về các góp ý cho một câu. Danh sách rỗng = không có gì để nói."""
    notes: list[GrammarNote] = []
    normalized = normalize(text, fold_katakana=False)
    if not normalized:
        return notes

    # 1. Chính tả - độ chắc chắn cao nhất, nên đặt trước.
    for wrong, right, why in _SPELLING_FIXES:
        if wrong in normalized:
            notes.append(
                GrammarNote(
                    kind=NoteKind.SPELLING,
                    message_vi=why,
                    suggestion=normalized.replace(wrong, right),
                    original=wrong,
                )
            )

    # 2. Mức lịch sự - chỉ là GỢI Ý, không phải lỗi. Bỏ qua câu quá ngắn vì
    #    はい / いいえ / ええ hoàn toàn tự nhiên ở dạng trần.
    has_polite = any(marker in normalized for marker in _POLITE_MARKERS)
    if not has_polite and len(normalized) >= 5 and _PLAIN_VERB_TAIL.search(normalized):
        notes.append(
            GrammarNote(
                kind=NoteKind.POLITENESS,
                message_vi=(
                    "Câu đang ở thể thường. Với người lạ hoặc nhân viên phục vụ, "
                    "thêm です/ます sẽ lịch sự hơn."
                ),
            )
        )

    # 3. Khen khi dùng đúng mẫu khó - phần thưởng, không phải sửa lỗi.
    for pattern, praise in _ADVANCED_PATTERNS:
        if pattern in normalized:
            notes.append(GrammarNote(kind=NoteKind.PRAISE, message_vi=praise))
            break  # tối đa một lời khen mỗi lượt, tránh làm loãng

    return notes
