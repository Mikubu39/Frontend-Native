# Đánh giá & so sánh mô hình

Tài liệu này trả lời câu hỏi: **đã train như thế nào, kết quả ra sao, và vì sao
chọn mô hình này chứ không phải mô hình khác.**

Mọi con số trong đây đều tái lập được:

```bash
cd ai-service
PYTHONPATH=src python -m nihongo_ai.tune             # tìm siêu tham số
PYTHONPATH=src python -m nihongo_ai.evaluate --heavy # so sánh 11 mô hình
PYTHONPATH=src python -m nihongo_ai.evaluate_system  # đo toàn hệ thống
```

Kết quả thô: `reports/metrics.json`, `reports/tuning.json`,
`reports/system-metrics.json`.

---

## 1. Giao thức đánh giá

| Hạng mục            | Cấu hình                                                    |
| ------------------- | ----------------------------------------------------------- |
| Chia dữ liệu        | `StratifiedKFold`, k = 5, `shuffle=True`, `random_state=42` |
| Dữ liệu             | 730 câu / 30 nhãn (xem `DATASET.md`)                        |
| Điều kiện công bằng | Mọi mô hình thấy **đúng cùng các fold**, cùng dữ liệu thô   |
| Độ đo chính         | macro-F1 (không phải accuracy — xem lý do bên dưới)         |

**Vì sao tối ưu macro-F1 chứ không phải accuracy:** `out_of_scope` chiếm 18%
dữ liệu. Một mô hình lười có thể đẩy accuracy lên chỉ bằng cách chiều lớp đông
trong khi các ý định hiếm hỏng hoàn toàn. macro-F1 tính đều mọi lớp, đúng với
điều ta cần: _mọi_ ý định đều phải hoạt động.

### Bốn nhóm độ đo

1. **Chất lượng toàn cục** — accuracy / macro-F1 trên toàn bộ 30 nhãn.
2. **Chất lượng khi vận hành** ("theo KB") — accuracy khi đã biết người dùng
   đang ở kịch bản nào, nên không gian nhãn bị thu hẹp. **Đây là con số phản
   ánh trải nghiệm thật.**
3. **Chất lượng từ chối** — precision/recall trên `out_of_scope`.
4. **Chi phí vận hành** — độ trễ suy luận, dung lượng mô hình. Quyết định trực
   tiếp việc có deploy miễn phí được hay không.

---

## 2. Bảng so sánh 11 mô hình

Sắp theo _độ chính xác theo kịch bản_ (cột quan trọng nhất):

| Mô hình                                                            | acc   | macro-F1  | **theo KB** | OOS-F1    | ms/câu   | Dung lượng  |
| ------------------------------------------------------------------ | ----- | --------- | ----------- | --------- | -------- | ----------- |
| `char_mlp` — TF-IDF + MLP 256 nơ-ron                               | 0.679 | 0.668     | **0.768**   | 0.721     | 0.50     | 75.5 MB     |
| **`char_logreg` — TF-IDF ký tự + Hồi quy Logistic** ⬅️ **ĐÃ CHỌN** | 0.670 | 0.661     | **0.765**   | 0.697     | **0.42** | **0.93 MB** |
| `char_linsvc_cal` — LinearSVC + hiệu chỉnh                         | 0.681 | 0.667     | 0.758       | 0.705     | 4.44     | 1.9 MB      |
| `char_nb` — TF-IDF + Naive Bayes                                   | 0.670 | 0.647     | 0.754       | **0.739** | 1.28     | 0.20 MB     |
| `char_logreg_nofold` — bỏ gộp katakana _(ablation)_                | 0.660 | 0.651     | 0.754       | 0.694     | 0.43     | 0.91 MB     |
| `char_linsvc` — LinearSVC thuần                                    | 0.662 | 0.653     | 0.752       | 0.679     | 0.42     | 0.81 MB     |
| `embed_logreg` — **Transformer đa ngữ MiniLM**                     | 0.667 | **0.680** | 0.751       | 0.578     | 13.87    | **424 MB**  |
| `char_sgd` — SGD modified-huber                                    | 0.641 | 0.635     | 0.660       | 0.713     | 1.29     | 0.25 MB     |
| `char_knn` — 1-NN cosine _(thay cho luật tay)_                     | 0.605 | 0.618     | 0.608       | 0.624     | 1.69     | 0.18 MB     |
| `word_logreg` — TF-IDF **TỪ** _(ablation)_                         | 0.270 | 0.175     | 0.271       | 0.346     | 0.40     | 0.04 MB     |
| `majority` — đoán bừa lớp đông nhất                                | 0.181 | 0.010     | 0.181       | 0.306     | 0.33     | 0.07 MB     |

