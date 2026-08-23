# Dữ liệu huấn luyện

Tài liệu này mô tả **toàn bộ dữ liệu đã dùng để train**: nguồn gốc, cách soạn,
quy mô, và những đánh đổi có chủ ý bên trong nó.

---

## 1. Nguồn gốc dữ liệu

**Dataset do tự soạn hoàn toàn (100% tự viết tay), không lấy từ corpus có sẵn.**

Lý do không dùng corpus công khai:

| Corpus | Vì sao không dùng |
|---|---|
| Tatoeba (câu song ngữ) | Câu rời rạc, không gắn với ý định hội thoại nào; không có nhãn intent |
| JParaCrawl / KFTT | Dữ liệu dịch máy, văn phong tin tức/web - không phải hội thoại đời thường |
| Bộ intent tiếng Anh (ATIS, CLINC150, SNIPS) | Sai ngôn ngữ; dịch máy sang tiếng Nhật sẽ tạo văn phong không tự nhiên và làm hỏng chính thứ ta muốn dạy |
| Log hội thoại người thật | Không có, và thu thập sẽ vướng vấn đề riêng tư |

Với một bài toán intent đóng (closed-domain) chỉ 30 nhãn, tự soạn dữ liệu là
cách nhanh nhất **và** cho chất lượng nhãn cao nhất: mỗi câu đều được viết cho
đúng một ý định cụ thể trong đúng một tình huống cụ thể.

Trình độ ngôn ngữ nhắm tới: **N5** (sơ cấp) — khớp với trình độ mặc định của
người dùng trong app.

---

## 2. Quy mô

| Chỉ số | Giá trị |
|---|---|
| Tổng số câu | **730** |
| Số ý định (nhãn) | **30** |
| Số kịch bản | **4** |
| Số câu trung bình / ý định | ~24 |
| Lớp nhỏ nhất | `intro_nice_to_meet` (17 câu) |
| Lớp lớn nhất | `out_of_scope` (132 câu) |
| Vân tay dataset (SHA-256, 16 ký tự đầu) | `9f1f33529ad2b906` |

Vân tay được nhúng vào thẻ mô hình (`artifacts/model-card.json`) nên luôn truy
ngược được mô hình đang chạy về đúng phiên bản dữ liệu đã sinh ra nó.

### Phân bố theo kịch bản

| Kịch bản | Ý định riêng | File |
|---|---|---|
| Nhà hàng (レストランで) | 6 | `data/intents/restaurant.yaml` |
| Hỏi đường (道を聞く) | 4 | `data/intents/directions.yaml` |
| Mua sắm (買い物) | 5 | `data/intents/shopping.yaml` |
| Tự giới thiệu (自己紹介) | 6 | `data/intents/self_intro.yaml` |
| *(dùng chung mọi kịch bản)* | 7 | `data/intents/global.yaml` |
| *(nhãn từ chối + meta)* | 2 | `data/intents/out_of_scope.yaml` |

---

## 3. Cách soạn dữ liệu — 4 trục biến thể

Mỗi ý định được viết ~20 câu, cố ý trải đều trên bốn trục sau. Đây là phần
quyết định mô hình có tổng quát hoá được hay chỉ học thuộc lòng:

**Trục 1 — Mức lịch sự.** Thể thường / thể ます / kính ngữ.
`メニュー、お願いします` vs `メニューを見せてください` vs `お会計お願いします`

**Trục 2 — Hệ chữ viết.** Cùng một câu ở dạng có kanji và dạng toàn kana, vì
người mới học thường chưa viết được kanji:
`駅はどこですか` ↔ `えきはどこですか`
`値段はいくらですか` ↔ `ねだんはいくらですか`

**Trục 3 — Độ dài / mức đầy đủ.** Câu cụt lẫn câu đầy đủ:
`二人です` / `二人でお願いします` / `二人ですが、席はありますか`

**Trục 4 — Lỗi thật của người học.** Đây là trục ít gặp trong dataset học thuật
nhưng quan trọng nhất với sản phẩm thật, vì đầu vào thực tế luôn có lỗi:

| Loại lỗi | Ví dụ đưa vào dataset |
|---|---|
| Nhầm は/わ | `こんにちわ`, `こんばんわ` |
| Thiếu dấu đục (dakuten) | `ありがとうごさいます`, `おはようごさいます` |
| Thiếu ký tự | `ありがとうござます` |
| Sót romaji do IME | `よろしくおねがいしまs` |

---

## 4. Nhãn từ chối `out_of_scope` — 132 câu

Đây là **nhãn quan trọng nhất của cả dataset**, và cũng là nhãn lớn nhất.

**Vì sao bắt buộc phải có nó:** một bộ phân loại softmax luôn có tổng xác suất
bằng 1 trên các nhãn. Không có lớp từ chối, mô hình *buộc phải* gán mọi câu vào
một ý định hợp lệ — nên `asdfghjkl` vẫn ra "gọi món" với độ tin cậy cao. Lớp từ
chối cho mô hình một chỗ để nói "không cái nào cả".

Bốn nhóm nhiễu được soạn riêng:

| Nhóm | Nội dung | Số lượng | Độ khó |
|---|---|---|---|
| **A** | Tiếng Nhật ĐÚNG nhưng lạc đề (thời tiết, anime, chuyện riêng tư) | ~49 | **Khó nhất** |
| **B** | Ký tự ngẫu nhiên, đập bàn phím | ~25 | Dễ |
| **C** | Trêu/thử chatbot, yêu cầu ngoài phạm vi | ~27 | Trung bình |
| **D** | Câu cụt, số, ký hiệu, emoji, ngôn ngữ khác | ~30 | Dễ |

