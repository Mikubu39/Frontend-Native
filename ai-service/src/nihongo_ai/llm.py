"""Client gọi Gemini - tầng duy nhất trong dịch vụ này chạm tới mạng.

Vì sao dùng `urllib` của thư viện chuẩn thay vì SDK `google-generativeai`
-----------------------------------------------------------------------
SDK chính thức kéo theo grpcio, protobuf và google-auth (~60 MB, và grpcio
phải biên dịch trên nhiều nền tảng). Toàn bộ thứ ta cần chỉ là MỘT lời gọi
POST kèm JSON. `urllib` cho đúng chừng đó với 0 phụ thuộc, giữ ảnh triển khai
đủ nhỏ để lọt gói hosting miễn phí và khởi động lại trong vài giây thay vì
vài chục giây. Mẫu này đã dùng sẵn trong `augment.py` từ trước.

Vì sao mọi lời gọi đều ép JSON có lược đồ
------------------------------------------
Câu trả lời của LLM đi thẳng ra UI. Nếu để nó trả văn xuôi tự do thì client
phải tự bóc tách bằng regex - thứ sẽ vỡ vào đúng ngày demo. Gemini hỗ trợ
`responseSchema`, nên ta khai báo hình dạng dữ liệu mong muốn và nhận về JSON
đã hợp lệ sẵn. Phần bóc tách còn lại chỉ là `json.loads`.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Literal

#: Model mặc định. Độ trễ thấp là điều kiện sống còn cho hội thoại thời gian
#: thực. Đổi bằng biến môi trường `GEMINI_MODEL` mà không cần sửa mã.
#:
#: GHIM MỘT PHIÊN BẢN CỤ THỂ chứ không dùng bí danh `gemini-flash-latest`:
#: prompt ở `prompts.py` được tinh chỉnh theo hành vi của một model nhất định,
#: và một app CHẤM ĐIỂM tiếng Nhật của người học thì không nên tự đổi model
#: dưới chân mình mà không ai hay.
#:
#: Vì sao 3.5 chứ không phải bản mới nhất - đo thật ngày 2026-08-25, mỗi model
#: 3 lượt `/respond` giống hệt nhau, cùng khoá, cùng lúc:
#:
#:     gemini-3.7-flash     0/3 thành công  (503 "high demand")
#:     gemini-flash-latest  0/3             (đang trỏ vào chính 3.7)
#:     gemini-3.6-flash     3/3   5.5s
#:     gemini-3.5-flash     3/3   4.0s   <- chọn cái này
#:     gemini-2.5-flash     3/3   3.7s
#:
#: Cả ba bản chạy được đều bắt đúng lỗi và giải thích bằng tiếng Việt đạt yêu
#: cầu, nên tiêu chí còn lại là ĐỘ TRỄ và TUỔI THỌ: phiên chỉ có 300 giây nên
#: mỗi giây chờ đều đắt, còn 2.5 là bản già nhất nên sẽ bị khai tử trước.
#:
#: Cái giá phải trả khi ghim: Google khai tử model theo lịch riêng (đã gặp thật
#: với `gemini-2.0-flash`). Khi đó dịch vụ trả 404 kèm thông điệp chỉ rõ phải
#: đổi sang model nào - xem `_http_message`.
DEFAULT_MODEL = "gemini-3.5-flash"

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

#: Người học đang ngồi chờ giữa cuộc hội thoại. Quá ngưỡng này thì thà báo lỗi
#: sớm còn hơn để họ nhìn vào màn hình trống.
TURN_TIMEOUT_S = 25.0

#: Bản tổng kết dài hơn nhiều lượt thoại thường, nên được nới rộng hơn.
SUMMARY_TIMEOUT_S = 60.0


#: File khoá cho môi trường phát triển. Trên hosting thật thì khoá đi qua biến
#: môi trường của nền tảng (Render/Cloud Run) và file này không tồn tại.
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


def load_env_file(path: Path | None = None) -> None:
    """Nạp `ai-service/.env` vào `os.environ` nếu file có tồn tại.

    Vì sao tự viết thay vì dùng `python-dotenv`
    -------------------------------------------
    Việc cần làm chỉ là đọc vài dòng `KHOÁ=giá trị`. Thêm một phụ thuộc vào
    `requirements.txt` cho chừng đó là đi ngược lại chính lý do dịch vụ này
    chỉ nặng ~15 MB.

    Biến môi trường THẬT luôn thắng file: trên máy dev có thể có sẵn `.env` cũ,
    và lệnh `GEMINI_API_KEY=... uvicorn ...` phải đè được lên nó - nếu không thì
    việc thử nhanh một khoá khác trở nên rất khó hiểu.
    """
    target = path or _ENV_FILE
    try:
        content = target.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return

    for line in content.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, _, value = stripped.partition("=")
        key = key.strip()
        # Bóc cặp nháy nếu người dùng gõ theo thói quen shell.
        value = value.strip().strip("\"'")
        if key and value and key not in os.environ:
            os.environ[key] = value


class LlmError(RuntimeError):
    """Gọi LLM thất bại. Thông điệp đã ở dạng dùng được thẳng trên UI."""


class LlmNotConfigured(LlmError):
    """Thiếu API key - lỗi cấu hình vận hành, không phải lỗi mạng."""


def api_key() -> str | None:
    """Khoá Gemini, hoặc None nếu chưa cấu hình.

    Không cache lại: trên hosting free, biến môi trường có thể được nạp sau
    khi tiến trình khởi động (ví dụ khi đổi secret rồi restart mềm).
    """
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("AI_AUGMENT_API_KEY")


def model_name() -> str:
    return os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)


def is_configured() -> bool:
    return bool(api_key())


Role = Literal["user", "model"]


def generate_json(
    *,
    system: str,
    contents: list[dict[str, Any]],
    schema: dict[str, Any],
    temperature: float = 0.8,
    timeout: float = TURN_TIMEOUT_S,
) -> dict[str, Any]:
    """Gọi Gemini và trả về đối tượng JSON đã bóc tách.

    `contents` theo đúng định dạng của Gemini:
        [{"role": "user"|"model", "parts": [{"text": "..."}]}]

    Ném `LlmError` với thông điệp tiếng Việt hiển thị được cho mọi thất bại;
    tầng gọi không cần biết gì về HTTP.
    """
    key = api_key()
    if not key:
        raise LlmNotConfigured(
            "Máy chủ AI chưa được cấu hình khoá Gemini. Đặt biến môi trường "
            "GEMINI_API_KEY rồi khởi động lại dịch vụ."
        )

    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
        # Ngưỡng an toàn để nguyên mặc định. Nội dung ở đây là hội thoại đời
        # thường (gọi món, hỏi đường) nên gần như không bao giờ chạm ngưỡng,
        # và nới lỏng thì phải tự chịu trách nhiệm kiểm duyệt.
    }

    request = urllib.request.Request(
        _GEMINI_URL.format(model=model_name()) + f"?key={key}",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise LlmError(_http_message(exc)) from exc
    except urllib.error.URLError as exc:
        raise LlmError(
            "Máy chủ AI không kết nối được tới Gemini. Kiểm tra mạng của server."
        ) from exc
    except TimeoutError as exc:
        raise LlmError(
            "Gemini phản hồi quá lâu. Bạn thử gửi lại sau một chút nhé."
        ) from exc

    return _extract(raw)


_BAD_KEY_MESSAGE = (
    "Khoá Gemini không hợp lệ hoặc đã bị thu hồi. Cần kiểm tra lại cấu hình server."
)


def _error_detail(exc: urllib.error.HTTPError) -> str:
    """Bóc câu giải thích của Google ra khỏi khung lỗi JSON.

    `exc` chỉ đọc được MỘT LẦN (nó là một luồng), nên mọi nhánh xử lý phải đi
    qua đúng hàm này thay vì tự gọi `exc.read()`.
    """
    try:
        return json.loads(exc.read().decode("utf-8"))["error"]["message"]
    except Exception:
        return str(exc.reason)


def _http_message(exc: urllib.error.HTTPError) -> str:
    """Chuyển mã lỗi HTTP thành câu người dùng đọc được và biết phải làm gì."""
    if exc.code == 429:
        return (
            "Gemini đang quá tải hoặc đã hết lượt miễn phí trong phút này. "
            "Chờ khoảng một phút rồi thử lại nhé."
        )
    if exc.code in (401, 403):
        return _BAD_KEY_MESSAGE
    if exc.code >= 500:
        return "Gemini đang gặp sự cố. Bạn thử lại sau ít phút nhé."
    if exc.code == 404:
        # Google khai tử model theo lịch riêng của họ (đã gặp thật với
        # `gemini-2.0-flash`). Thông điệp gốc có nêu model thay thế, nên giữ
        # nguyên nó và chỉ nói thêm phải sửa ở ĐÂU.
        return (
            f"Model '{model_name()}' không còn dùng được. Đặt biến môi trường "
            f"GEMINI_MODEL sang model mới rồi khởi động lại dịch vụ. "
            f"Gemini nói: {_error_detail(exc)}"
        )

    # 400 thường là lỗi lược đồ do CHÍNH TA gửi sai - giữ nguyên chi tiết để
    # còn sửa được, vì nó không bao giờ nên tới tay người dùng thật.
    detail = _error_detail(exc)

    # Ngoại lệ đáng kể: khoá sai KHÔNG trả 401 như thông lệ REST mà trả 400
    # kèm "API key not valid" (đã kiểm chứng trực tiếp với endpoint v1beta).
    # Không bắt riêng thì lỗi cấu hình phổ biến nhất lại hiện ra dưới dạng
    # thông báo gỡ lỗi khó hiểu.
    if "api key not valid" in detail.lower() or "API_KEY_INVALID" in detail:
        return _BAD_KEY_MESSAGE

    return f"Gemini từ chối yêu cầu ({exc.code}): {detail}"


def _extract(raw: dict[str, Any]) -> dict[str, Any]:
    """Lấy phần JSON trong khung phản hồi của Gemini.

    Khung này có thể KHÔNG chứa nội dung nào: khi bộ lọc an toàn chặn, hoặc khi
    câu trả lời bị cắt vì chạm trần token. Cả hai đều phải báo rõ chứ không
    được để nổ `KeyError` mơ hồ.
    """
    candidates = raw.get("candidates") or []
    if not candidates:
        blocked = (raw.get("promptFeedback") or {}).get("blockReason")
        raise LlmError(
            "Gemini đã chặn nội dung này. Bạn thử diễn đạt cách khác nhé."
            if blocked
            else "Gemini không trả về nội dung nào. Bạn thử lại nhé."
        )

    candidate = candidates[0]
    parts = (candidate.get("content") or {}).get("parts") or []
    text = "".join(part.get("text", "") for part in parts).strip()

    if not text:
        reason = candidate.get("finishReason", "")
        if reason == "MAX_TOKENS":
            raise LlmError("Câu trả lời của Gemini bị cắt giữa chừng. Thử lại nhé.")
        raise LlmError("Gemini trả về nội dung rỗng. Bạn thử lại nhé.")

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise LlmError("Gemini trả về dữ liệu sai định dạng. Bạn thử lại nhé.") from exc

    if not isinstance(parsed, dict):
        raise LlmError("Gemini trả về dữ liệu sai định dạng. Bạn thử lại nhé.")
    return parsed