---

## 3. Ba kết luận quan trọng nhất rút ra từ bảng trên

### 3.1. n-gram KÝ TỰ thắng n-gram TỪ áp đảo: 0.765 so với 0.271

Đây là chênh lệch lớn nhất trong toàn bộ bảng — gấp **2.8 lần**.

Nguyên nhân: **tiếng Nhật không có dấu cách giữa các từ.** Không có bộ phân
tích hình vị, bộ tách token mặc định coi cả câu `駅はどこですか` là **một
token duy nhất**, nên nó không khớp được với `駅はどこにありますか`. Mỗi câu
gần như trở thành một đặc trưng riêng và mô hình không tổng quát hoá được gì.

n-gram ký tự đi vòng qua toàn bộ vấn đề đó. Và với tiếng Nhật nó đặc biệt hiệu
quả vì **thông tin về ý định nằm ở đuôi câu**, dài đúng 2-5 ký tự:

```
...ですか      -> đang hỏi
...ください    -> đang yêu cầu
...はどこ      -> đang hỏi vị trí
...はいくら    -> đang hỏi giá
...から来ました -> đang nói quê quán
```

Đây chính xác là thứ n-gram ký tự 2-5 bắt được, và là lý do **không cần MeCab
/ Sudachi** (vốn kéo theo từ điển 50-100 MB và phải biên dịch native trên
Windows).

### 3.2. Mô hình Transformer THUA mô hình TF-IDF — trên mọi mặt quan trọng

Đây là kết quả bất ngờ nhất và là lý do chính khiến lựa chọn cuối cùng vững:

|                            | `char_logreg`          | `embed_logreg` (MiniLM) | Chênh lệch               |
| -------------------------- | ---------------------- | ----------------------- | ------------------------ |
| Độ chính xác theo kịch bản | **0.765**              | 0.751                   | TF-IDF **hơn**           |
| **F1 phát hiện lạc đề**    | **0.697**              | 0.578                   | TF-IDF hơn **+0.12**     |
| Độ trễ                     | **0.42 ms**            | 13.87 ms                | TF-IDF nhanh hơn **33×** |
| Dung lượng                 | **0.93 MB**            | 424 MB                  | TF-IDF nhỏ hơn **456×**  |
| Phụ thuộc                  | scikit-learn (~120 MB) | + torch (~2.5 GB)       |                          |
| Chạy lọt free tier 512 MB? | **Có**                 | Không                   |                          |

**Vì sao mô hình nhúng câu lại thua?** Nó được huấn luyện để đưa các câu _gần
nghĩa_ về gần nhau. Nhưng bài toán ở đây phần lớn được phân biệt bằng **mẫu
mặt chữ ở đuôi câu**, không phải bằng ngữ nghĩa sâu. Tệ hơn, việc "làm mượt"
ngữ nghĩa đó lại phá hỏng chính việc phát hiện lạc đề: lớp `out_of_scope` gồm
những câu **rất đa dạng về nghĩa**, gom chúng lại trong không gian ngữ nghĩa
là điều mô hình nhúng không làm được — thể hiện ở OOS-F1 chỉ 0.578, kém nhất
trong toàn bộ nhóm mô hình n-gram ký tự.

(Lưu ý trung thực: MiniLM có macro-F1 toàn cục cao nhất là 0.680. Nhưng macro-F1
toàn cục bị "phạt" bởi các cặp nhập nhằng cố ý — thứ biến mất khi vận hành
thật. Trên cả hai chỉ số _thực sự quan trọng_ là độ chính xác theo kịch bản và
F1 phát hiện lạc đề, nó đều thua.)

