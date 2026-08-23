"""Tầng chặn tất định chạy TRƯỚC bộ phân loại.

Đây là hàng phòng thủ đầu tiên trong tài liệu xử lý tình huống khó. Nó bắt
những đầu vào mà *không mô hình thống kê nào nên phải xử lý*, với độ chính xác
100% và chi phí gần bằng 0:

    rỗng / quá ngắn        -> "Bạn thử viết một câu xem"
    sai hệ chữ viết        -> "Hãy thử gõ bằng tiếng Nhật nhé"
    đập bàn phím           -> "Mình chưa đọc được, thử lại nhé"

Vì sao đặt luật ở đây thay vì để mô hình học
--------------------------------------------
Mô hình CÓ học nhóm nhiễu này (chúng nằm trong nhãn out_of_scope), nhưng nó
chỉ đúng theo xác suất. Luật thì tất định: "asdfghjkl" KHÔNG BAO GIỜ lọt vào
ý định gọi món, ở mọi lần chạy, kể cả sau khi huấn luyện lại. Chặn sớm cũng
cho phép trả về lời nhắc CỤ THỂ ("gõ bằng tiếng Nhật") thay vì câu từ chối
chung chung của mô hình.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum

from .features import japanese_ratio, normalize

#: Dưới ngưỡng này coi như người dùng gõ nhầm hệ chữ viết.
#: Đặt 0.4 chứ không phải 0.5 vì câu hợp lệ vẫn có thể chứa nhiều ký tự latin
#: ("paypayは使えますか" -> 0.54, "tシャツはありますか" -> 0.89).
MIN_JAPANESE_RATIO = 0.4

#: Ngắn hơn mức này thì không đủ tín hiệu để phân loại ("ん", "?").
MIN_LENGTH = 2

#: Dài hơn mức này gần như chắc chắn là dán nhầm hoặc spam.
MAX_LENGTH = 200

#: Một ký tự lặp liên tiếp >= 4 lần ("あああああ", "wwwww").
_REPEAT_RE = re.compile(r"(.)\1{3,}")

#: Chỉ gồm dấu câu, ký hiệu, số và emoji - không có chữ.
_NO_LETTERS_RE = re.compile(r"^[\W\d_]+$", re.UNICODE)


class RejectReason(str, Enum):
    """Vì sao đầu vào bị chặn. Client ánh xạ giá trị này sang thông điệp UI."""

    EMPTY = "empty"
    TOO_SHORT = "too_short"
    TOO_LONG = "too_long"
    WRONG_SCRIPT = "wrong_script"
    GIBBERISH = "gibberish"
    NO_LETTERS = "no_letters"


@dataclass(frozen=True)
class GuardVerdict:
    """Kết quả của tầng chặn."""

    passed: bool
    reason: RejectReason | None = None
    #: Tỉ lệ ký tự tiếng Nhật, trả về kèm để client hiển thị gợi ý phù hợp.
    japanese_ratio: float = 0.0
    normalized: str = ""

    @property
    def rejected(self) -> bool:
        return not self.passed


def inspect(text: str) -> GuardVerdict:
    """Chạy toàn bộ luật chặn theo thứ tự rẻ nhất -> đắt nhất."""
    normalized = normalize(text)
    ratio = japanese_ratio(normalized)

    if not normalized:
        return GuardVerdict(False, RejectReason.EMPTY, ratio, normalized)

    if len(normalized) > MAX_LENGTH:
        return GuardVerdict(False, RejectReason.TOO_LONG, ratio, normalized)

    # Chỉ có ký hiệu / số / emoji -> không có nội dung ngôn ngữ.
    if _NO_LETTERS_RE.match(normalized):
        return GuardVerdict(False, RejectReason.NO_LETTERS, ratio, normalized)

    if len(normalized) < MIN_LENGTH:
        return GuardVerdict(False, RejectReason.TOO_SHORT, ratio, normalized)

    # Đập bàn phím: một ký tự lặp liên tiếp nhiều lần. Chỉ coi là rác khi đoạn
    # lặp chiếm phần lớn câu - "ええええええ" là rác, nhưng câu dài có một đoạn
    # kéo dài thì không.
    match = _REPEAT_RE.search(normalized)
    if match and len(match.group(0)) / len(normalized) >= 0.6:
        return GuardVerdict(False, RejectReason.GIBBERISH, ratio, normalized)

    if ratio < MIN_JAPANESE_RATIO:
        return GuardVerdict(False, RejectReason.WRONG_SCRIPT, ratio, normalized)

    return GuardVerdict(True, None, ratio, normalized)
