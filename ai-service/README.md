# Nihongo Conversation AI

Dịch vụ AI luyện hội thoại tiếng Nhật cho app **Frontend-Native**: người học
chọn một chủ đề (hoặc tự gõ chủ đề của riêng mình), AI đóng vai người Nhật và
trò chuyện qua lại bằng tiếng Nhật trong **5 phút**, rồi trả về một **bản tổng
kết lỗi** — sai ở đâu, sửa thế nào, và cách nói tự nhiên hơn.

Lõi là **Gemini** (`gemini-3.5-flash`) với JSON có lược đồ ràng buộc. Dịch vụ
này chỉ làm ba việc: dựng prompt, gọi Gemini, và chuẩn hoá kết quả trước khi
đưa ra UI.

> **Lịch sử phiên bản.** Bản 1.x dùng bộ phân loại ý định tự huấn luyện
> (TF-IDF n-gram ký tự + hồi quy logistic) ghép với máy trạng thái hội thoại
> FSM. Toàn bộ dữ liệu, mã và số liệu đánh giá của bản đó vẫn nằm trong git —
> xem `reports/EVALUATION.md`, `reports/DATASET.md`, và lấy lại mã bằng
> `git checkout <commit-trước-2.0> -- ai-service/`. Bản 2.0 thay hẳn đường
> chạy đó bằng LLM vì FSM không thể xử lý chủ đề tự do và không thể tổng kết
> lỗi ngữ pháp ngoài vài luật so khớp chuỗi.

---

## Kiến trúc

```
Câu người học gõ  +  lịch sử hội thoại  +  giây còn lại
      │
      ▼
┌──────────────────────┐  Tra chủ đề (data/topics.yaml) hoặc dựng chủ đề tự nhập
│ topics.py            │
└──────────┬───────────┘
           ▼
┌──────────────────────┐  System prompt (vai diễn, mức N5, quy tắc sửa lỗi)
│ prompts.py           │  + lược đồ JSON ép Gemini trả đúng hình dạng
└──────────┬───────────┘
           ▼
┌──────────────────────┐  Ghép lịch sử -> contents, gọi LLM, lọc kết quả rác
│ engine.py            │
└──────────┬───────────┘
           ▼
┌──────────────────────┐  urllib + REST v1beta. Không SDK, không phụ thuộc nặng.
│ llm.py               │  Mọi lỗi -> thông điệp tiếng Việt dùng được trên UI
└──────────┬───────────┘
           ▼
       api.py (FastAPI, PHI TRẠNG THÁI)
```

### Vì sao phi trạng thái

Server **không giữ phiên**. Client gửi kèm toàn bộ lịch sử ở mỗi lượt, và tự
giữ đồng hồ đếm ngược. Lý do:

- Hosting free ngủ đông rồi khởi động lại — phiên trong RAM sẽ bốc hơi giữa
  chừng cuộc trò chuyện.
- Không cần Redis/DB → hạ tầng bằng không.
- Người học bấm "gửi lại" sau lỗi mạng không mất mạch chuyện.

Đồng hồ 5 phút do client giữ nên người dùng khai gian được, nhưng gian lận ở
đây chỉ có nghĩa là "tự cho mình luyện thêm vài phút" — không đáng để dựng hạ
tầng phiên.

### Vì sao `urllib` chứ không phải SDK `google-generativeai`

SDK kéo theo grpcio + protobuf + google-auth (~60 MB, grpcio phải biên dịch).
Thứ ta cần chỉ là một lời gọi POST kèm JSON. Kết quả: ảnh triển khai ~15 MB,
tỉnh dậy sau ngủ đông trong vài giây.

---

## Cấu trúc thư mục

```
ai-service/
├── data/
│   └── topics.yaml         # 4 chủ đề dựng sẵn: persona + goal + bối cảnh
│
├── src/nihongo_ai/
│   ├── topics.py           # nạp chủ đề + dựng chủ đề người học tự nhập
│   ├── prompts.py          # system prompt + lược đồ JSON (chỉnh nhiều nhất)
│   ├── engine.py           # điều phối một lượt / một bản tổng kết
│   ├── llm.py              # lời gọi Gemini duy nhất trong toàn dịch vụ
│   └── api.py              # FastAPI: kiểm đầu vào, ánh xạ lỗi, dựng response
│
├── tests/test_api.py       # 25 test, KHÔNG test nào gọi mạng thật
└── reports/                # số liệu đánh giá của kiến trúc 1.x (tham khảo)
```

---

## Chạy cục bộ

```bash
cd ai-service
python -m venv .venv && .venv/Scripts/activate    # Windows
pip install -r requirements.txt -r requirements-dev.txt

cp .env.example .env        # rồi điền GEMINI_API_KEY vào đó
PYTHONPATH=src uvicorn nihongo_ai.api:app --reload --port 8000
```

### Lấy khoá Gemini

1. Mở <https://aistudio.google.com/apikey> và đăng nhập bằng tài khoản Google.
2. Bấm **Create API key**. Lần đầu, Google tự tạo một project mặc định cho bạn
   (mỗi khoá Gemini luôn gắn với một project Google Cloud).
3. Sao chép khoá và dán vào `ai-service/.env`:

   ```
   GEMINI_API_KEY=<khoá vừa copy>
   ```