### 3.3. Siêu tham số KHÔNG phải nút thắt — dữ liệu mới là

Grid search **280 tổ hợp × 5 fold = 1400 lần huấn luyện**:

```
macro-F1 tốt nhất: 0.6692   (ngram=(2,5), C=30, sublinear=True, min_df=1, gộp kana=True)
so với mặc định  : 0.6640
cải thiện        : +0.005  (+0.5 điểm phần trăm)
```

Trong khi đó, **một lần sửa nhãn dữ liệu** (chuyển `大丈夫です` / `けっこうです`
từ `affirm` sang `deny`) giảm tỉ lệ lỗi gây hại của hệ thống từ 13.3% → 12.2%,
tức **hơn gấp đôi** tác dụng của toàn bộ 1400 lần huấn luyện kia.

→ Kết luận cho hướng phát triển tiếp: muốn tốt hơn thì **thêm và làm sạch dữ
liệu**, đừng chỉnh siêu tham số nữa.

### 3.4. Ablation: gộp katakana → hiragana đáng giá +0.011

`char_logreg` (0.765) so với `char_logreg_nofold` (0.754). Nhỏ nhưng miễn phí —
chỉ là một phép trừ mã Unicode. Nó giúp `メニュー` và `めにゅー` khớp nhau, điều
thường gặp ở người mới học chưa quen dùng katakana.

---

## 4. Vì sao chọn `char_logreg` mà không phải `char_mlp` (điểm cao hơn)?

`char_mlp` hơn đúng **+0.003** độ chính xác theo kịch bản (0.768 so với 0.765) —
nằm trong sai số ngẫu nhiên của 5-fold. Cái giá phải trả:

- **75.5 MB so với 0.93 MB** — lớn hơn **81 lần** cho +0.3 điểm phần trăm.
- Xác suất của mạng nơ-ron **hiệu chỉnh kém**: chúng thường quá tự tin, mà toàn
  bộ thiết kế chống-lạc-đề ở đây dựa vào việc ngưỡng xác suất phải **có ý nghĩa
  thật**.
- Huấn luyện chậm hơn nhiều, khó tái lập hơn.

Đổi 81 lần dung lượng lấy 0.3 điểm phần trăm là một đánh đổi tồi.

### Vì sao không phải `char_linsvc` (thường được coi là chuẩn mực cho text)?

Vì **LinearSVC không cho xác suất** — nó chỉ cho khoảng cách tới siêu phẳng,
không so ngưỡng được. Mà ngưỡng tin cậy chính là _nền móng_ của toàn bộ cơ chế
xử lý câu lạc đề.

Bọc thêm `CalibratedClassifierCV` thì có xác suất, nhưng:

- chi phí huấn luyện **gấp 3 lần** (huấn luyện lại ở mỗi fold hiệu chỉnh),
- suy luận **chậm hơn 10 lần** (4.44 ms so với 0.42 ms),
- mà độ chính xác theo kịch bản vẫn **thấp hơn** (0.758 so với 0.765).

Hồi quy logistic cho xác suất hiệu chỉnh **miễn phí**, đúng thứ ta cần.

### Vì sao không phải `char_nb` (OOS-F1 cao nhất: 0.739)?

Naive Bayes bắt lạc đề tốt nhất nhưng độ chính xác theo kịch bản thấp hơn
(0.754 so với 0.765) và macro-F1 kém nhất trong nhóm tuyến tính (0.647). Ngoài
ra xác suất của nó nổi tiếng là **quá cực đoan** (dồn về 0 hoặc 1), khiến ngưỡng
tin cậy khó chỉnh. Vẫn là phương án dự phòng tốt nếu cần mô hình cực nhỏ.

### Vì sao KHÔNG dùng LLM (GPT / Gemini / Llama)?

Đây là phương án được cân nhắc đầu tiên và bị loại vì các lý do sau:

