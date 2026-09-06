"""Test cho tầng HTTP + tầng điều phối hội thoại.

Nguyên tắc: KHÔNG test nào được gọi Gemini thật. Lời gọi mạng bị thay bằng
`monkeypatch` ở đúng một chỗ - `llm.generate_json` - vì đó là ranh giới duy
nhất giữa dịch vụ này và thế giới bên ngoài. Nhờ vậy bộ test chạy trong vài
mili giây, không cần khoá API và không tốn quota.

Thứ được kiểm ở đây là phần ta thật sự viết: chuẩn hoá dữ liệu model trả về,
ánh xạ lỗi sang mã HTTP, và các ràng buộc đầu vào.
"""

from __future__ import annotations

import io
import json
import urllib.error

import pytest
from fastapi.testclient import TestClient

from nihongo_ai import engine, llm, prompts
from nihongo_ai.api import app
from nihongo_ai.topics import load_topics

client = TestClient(app)


@pytest.fixture(autouse=True)
def _configured_key(monkeypatch):
    """Mọi test mặc định coi như đã cấu hình khoá.

    Test nào muốn kiểm trạng thái CHƯA cấu hình thì tự xoá biến này.
    """
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")


def _stub(monkeypatch, payload, capture: dict | None = None):
    """Thay lời gọi Gemini bằng một payload dựng sẵn."""

    def fake(**kwargs):
        if capture is not None:
            capture.update(kwargs)
        return payload

    monkeypatch.setattr(llm, "generate_json", fake)


# ---------------------------------------------------------------------------
# Health & danh mục chủ đề
# ---------------------------------------------------------------------------
def test_health_ok_khi_co_khoa():
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["provider"] == "gemini"
    assert body["sessionSeconds"] == 90