Khoá dùng được ngay, không cần thẻ tín dụng. Định dạng khoá có hai kiểu tuỳ
thời điểm tạo (`AIza...` cũ và `AQ.Ab8...` mới) - cứ dán nguyên văn, dịch vụ
không kiểm tra hình dạng khoá. Hạn mức gói miễn phí xem tại
<https://aistudio.google.com/rate-limit> (Google không công bố con số cố định
nữa - nó thay đổi theo tài khoản).

**Thứ tự ưu tiên khi đọc khoá:** biến môi trường thật > file `.env`. Nhờ vậy
`GEMINI_API_KEY=... uvicorn ...` luôn đè được lên `.env` cũ khi cần thử nhanh
một khoá khác. `.env` đã nằm trong `.gitignore` - **không bao giờ commit khoá**.
Nếu lỡ commit, vào lại trang trên xoá khoá đó rồi tạo khoá mới; khoá cũ chết
ngay lập tức.

Kiểm tra nhanh:

```bash
curl http://localhost:8000/health
# {"status":"ok","provider":"gemini","model":"gemini-3.5-flash","sessionSeconds":300}
```

`status: "unconfigured"` nghĩa là chưa thấy `GEMINI_API_KEY`.

### Nối với emulator Android

App đọc `EXPO_PUBLIC_AI_URL`, mặc định `http://10.0.2.2:8000` — chính là
`localhost` của máy host nhìn từ trong emulator. Chạy uvicorn ở trên là đủ,
không cần cấu hình gì thêm.

Máy thật thì đặt `EXPO_PUBLIC_AI_URL=http://<IP-LAN-máy-bạn>:8000` trong `.env`
của dự án React Native, và chạy uvicorn với `--host 0.0.0.0`.

## Test

```bash
PYTHONPATH=src python -m pytest -q
```

Không test nào gọi Gemini thật: `llm.generate_json` bị thay bằng `monkeypatch`
ở đúng một chỗ. Bộ test chạy trong chưa tới một giây và không tốn quota.

---

## API

Tất cả đều phi trạng thái. `topicId` là một trong `restaurant`, `directions`,
`shopping`, `self_intro`, hoặc `custom` (kèm `customTopic`).

| Method | Đường dẫn                      | Việc                                   |
| ------ | ------------------------------ | -------------------------------------- |
| `GET`  | `/health`                      | trạng thái + model đang dùng           |
| `GET`  | `/api/v1/conversation/topics`  | danh mục chủ đề dựng sẵn               |
| `POST` | `/api/v1/conversation/start`   | câu chào mở màn + gợi ý + độ dài phiên |
| `POST` | `/api/v1/conversation/respond` | một lượt: lời đáp + gợi ý + góp ý lỗi  |
| `POST` | `/api/v1/conversation/summary` | bản tổng kết cuối phiên                |

Mã lỗi:

| Mã    | Nghĩa                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| `400` | đầu vào không hợp lệ (câu rỗng, chủ đề tự nhập bỏ trống, chưa có lượt nào để tổng kết) |
| `404` | không có chủ đề đó                                                                     |
| `502` | Gemini lỗi / quá tải / hết quota — `detail` đã là câu tiếng Việt hiển thị được         |
| `503` | server chưa cấu hình `GEMINI_API_KEY`                                                  |

---

## Triển khai

`render.yaml` đã cấu hình sẵn cho Render gói free. Điểm duy nhất phải làm tay:
thêm `GEMINI_API_KEY` vào phần **Environment** trên dashboard (khai báo
`sync: false` nên Render sẽ hỏi lúc tạo dịch vụ). **Không bao giờ commit khoá.**

Hoặc bằng Docker:

```bash
docker build -t nihongo-ai .
docker run -e GEMINI_API_KEY=... -p 8000:8000 nihongo-ai
```

### Giới hạn đã biết

- **Gói free của Render ngủ đông** sau ~15 phút không có lưu lượng.
- **Quota Gemini free** giới hạn theo request/phút; chạm ngưỡng thì dịch vụ
  trả `502` kèm lời nhắc chờ một phút.
- **Google khai tử model theo lịch riêng của họ.** `gemini-2.0-flash` đã chết
  đúng như vậy (404 kèm gợi ý model thay thế). Khi gặp lỗi đó, đổi biến
  `GEMINI_MODEL` sang model mới rồi khởi động lại - không phải sửa mã. Xem
  danh sách model còn sống bằng:
  `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"`
- **Model mới nhất chưa chắc dùng được.** Đo ngày 2026-08-25: `gemini-3.7-flash`
  và bí danh `gemini-flash-latest` đều trả 503 "high demand" 3/3 lần. Lý do
  mặc định ghim ở `gemini-3.5-flash` chứ không phải bản mới nhất - xem ghi chú
  đầy đủ trong `src/nihongo_ai/llm.py`.
- **Chi phí theo lượt.** Khác hẳn kiến trúc 1.x, mỗi lượt nói giờ là một lời
  gọi mạng có giá. Phiên 5 phút được giới hạn cứng một phần cũng vì lý do này.
- **Không kiểm chứng được nội dung.** Gemini có thể sửa sai hoặc giải thích
  ngữ pháp chưa chuẩn. Với người học N5 rủi ro thấp, nhưng đây là đánh đổi
  thật khi bỏ hệ thống dựa trên luật.