| Tiêu chí                     | LLM API (GPT/Gemini) | LLM tự host (Llama 3B) | **Phương án đã chọn**             |
| ---------------------------- | -------------------- | ---------------------- | --------------------------------- |
| Chi phí                      | Trả theo lượt gọi    | Cần GPU / RAM lớn      | **0 đồng**                        |
| "Tự train được"              | Không — chỉ prompt   | Fine-tune cần GPU      | **Có, train 2 giây trên CPU**     |
| Dung lượng                   | —                    | 2-6 GB                 | **0.93 MB**                       |
| Chạy free tier 512 MB        | —                    | Không                  | **Có**                            |
| Kiểm soát hành vi            | Khó ràng buộc        | Khó ràng buộc          | **Tất định, kiểm thử được**       |
| Giải thích được cho hội đồng | Hộp đen              | Hộp đen                | **Xem được trọng số từng n-gram** |

Với yêu cầu của đồ án ("tự train được, không tốn phí, nhưng vẫn deploy được"),
LLM vi phạm cả ba. Đổi lại, phương án này **không** hội thoại tự do được ngoài
kịch bản — đó là hạn chế đã biết và chấp nhận, được bù bằng thiết kế FSM +
gợi ý dẫn đường.

---

## 5. Chọn ngưỡng tin cậy

Quét ngưỡng **có điều kiện kịch bản** (đúng như lúc chạy thật), xác suất được
chuẩn hoá lại trên tập nhãn hợp lệ:

| Ngưỡng                  | Trả lời đúng câu hợp lệ | Hỏi lại oan | Chặn được lạc đề |
| ----------------------- | ----------------------- | ----------- | ---------------- |
| 0.20                    | 72.2%                   | 10.0%       | 74.1%            |
| 0.25                    | 71.9%                   | 11.7%       | 77.8%            |
| **0.30** ⬅️ **ĐÃ CHỌN** | **70.8%**               | **14.9%**   | **82.2%**        |
| 0.35                    | 69.0%                   | 18.9%       | 84.7%            |
| 0.40                    | 67.6%                   | 21.8%       | 86.9%            |
| 0.50                    | 62.7%                   | 28.9%       | 89.6%            |
| 0.70                    | 51.2%                   | 44.9%       | 95.1%            |
| 0.80                    | 43.7%                   | 54.3%       | 96.4%            |

**Vì sao chọn 0.30:** đây là điểm mà đường cong bắt đầu gãy. Đi từ 0.25 lên
0.30 đổi 1.1 điểm phần trăm "trả lời đúng" lấy 4.4 điểm phần trăm "chặn được
lạc đề" — lãi. Đi tiếp từ 0.30 lên 0.35 thì chỉ được thêm 2.5 điểm chặn lạc đề
mà mất 4.0 điểm hỏi lại oan — lỗ.

Về mặt sư phạm, một lần bị hỏi lại **không phải thảm hoạ**: bot đáp lại bằng
một gợi ý câu mẫu cụ thể, nên người học vẫn học được gì đó. Ngược lại, một câu
trả lời sai đầy tự tin thì vừa gây bối rối vừa dạy sai. Vì thế cán cân nghiêng
về phía thận trọng.

Ngoài ngưỡng còn có **biên top-1/top-2 = 0.12**: khi hai ý định dẫn đầu quá sát
nhau, bot hỏi lại cho rõ thay vì đoán liều — biến điểm yếu của mô hình thành
một lượt hội thoại tự nhiên.

---

## 6. Kết quả TOÀN HỆ THỐNG (tầng chặn + mô hình + ngưỡng + FSM)

Đây là con số cuối cùng, đo trên chuỗi xử lý đầy đủ, có điều kiện kịch bản.
1603 lượt thử.

### Câu hợp lệ (n = 1075)