Nhóm A khó nhất vì nó **hợp lệ về ngữ pháp** và dùng chung rất nhiều n-gram
với các lớp hợp lệ (`です`, `ますか`, `は`). Đây là nguồn lỗi chính của mô hình
(xem `EVALUATION.md` mục Phân tích lỗi). Các nhóm B/D thì gần như bị tầng chặn
tất định bắt sạch trước khi mô hình phải nghĩ.

---

## 5. Nhập nhằng CÓ CHỦ Ý giữa các kịch bản

Dataset **cố ý giữ lại** những câu giống hệt nhau ở hai kịch bản khác nhau:

| Câu | Xuất hiện ở |
|---|---|
| `いくらですか` | `restaurant_ask_price` **và** `shopping_ask_price` |
| `お会計お願いします` | `restaurant_ask_bill` **và** `shopping_pay` |
| `これをください` | `restaurant_order` **và** `shopping_pay` |
| `カードで払えますか` | `restaurant_ask_bill` **và** `shopping_pay` |

Tổng cộng 17 câu như vậy.

Xét trên toàn cục thì đây là **nhãn mâu thuẫn** và tạo ra một sàn lỗi không thể
vượt qua. Nhưng lúc chạy thật ta **luôn biết người dùng đang ở kịch bản nào**,
nên không gian nhãn bị thu hẹp lại và mâu thuẫn biến mất hoàn toàn.

Đó chính là lý do mọi phép đo trong `EVALUATION.md` đều báo **hai** con số:
độ chính xác toàn cục (có sàn lỗi) và độ chính xác theo kịch bản (con số thật
sự phản ánh trải nghiệm người dùng). Chênh lệch giữa hai con số đó chính là
phần "lỗi giả" do nhập nhằng cố ý gây ra.

---

## 6. Kiểm tra chất lượng tự động

`dataset.py` chạy các kiểm tra sau mỗi lần nạp dữ liệu, và **ném lỗi** chứ
không cảnh báo suông khi gặp vi phạm nghiêm trọng:

| Kiểm tra | Mức độ | Lý do |
|---|---|---|
| Cùng một câu ở 2 ý định **cùng kịch bản** | ❌ Lỗi chí mạng | Không thể học được, phải sửa |
| Cùng một câu ở 2 ý định **khác kịch bản** | ⚠️ Cảnh báo | Chấp nhận được, xử lý bằng thu hẹp nhãn |
| Câu lặp trong cùng một ý định | ⚠️ Cảnh báo | Lãng phí, làm lệch trọng số lớp |
| Ý định có < 5 câu duy nhất | ⚠️ Cảnh báo | Quá ít để đánh giá đáng tin |
| Thiếu nhãn `out_of_scope` | ❌ Lỗi chí mạng | Mô hình sẽ không thể từ chối |

**Kiểm tra này đã bắt được lỗi thật trong quá trình làm.** Ba trường hợp:

1. `どうも` bị gán cả `greeting` lẫn `thanks` → đứng một mình nó nhập nhằng
   thật trong tiếng Nhật; đã bỏ khỏi `greeting`.
2. `失礼します` bị gán cả `apologize` lẫn `farewell` → đã bỏ khỏi `apologize`.
3. `大丈夫です` / `けっこうです` ban đầu nằm ở `affirm`, trong khi ở ngữ cảnh
   phục vụ chúng mang nghĩa **từ chối nhẹ** → đã chuyển hẳn sang `deny`.

Riêng lần sửa thứ 3 làm giảm tỉ lệ lỗi gây hại của hệ thống từ **13.3% xuống
12.2%** — bằng chứng cụ thể rằng chất lượng nhãn quan trọng hơn việc chỉnh
siêu tham số (grid search 280 tổ hợp chỉ cho thêm +0.5 điểm phần trăm).

---

## 7. Dữ liệu kịch bản hội thoại (tách riêng khỏi dữ liệu train)

`data/scenarios/*.yaml` chứa **máy trạng thái hữu hạn (FSM)** của từng tình
huống: bot nói gì ở mỗi bước, chấp nhận ý định nào, đi tới bước nào.

Đây **không phải** dữ liệu huấn luyện — mô hình không bao giờ nhìn thấy nó.
Tách bạch như vậy có nghĩa là: sửa lời thoại của bot hay thêm một nhánh hội
thoại mới **không cần train lại mô hình**. Chỉ khi thêm *ý định mới* mới phải
train lại.

Mỗi kịch bản đều được kiểm tra tính toàn vẹn lúc nạp: mọi `next` phải trỏ tới
một trạng thái có thật, và phải tồn tại ít nhất một đường đi tới trạng thái
kết thúc.

---

## 8. Hạn chế đã biết của dataset

Nêu thẳng để không ai hiểu nhầm phạm vi:

- **Chỉ 4 tình huống, trình độ N5.** Không xử lý được hội thoại tự do ngoài các
  kịch bản này.
- **Không hỗ trợ romaji.** Người dùng gõ `sumimasen` sẽ bị tầng chặn từ chối
  kèm lời nhắc gõ tiếng Nhật, chứ không được hiểu.
- **Do một người soạn.** Nên nó phản ánh cách diễn đạt của một người; dữ liệu
  từ nhiều người viết sẽ đa dạng hơn.
- **Không có dữ liệu người dùng thật.** Đây là điểm cần bổ sung nhất: ghi lại
  các câu bị đoán sai khi chạy thật rồi gán nhãn lại sẽ cải thiện nhanh hơn bất
  kỳ thay đổi mô hình nào.
- **Các lớp câu rất ngắn (`affirm` / `deny`) vốn khó.** `いいですよ`, `ううん`
  chỉ vài ký tự nên tín hiệu rất mỏng; đây là nguồn lỗi còn lại lớn nhất sau
  khi đã loại các cặp nhập nhằng cố ý.