def test_health_bao_unconfigured_khi_thieu_khoa(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("AI_AUGMENT_API_KEY", raising=False)
    assert client.get("/health").json()["status"] == "unconfigured"


def test_danh_sach_chu_de():
    body = client.get("/api/v1/conversation/topics").json()
    ids = {topic["id"] for topic in body}
    assert {"restaurant", "directions", "shopping", "self_intro"} <= ids
    # Chủ đề tự nhập KHÔNG được nằm trong danh mục - nó do client dựng ra.
    assert "custom" not in ids


# ---------------------------------------------------------------------------
# /start
# ---------------------------------------------------------------------------
OPENING = {
    "reply": {"ja": "いらっしゃいませ！", "vi": "Xin mời vào!"},
    "hints": [
        {"ja": "二人です。", "vi": "Hai người ạ."},
        {"ja": "一人です。", "vi": "Một người ạ."},
    ],
}


def test_start_tra_ve_cau_chao_va_do_dai_phien(monkeypatch):
    _stub(monkeypatch, OPENING)

    response = client.post(
        "/api/v1/conversation/start", json={"topicId": "restaurant"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"]["ja"] == "いらっしゃいませ！"
    assert len(body["hints"]) == 2
    assert body["durationSeconds"] == prompts.SESSION_MINUTES * 60
    assert body["topic"]["personaName"] == "Nhân viên phục vụ"


def test_start_chu_de_khong_ton_tai(monkeypatch):
    _stub(monkeypatch, OPENING)
    assert (
        client.post("/api/v1/conversation/start", json={"topicId": "kim-tinh"}).status_code
        == 404
    )


def test_start_chu_de_tu_nhap(monkeypatch):
    _stub(monkeypatch, OPENING)

    response = client.post(
        "/api/v1/conversation/start",
        json={"topicId": "custom", "customTopic": "đi khám bệnh"},
    )

    assert response.status_code == 200
    assert response.json()["topic"]["title"] == "đi khám bệnh"


def test_start_chu_de_tu_nhap_bo_trong_thi_bao_400(monkeypatch):
    _stub(monkeypatch, OPENING)
    response = client.post(
        "/api/v1/conversation/start", json={"topicId": "custom", "customTopic": "   "}
    )
    assert response.status_code == 400


def test_start_thieu_khoa_tra_503(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("AI_AUGMENT_API_KEY", raising=False)
    response = client.post(
        "/api/v1/conversation/start", json={"topicId": "restaurant"}
    )
    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


# ---------------------------------------------------------------------------
# /respond
# ---------------------------------------------------------------------------
TURN = {
    "reply": {"ja": "かしこまりました。", "vi": "Vâng ạ."},
    "hints": [{"ja": "メニューをください。", "vi": "Cho tôi xem thực đơn."}],
    "corrections": [
        {
            "severity": "error",
            "category": "spelling",
            "original": "こんにちわ",
            "suggestion": "こんにちは",
            "explanationVi": "Trợ từ は trong lời chào viết là は.",
        }
    ],
    "understood": True,
}


def test_respond_tra_ve_gop_y_va_gui_dung_lich_su(monkeypatch):
    captured: dict = {}
    _stub(monkeypatch, TURN, captured)

    response = client.post(
        "/api/v1/conversation/respond",
        json={
            "topicId": "restaurant",
            "text": "二人です。",
            "remainingSeconds": 240,
            "history": [
                {"role": "ai", "text": "いらっしゃいませ！"},
                {"role": "user", "text": "こんにちわ"},
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["corrections"][0]["suggestion"] == "こんにちは"
    assert body["understood"] is True

    # Lịch sử phải được chuyển đúng sang vai của Gemini, và câu mới nhất phải
    # nằm ở cuối.
    contents = captured["contents"]
    assert [c["role"] for c in contents] == ["model", "user", "user"]
    assert contents[-1]["parts"][0]["text"] == "二人です。"


def test_respond_nhac_ket_thuc_khi_sap_het_gio(monkeypatch):
    captured: dict = {}
    _stub(monkeypatch, TURN, captured)

    client.post(
        "/api/v1/conversation/respond",
        json={"topicId": "restaurant", "text": "はい。", "remainingSeconds": 15},
    )

    # Chỉ thị sân khấu chỉ được chèn khi thời gian sắp hết - đây là cơ chế duy
    # nhất khiến hội thoại tự kết thúc gọn gàng thay vì bị cắt ngang.
    assert "còn khoảng 15 giây" in captured["contents"][-1]["parts"][0]["text"]


def test_respond_khong_nhac_ket_thuc_khi_con_nhieu_gio(monkeypatch):
    captured: dict = {}
    _stub(monkeypatch, TURN, captured)

    client.post(
        "/api/v1/conversation/respond",
        json={"topicId": "restaurant", "text": "はい。", "remainingSeconds": 240},
    )

    assert captured["contents"][-1]["parts"][0]["text"] == "はい。"


def test_respond_bo_gop_y_rong(monkeypatch):
    _stub(
        monkeypatch,
        {
            **TURN,
            "corrections": [
                {
                    "severity": "suggestion",
                    "category": "grammar",
                    "original": "",
                    "suggestion": "",
                    "explanationVi": "",
                }
            ],
        },
    )

    response = client.post(
        "/api/v1/conversation/respond",
        json={"topicId": "restaurant", "text": "はい。"},
    )

    # Góp ý không có bản sửa lẫn lời giải thích thì chỉ là nhiễu trên UI.
    assert response.json()["corrections"] == []


def test_respond_cau_rong_bi_tu_choi(monkeypatch):
    _stub(monkeypatch, TURN)
    response = client.post(
        "/api/v1/conversation/respond", json={"topicId": "restaurant", "text": "   "}
    )
    assert response.status_code == 400


def test_respond_loi_gemini_thanh_502(monkeypatch):
    def boom(**kwargs):
        raise llm.LlmError("Gemini đang quá tải.")

    monkeypatch.setattr(llm, "generate_json", boom)

    response = client.post(
        "/api/v1/conversation/respond",
        json={"topicId": "restaurant", "text": "はい。"},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "Gemini đang quá tải."


# ---------------------------------------------------------------------------
# /summary
# ---------------------------------------------------------------------------
SUMMARY = {
    "overallVi": "Bạn đã gọi món thành công.",
    "score": 78,
    "strengths": ["Dùng đúng thể ますsuốt phiên", ""],
    "mistakes": [
        {
            "original": "わたしはラーメンをたべたい",
            "corrected": "ラーメンをお願いします。",
            "explanationVi": "Khi gọi món nên dùng お願いします.",
            "category": "naturalness",
            "severity": "suggestion",
        },
        {"original": "", "corrected": "x", "explanationVi": "y", "category": "grammar", "severity": "error"},
    ],
    "grammarPoints": [
        {
            "pattern": "〜をお願いします",
            "explanationVi": "Mẫu gọi món lịch sự.",
            "exampleJa": "ラーメンをお願いします。",
            "exampleVi": "Cho tôi một ramen.",
        }
    ],
    "naturalnessTips": [
        {
            "instead": "たべたいです",
            "prefer": "お願いします",
            "whyVi": "Người Nhật gọi món bằng お願いします chứ ít nói 'tôi muốn ăn'.",
        }
    ],
    "nextFocus": ["Luyện mẫu 〜をお願いします"],
}


def test_summary_chuan_hoa_va_dem_luot(monkeypatch):
    _stub(monkeypatch, SUMMARY)

    response = client.post(
        "/api/v1/conversation/summary",
        json={
            "topicId": "restaurant",
            "durationSeconds": 300,
            "history": [
                {"role": "ai", "text": "いらっしゃいませ！"},
                {"role": "user", "text": "二人です。"},
                {"role": "ai", "text": "こちらへどうぞ。"},
                {"role": "user", "text": "わたしはラーメンをたべたい"},
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["score"] == 78
    assert body["turnCount"] == 2
    # Chuỗi rỗng và lỗi thiếu câu gốc bị loại - người học không đối chiếu được.
    assert body["strengths"] == ["Dùng đúng thể ますsuốt phiên"]
    assert len(body["mistakes"]) == 1
    assert body["naturalnessTips"][0]["prefer"] == "お願いします"


def test_summary_tu_choi_khi_nguoi_hoc_chua_noi_gi(monkeypatch):
    _stub(monkeypatch, SUMMARY)

    response = client.post(
        "/api/v1/conversation/summary",
        json={
            "topicId": "restaurant",
            "history": [{"role": "ai", "text": "いらっしゃいませ！"}],
        },
    )

    assert response.status_code == 400


def test_summary_diem_ngoai_khoang_bi_kep_lai(monkeypatch):
    _stub(monkeypatch, {**SUMMARY, "score": 999})

    response = client.post(
        "/api/v1/conversation/summary",
        json={
            "topicId": "restaurant",
            "history": [{"role": "user", "text": "はい。"}],
        },
    )

    assert response.json()["score"] == 100


# ---------------------------------------------------------------------------
# Tầng điều phối
# ---------------------------------------------------------------------------
def test_lich_su_qua_dai_bi_cat_tu_dau(monkeypatch):
    captured: dict = {}
    _stub(monkeypatch, TURN, captured)

    long_history = [
        engine.HistoryTurn(role="user" if i % 2 else "ai", text=f"câu {i}")
        for i in range(engine.MAX_HISTORY_TURNS + 10)
    ]
    engine.respond(
        topic=load_topics()["restaurant"],
        history=long_history,
        text="mới nhất",
        remaining_seconds=200,
    )

    contents = captured["contents"]
    # +1 vì câu mới nhất được nối thêm sau khi cắt.
    assert len(contents) == engine.MAX_HISTORY_TURNS + 1
    # Cắt phần ĐẦU: ngữ cảnh gần quan trọng hơn với hội thoại.
    assert "câu 10" in contents[0]["parts"][0]["text"]


def test_transcript_ghi_ro_ai_noi_cau_nao():
    topic = load_topics()["restaurant"]
    text = engine.render_transcript(
        topic,
        [
            engine.HistoryTurn(role="ai", text="いらっしゃいませ"),
            engine.HistoryTurn(role="user", text="二人です"),
        ],
    )

    assert "NGƯỜI HỌC: 二人です" in text
    assert "AI (Nhân viên phục vụ): いらっしゃいませ" in text


# ---------------------------------------------------------------------------
# Ánh xạ lỗi HTTP của Gemini
# ---------------------------------------------------------------------------
def _http_error(code: int, message: str) -> urllib.error.HTTPError:
    body = json.dumps({"error": {"message": message}}).encode("utf-8")
    return urllib.error.HTTPError(
        url="https://example.invalid",
        code=code,
        msg="err",
        hdrs=None,  # type: ignore[arg-type]
        fp=io.BytesIO(body),
    )


def test_khoa_sai_tra_400_van_bao_dung_nguyen_nhan():
    # Gemini KHÔNG trả 401 cho khoá sai mà trả 400 kèm "API key not valid" -
    # đã kiểm chứng trực tiếp với endpoint v1beta. Không bắt riêng thì lỗi cấu
    # hình phổ biến nhất lại hiện ra dưới dạng thông báo gỡ lỗi khó hiểu.
    message = llm._http_message(
        _http_error(400, "API key not valid. Please pass a valid API key.")
    )
    assert "Khoá Gemini không hợp lệ" in message


def test_het_quota_bao_cho_cho_mot_phut():
    message = llm._http_message(_http_error(429, "Resource has been exhausted"))
    assert "một phút" in message


def test_loi_luoc_do_van_giu_nguyen_chi_tiet_de_con_sua_duoc():
    message = llm._http_message(_http_error(400, "Invalid JSON payload"))
    assert "Invalid JSON payload" in message


# ---------------------------------------------------------------------------
# Nạp khoá từ file .env (chỉ dùng lúc phát triển)
# ---------------------------------------------------------------------------
def test_doc_duoc_khoa_tu_file_env(tmp_path, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    env_file = tmp_path / ".env"
    env_file.write_text(
        "# ghi chú\n"
        "\n"
        'GEMINI_API_KEY="khoa-trong-file"\n'
        "GEMINI_MODEL=gemini-3.6-flash\n",
        encoding="utf-8",
    )

    llm.load_env_file(env_file)

    assert llm.api_key() == "khoa-trong-file"
    assert llm.model_name() == "gemini-3.6-flash"


def test_bien_moi_truong_that_thang_file_env(tmp_path, monkeypatch):
    # `GEMINI_API_KEY=... uvicorn ...` phải đè được lên `.env` cũ trên máy dev,
    # nếu không việc thử nhanh một khoá khác trở nên rất khó hiểu.
    monkeypatch.setenv("GEMINI_API_KEY", "khoa-tu-dong-lenh")
    env_file = tmp_path / ".env"
    env_file.write_text("GEMINI_API_KEY=khoa-trong-file\n", encoding="utf-8")

    llm.load_env_file(env_file)

    assert llm.api_key() == "khoa-tu-dong-lenh"


def test_khong_co_file_env_thi_im_lang_bo_qua(tmp_path):
    # Trên hosting thật file này không tồn tại - đó là trạng thái BÌNH THƯỜNG,
    # không phải lỗi.
    llm.load_env_file(tmp_path / "khong-ton-tai.env")