| Kết cục                                | Số lượt | Tỉ lệ     |
| -------------------------------------- | ------- | --------- |
| ✅ Trả lời đúng                        | 741     | **68.9%** |
| ✅ Hỏi lại cho rõ, và đoán đầu đã đúng | 17      | 1.6%      |
| ⚠️ Hỏi lại (tin cậy thấp)              | 52      | 4.8%      |
| ⚠️ Hỏi lại cho rõ, đoán đầu sai        | 26      | 2.4%      |
| ⚠️ Bị coi nhầm là lạc đề               | 114     | 10.6%     |
| ❌ **Trả lời sai một cách tự tin**     | 125     | **11.6%** |
| ❌ Bị tầng chặn chặn oan               | **0**   | **0.0%**  |

### Câu lạc đề (n = 528)

| Kết cục                                 | Số lượt | Tỉ lệ     |
| --------------------------------------- | ------- | --------- |
| ✅ Bị chặn đúng                         | 444     | **84.1%** |
| ⚠️ Bị hỏi lại cho rõ                    | 2       | 0.4%      |
| ❌ **Lọt qua thành câu trả lời tự tin** | 82      | 15.5%     |

### Chỉ số tổng kết

> ### Tỉ lệ lỗi gây hại: **12.9%** (207 / 1603)

"Lỗi gây hại" = bot **tự tin hành động theo một ý định sai**. Đây là kiểu lỗi
duy nhất thực sự làm hại người học. Bị hỏi lại thì hơi phiền nhưng vẫn dạy được;
trả lời sai đầy tự tin thì gây bối rối và dạy sai luôn.

**Tầng chặn tất định đạt precision tuyệt đối:** 0/599 câu hợp lệ bị chặn oan,
trong khi vẫn bắt được 38.6% câu lạc đề (chủ yếu nhóm B/D: đập bàn phím, emoji,
sai hệ chữ viết) với chi phí gần bằng 0 và **kết quả không đổi qua mọi lần chạy**.

---

## 7. Phân tích lỗi — lỗi còn lại nằm ở đâu

Các cặp nhầm lẫn hàng đầu của `char_logreg`:

| Số lần | Nhầm từ                                       | Thành                     | Bản chất                                         |
| ------ | --------------------------------------------- | ------------------------- | ------------------------------------------------ |
| 19     | `shopping_ask_price` ↔ `restaurant_ask_price` |                           | **Nhập nhằng cố ý** — biến mất khi biết kịch bản |
| 14     | `restaurant_ask_bill` ↔ `shopping_pay`        |                           | **Nhập nhằng cố ý** — như trên                   |
| 9      | `out_of_scope`                                | `meta_about_bot`          | Cùng dùng `教えてください`                       |
| 7      | `shopping_ask_item`                           | `shopping_ask_size_color` | Cùng dùng `〜はありますか`                       |
| ~8     | `not_understand`                              | `apologize`               | Đều bắt đầu bằng `すみません`                    |
| ~7     | `affirm` ↔ `deny`                             |                           | Câu quá ngắn: `いいですよ`, `ううん`             |

Ba nhóm nguyên nhân:

1. **Nhập nhằng cố ý giữa kịch bản (33 lỗi)** — không phải lỗi thật. Biến mất
   hoàn toàn khi thu hẹp nhãn theo kịch bản, và đó chính là chênh lệch giữa
   0.670 (toàn cục) và 0.765 (theo kịch bản).
2. **Câu quá ngắn** — `ううん`, `いいですよ` chỉ vài ký tự nên tín hiệu quá
   mỏng. Cách khắc phục duy nhất là thêm dữ liệu, không phải đổi mô hình.
3. **Chung tiền tố / hậu tố** — `すみません` mở đầu cả `apologize` lẫn
   `not_understand`; `教えてください` xuất hiện ở cả hỏi đường lẫn xin trợ giúp.
   Thứ phân biệt chúng là **tân ngữ ở giữa câu** — cần nhiều ví dụ hơn để mô
   hình học được điều đó.

---

## 8. Bốn tầng phòng thủ — vì sao 12.9% lỗi mô hình vẫn dùng được

Mô hình sai 12.9% nhưng người dùng **không** gặp 12.9% trải nghiệm tệ, vì có
bốn tầng chồng lên nhau:

| Tầng                         | Cơ chế                           | Bắt được gì                          | Độ chắc chắn                     |
| ---------------------------- | -------------------------------- | ------------------------------------ | -------------------------------- |
| **1. Chặn tất định**         | Luật chuỗi                       | Rác, emoji, sai hệ chữ, câu quá ngắn | 100%, không đổi qua mọi lần chạy |
| **2. Ngưỡng tin cậy**        | p < 0.30 → hỏi lại               | Câu mô hình không chắc               | Theo xác suất                    |
| **3. Thu hẹp theo kịch bản** | Chuẩn hoá lại trên nhãn hợp lệ   | Toàn bộ nhầm lẫn xuyên kịch bản      | 100%                             |
| **4. FSM hội thoại**         | Ý định không nằm trong `expects` | Ý định đúng nhưng sai thời điểm      | 100%                             |

Tầng 4 đặc biệt quan trọng: kể cả khi mô hình tự tin **và sai**, nếu ý định
đoán ra không hợp lệ ở bước hiện tại thì bot **không hành động theo nó** — nó
đáp _"câu tiếng Nhật của bạn đúng rồi, nhưng ở bước này thì chưa hợp"_. Người
học nhận được phản hồi hữu ích thay vì một câu trả lời vô nghĩa.

Và nguyên tắc bao trùm: **không có ngõ cụt**. Mọi nhánh hỏng đều kết thúc bằng
một gợi ý cụ thể có thể gõ theo được — đã được test tự động bảo vệ
(`test_every_turn_offers_a_way_forward`).

---

## 9. Giới hạn đã biết

Nêu thẳng để không bị hiểu quá lên:

- **Bộ góp ý ngữ pháp rất hẹp.** Nó chỉ so khớp chuỗi cho 6 lỗi chính tả kinh
  điển + một luật nhắc mức lịch sự. Nó **không** phải bộ kiểm tra ngữ pháp và
  bỏ sót phần lớn lỗi. Đây là chủ đích: báo nhầm sẽ _dạy người học điều sai_,
  nên bộ luật được viết để tỉ lệ báo nhầm gần bằng 0, chấp nhận bỏ sót nhiều.
- **15.5% câu lạc đề vẫn lọt** thành câu trả lời tự tin. Chủ yếu là nhóm A —
  tiếng Nhật đúng ngữ pháp nhưng lạc chủ đề.
- **10.6% câu hợp lệ bị coi nhầm là lạc đề.** Phiền nhưng không nguy hiểm:
  người học vẫn nhận được gợi ý câu mẫu.
- **Chưa có dữ liệu người dùng thật.** Đây là hướng cải thiện có hiệu quả cao
  nhất: ghi lại câu bị đoán sai khi chạy thật rồi gán nhãn lại.
- **Đánh giá bằng cross-validation trên chính dataset tự soạn**, chưa có tập
  kiểm tra độc lập do người khác viết. Nên các con số này nhiều khả năng **lạc
  quan hơn** thực tế.

---

## 10. Cấu hình mô hình cuối cùng

```python
Pipeline([
    ("vec", TfidfVectorizer(
        analyzer      = "char_wb",       # n-gram ký tự, không cần tách từ
        ngram_range   = (2, 5),          # từ grid search
        preprocessor  = JapaneseNormalizer(fold_katakana=True),
                                         # NFKC -> lower -> gộp khoảng trắng
                                         # -> katakana sang hiragana
        sublinear_tf  = True,
        min_df        = 1,
    )),
    ("clf", LogisticRegression(
        C             = 30.0,            # từ grid search
        class_weight  = "balanced",      # out_of_scope đông gấp ~7 lần lớp nhỏ nhất
        max_iter      = 4000,
        random_state  = 42,
    )),
])
```

| Thông số             | Giá trị                      |
| -------------------- | ---------------------------- |
| Ngưỡng tin cậy       | 0.30                         |
| Biên top-1/top-2     | 0.12                         |
| Thời gian huấn luyện | ~2 giây (CPU, không cần GPU) |
| Dung lượng mô hình   | 930 KB                       |
| Độ trễ suy luận      | 0.42 ms/câu                  |
| Vân tay dataset      | `9f1f33529ad2b906`           |
