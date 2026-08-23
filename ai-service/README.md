# Nihongo Conversation AI

Dịch vụ AI luyện hội thoại tiếng Nhật cho app **Frontend-Native**: người học
chọn một tình huống (nhà hàng, hỏi đường, mua sắm, làm quen), AI đóng vai người
Nhật và trò chuyện qua lại bằng tiếng Nhật.

**Không có LLM lúc phục vụ.** Lõi là một bộ phân loại ý định tự huấn luyện
(TF-IDF n-gram ký tự + hồi quy logistic, 1.8 MB) ghép với một máy trạng thái hội
thoại. Train mất 2 giây trên CPU, chạy lọt gói hosting miễn phí, và giải thích
được từng quyết định.

LLM có tham gia, nhưng ở **khâu sinh dữ liệu huấn luyện** chạy offline — xem
mục [Tăng cường dữ liệu bằng LLM](#tăng-cường-dữ-liệu-bằng-llm). Mô hình xuất
xưởng không gọi mạng, không tốn tiền theo lượt, và vẫn truy được từng trọng số.

📄 **[DATASET.md](reports/DATASET.md)** — dữ liệu train: nguồn, cách soạn, quy mô
📄 **[EVALUATION.md](reports/EVALUATION.md)** — so sánh 11 mô hình, số liệu, lý giải lựa chọn

---

## Kiến trúc

```
Câu người học gõ
      │
      ▼
┌──────────────────────┐  Tầng 1: luật tất định (rác, emoji, sai hệ chữ, quá ngắn)
│ guards.py            │  → bắt 38.6% câu lạc đề, 0% chặn oan
└──────────┬───────────┘
           ▼
┌──────────────────────┐  Chuẩn hoá: NFKC → lower → gộp khoảng trắng
│ features.py          │           → katakana sang hiragana
└──────────┬───────────┘
           ▼
┌──────────────────────┐  TF-IDF n-gram ký tự (2-5) + Hồi quy Logistic
│ classifier.py        │  Tầng 2: ngưỡng tin cậy 0.30
│                      │  Tầng 3: thu hẹp nhãn theo kịch bản + chuẩn hoá lại
└──────────┬───────────┘
           ▼
┌──────────────────────┐  Tầng 4: FSM kịch bản - ba tầng tra cứu
│ dialogue.py          │  1. state.expects   (cạnh soạn tay, luôn thắng)
│                      │  2. scenario.anytime (ý định không có thứ tự)
│                      │  3. ALWAYS_ALLOWED   (câu xã giao)
│                      │  → còn lại mới là "sai bước" = phản hồi riêng
└──────────┬───────────┘  → không bao giờ có ngõ cụt
           ▼
┌──────────────────────┐  Góp ý chính tả / mức lịch sự (luật, phạm vi hẹp)
│ grammar.py           │  Chạy độc lập với việc hiểu ý định
└──────────┬───────────┘
           ▼
       api.py (FastAPI, phi trạng thái)
```

### Vì sao tách thành dịch vụ riêng

- Phần NLP tiếng Nhật sống trong hệ sinh thái Python (scikit-learn).
- Cần huấn luyện lại / triển khai **độc lập** với backend Java.
- Backend chính (`BE_NihongoApp`) **không bị đụng tới** — theo đúng quy ước dự án.

---

## Cấu trúc thư mục

```
ai-service/
├── data/
│   ├── intents/            # DỮ LIỆU HUẤN LUYỆN - 750 câu, 30 ý định
│   │   ├── global.yaml         # ý định dùng chung mọi kịch bản
│   │   ├── restaurant.yaml     # nhà hàng
│   │   ├── directions.yaml     # hỏi đường
│   │   ├── shopping.yaml       # mua sắm
│   │   ├── self_intro.yaml     # tự giới thiệu
│   │   ├── out_of_scope.yaml   # nhãn từ chối + meta (QUAN TRỌNG NHẤT)
│   │   └── generated/          # CÂU DO LLM SINH - tách hẳn khỏi hạt giống
│   └── scenarios/          # KỊCH BẢN FSM - không phải dữ liệu train
│
├── src/nihongo_ai/
│   ├── dataset.py          # nạp + kiểm tra toàn vẹn dữ liệu
│   ├── augment.py          # sinh thêm câu train bằng LLM (OFFLINE)
│   ├── features.py         # chuẩn hoá tiếng Nhật + bộ trích đặc trưng
│   ├── guards.py           # tầng chặn tất định
│   ├── models.py           # 11 mô hình ứng viên để so sánh
│   ├── tune.py             # grid search siêu tham số
│   ├── evaluate.py         # so sánh mô hình  → reports/metrics.json
│   ├── evaluate_system.py  # đo phân loại+luật → reports/system-metrics.json
│   ├── evaluate_dialogue.py# đo TẦNG FSM      → reports/dialogue-metrics.json
│   ├── evaluate_augmentation.py # đo đóng góp của dữ liệu sinh
│   ├── train.py            # huấn luyện mô hình production + thẻ mô hình
│   ├── classifier.py       # suy luận + luật quyết định
│   ├── dialogue.py         # máy hội thoại FSM
│   ├── grammar.py          # góp ý ngữ pháp bằng luật
│   └── api.py              # FastAPI
│
├── tests/                  # 62 test (pytest)
└── reports/                # tài liệu + số liệu thô
```

---

## Chạy cục bộ

```bash
cd ai-service

# 1. Môi trường
python -m venv .venv
.venv/Scripts/activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt

# 2. Huấn luyện (~2 giây)
PYTHONPATH=src python -m nihongo_ai.train

# 3. Chạy service
PYTHONPATH=src uvicorn nihongo_ai.api:app --reload --port 8000
```

Mở http://localhost:8000/docs để xem tài liệu API tự sinh.

### Kiểm thử

```bash
pytest -q                                             # 62 test
PYTHONPATH=src python -m nihongo_ai.evaluate          # so sánh 11 mô hình
PYTHONPATH=src python -m nihongo_ai.evaluate_system   # phân loại + luật quyết định
PYTHONPATH=src python -m nihongo_ai.evaluate_dialogue # tầng hội thoại (FSM)
PYTHONPATH=src python -m nihongo_ai.evaluate_augmentation  # đóng góp của dữ liệu sinh
```

Muốn chạy cả đối chứng Transformer (nặng, chỉ để nghiên cứu):

```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install sentence-transformers
PYTHONPATH=src python -m nihongo_ai.evaluate --heavy
```

---

## API

| Method | Đường dẫn | Công dụng |
|---|---|---|
| `GET` | `/health` | Trạng thái + thẻ mô hình đang chạy |
| `GET` | `/api/v1/conversation/scenarios` | Danh sách tình huống |
| `POST` | `/api/v1/conversation/start` | Mở đầu một kịch bản |
| `POST` | `/api/v1/conversation/respond` | Gửi một lượt nói |

**Dịch vụ phi trạng thái.** Client giữ `state` và `consecutiveFailures` rồi gửi
kèm mỗi lượt. Lý do: hosting miễn phí ngủ đông và khởi động lại container, nên
phiên lưu trong RAM server sẽ bốc hơi giữa cuộc hội thoại. Đổi lại: không cần
Redis/DB, scale ngang thoải mái, hạ tầng bằng không.

Ví dụ:

```bash
curl -X POST http://localhost:8000/api/v1/conversation/respond \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"restaurant","state":"welcome","text":"二人です","consecutiveFailures":0}'
```

---

## Triển khai

`render.yaml` đã cấu hình sẵn cho Render gói **free** (512 MB RAM, region
Singapore). Mô hình được **huấn luyện lúc build**, không commit file `.joblib` —
để trọng số luôn khớp với dataset trong cùng một commit.

Cũng có `Dockerfile` nếu muốn deploy nơi khác.

Sau khi deploy, trỏ app React Native tới dịch vụ bằng biến môi trường:

```
EXPO_PUBLIC_AI_URL=https://<tên-service>.onrender.com
```

Mặc định khi chưa đặt: `http://10.0.2.2:8000` (localhost của máy host, nhìn từ
emulator Android).

**Hạn chế của gói free:** dịch vụ ngủ sau ~15 phút không có lưu lượng, lần gọi
kế tiếp mất ~30 giây để đánh thức. Client đã đặt timeout 30 giây và hiện thông
báo chờ tử tế.

---

## Ba tầng tra cứu của máy hội thoại

Bộ phân loại hiểu đúng KHÔNG có nghĩa hội thoại chạy tốt. Bản đầu tiên chỉ tra
đúng `state.expects`, nên mọi ý định không nằm trong bước hiện tại đều bị trả
"đúng tiếng Nhật nhưng chưa hợp lúc này" - kể cả lời cảm ơn. Đo lại bằng
`evaluate_dialogue.py`: **66.5%** số lượt rơi vào `wrong_time`, riêng câu xã
giao là **69.2%**.

Nay `_decide` tra theo ba tầng, dừng ở tầng nào khớp trước:

| # | Nguồn | Hành vi | Dùng cho |
|---|---|---|---|
| 1 | `state.expects` | tiến trạng thái theo kịch bản | cạnh soạn tay, mang ý đồ dạy học |
| 2 | `scenario.anytime` | đáp rồi ở nguyên bước | ý định vốn không có thứ tự |
| 3 | `ALWAYS_ALLOWED` | đáp rồi ở nguyên bước | câu xã giao |
| – | không khớp | `wrong_time` | **thật sự** sai trình tự |

Tầng 1 luôn được xét trước, nên kịch bản viết tay không bao giờ bị hai lưới đỡ
che mất. Tầng 2 và 3 đều KHÔNG tính vào chuỗi hỏng.

`wrong_time` được giữ lại chứ không bỏ - nó vẫn là phản hồi đúng cho "đòi hoá
đơn khi chưa ngồi vào bàn". Khác biệt là giờ nó chỉ phạt TRÌNH TỰ, không còn
phạt CÁCH DIỄN ĐẠT. Và nó nêu thẳng câu đang chờ thay vì bỏ lửng.

| Độ đo tầng hội thoại | Trước | Sau |
|---|---|---|
| Độ phủ cấu trúc (trạng thái × ý định) | 33.1% | **82.6%** |
| `wrong_time` trên toàn bộ lượt phát lại | 66.5% | **17.9%** |
| `wrong_time` trên câu xã giao | 69.2% | **0.0%** |
| Lượt `advanced` / `completed` | 528 / 262 | 528 / 262 *(không đổi)* |

Hàng cuối là hàng quan trọng nhất: các luồng kịch bản chính không bị đụng tới.

Phần 17.9% còn lại chủ yếu là `affirm`/`deny` - はい/いいえ chỉ có nghĩa khi vừa
được hỏi câu có-không, nên `wrong_time` ở đó là đúng.

---

## Tăng cường dữ liệu bằng LLM

Điểm yếu đo được của hệ thống không phải kiến trúc mà là **độ phủ dữ liệu**. Bộ
phân loại nhận đúng mẫu câu nó từng thấy và trượt mẫu chưa thấy. 750 câu gõ tay
là quá ít để phủ hết cách nói của người thật.

LLM giỏi đúng việc đó. Nhưng gọi LLM **lúc phục vụ** thì mất cả ba ràng buộc của
dự án. Gọi **lúc build** thì được toàn bộ cái lợi mà không mất gì:

```
LLM  →  sinh câu  →  cổng kiểm duyệt  →  data/intents/generated/
                                              ↓
                                         train (2 giây)
                                              ↓
                                    mô hình 1.8 MB, không gọi mạng
```

### Dữ liệu sinh để riêng, không trộn

`data/intents/generated/*.yaml` tách hẳn khỏi file hạt giống, và được gộp vào
đúng ý định tương ứng lúc nạp. Ba lý do:

1. **Kiểm toán được** — luôn trả lời được "câu này người viết hay máy sinh".
2. **Revert gọn** — xoá thư mục là quay về đúng dataset hạt giống.
3. **Đo được** — `load_dataset(include_generated=False)` cho ra dataset hạt
   giống, nên train hai lần rồi so là ra phần đóng góp.

Dữ liệu sinh chỉ được **làm dày ý định đã có**, không được đẻ nhãn mới. Nhãn mới
phải do người quyết định, kèm cạnh FSM tương ứng.

### Cổng kiểm duyệt

`python -m nihongo_ai.augment --check [--strip]` chạy **độc lập** với khâu sinh,
vì dữ liệu sinh có thể đến từ bất kỳ đâu. Mẻ đầu tiên: 864 câu thô, loại 226.

| Luật | Bắt được |
|---|---|
| Trùng câu đã có (kể cả ở ý định khác) | 222 |
| Lẫn hệ chữ lạ (Hangul/Kirin/Thái…) | 4 |
| Chuỗi Latin dài | 2 |
| Độ dài ngoài khoảng 3–40 ký tự | vài câu |

Hai luật cuối đáng nói vì chúng **không thay thế được nhau**:

- `japanese_ratio` KHÔNG bắt được `値段` viết lẫn một ký tự Hangul — tỉ lệ 0.90,
  lọt mọi ngưỡng hợp lý. Phải có luật hệ chữ riêng.
- Ngưỡng tỉ lệ cũng không tách được rác khỏi từ mượn hợp lệ, vì hai nhóm chồng
  lên nhau: `Wi-Fiはありますか` 0.55 và `AIですか` 0.67 là **hợp lệ**, còn
  `friendly になれたら…` 0.58 và `窓side の席は…` 0.69 là **rác**. Thứ tách được
  là ĐỘ DÀI chuỗi Latin liên tiếp — từ mượn người Nhật thật sự gõ đều rất ngắn
  (S・M・L・T・AI・Wi・Fi), cộng một allowlist nhỏ cho ATM/PayPay/Suica.

### Đo đóng góp cho đúng

Chạy `evaluate_system.py` trên dataset đã trộn cho ra con số **đẹp nhưng sai ý
nghĩa**: câu máy sinh nằm cả trong tập test, nên một phần điểm là đo khả năng
đọc chính văn máy sinh — vốn đều tay hơn câu người thật gõ.

`evaluate_augmentation.py` giữ tập TEST thuần câu viết tay; dữ liệu sinh chỉ
được vào tập TRAIN. Chênh lệch giữa hai cách đo rất thật: cùng một thay đổi,
đo trộn cho tỉ lệ lỗi gây hại **tăng** 0.2 điểm, đo sạch cho **giảm** 2.5 điểm.

| Chỉ số (test = 750 câu viết tay) | Chỉ hạt giống | + 646 câu sinh | |
|---|---|---|---|
| Trả lời đúng | 68.7% | **76.2%** | +7.5 |
| Trả lời sai (gây hại) | 10.6% | **9.1%** | −1.5 |
| Gọi nhầm là lạc đề | 11.7% | **9.7%** | −2.0 |
| Hỏi lại (tin cậy thấp) | 6.4% | **2.4%** | −4.0 |
| Chặn được lạc đề | 82.0% | **86.8%** | +4.8 |
| Lạc đề lọt (gây hại) | 17.5% | **13.0%** | −4.5 |
| **Tỉ lệ lỗi gây hại** | **12.9%** | **10.4%** | **−2.5** |
| Macro-F1 | 74.3% | **81.8%** | +7.4 |

Cả tám chỉ số đều tốt lên. Phần chặn lạc đề còn **vượt qua** mức trước khi thêm
mẫu 「〜に行きたいです」 (84.1%), tức dữ liệu sinh đã bù lại khoản đánh đổi đó.

### Giới hạn của phép đo này

Trùng lặp **y hệt** đã bị cổng kiểm duyệt loại, nhưng câu **gần giống** thì
không. Nếu LLM sinh ra một câu chỉ khác câu test đúng một trợ từ, phần cải thiện
đo được sẽ lạc quan hơn thực tế. Cách chặn triệt để là giữ một tập test người
viết mà LLM không bao giờ được nhìn thấy — chưa làm.

Một nguyên tắc đã áp dụng: **không đưa câu test vào dữ liệu sinh**. Khi
`レストランに行きたいです` phân loại hỏng, cách sửa là thêm các địa điểm katakana
dài KHÁC (`ファミレス`, `マクドナルド`, `ショッピングモール`) rồi để mô hình tự
tổng quát hoá — chứ không thêm thẳng câu test vào train, vì làm vậy là biến bài
test thành phép thử trí nhớ.

---

## Ranh giới mong manh: 「〜に行きたいです」

Đáng ghi lại vì nó cho thấy rõ giới hạn của n-gram ký tự.

Người học gõ `コンビニに行きたいです` (tôi muốn đi tới cửa hàng tiện lợi) thì bị
trả "lạc chủ đề". Lý do: `out_of_scope.yaml` từ trước đã có `日本に行きたいです`.
Với n-gram ký tự thì `に行きたいです` **trùng khít** giữa hai câu — thứ duy nhất
phân biệt được là DANH TỪ.

Thêm 12 ví dụ địa điểm gần vào `directions_ask_how_to_get` làm ranh giới đổ
theo chiều ngược lại: `ハワイに行きたいです` bị kéo sang phía hợp lệ ở mức 0.99.
Phải thêm 8 câu **đối chứng** (đích xa / đi chơi) vào `out_of_scope` mới cân
được. Dạy một chiều là không đủ — mô hình học đuôi câu trước, danh từ sau.

Kết quả dò ranh giới lúc đó: **13/15**. Hai ca hỏng đều là danh từ chưa từng
thấy ở cả hai phía — `タイ` (katakana quá ngắn) và `北海道` (chứa `道`, vốn là
n-gram rất mạnh của hỏi đường qua `道を教えてください`).

Sau khi tăng cường dữ liệu (mục trên), phép dò này đạt **15/15** — cả hai ca đó
đều đúng. Đây là ví dụ cụ thể nhất cho thấy vấn đề vốn là độ phủ dữ liệu chứ
không phải giới hạn của TF-IDF.

Cả hai chiều được khoá bằng test, xem `test_stating_a_nearby_destination_asks_for_directions`
và `test_stating_a_far_destination_stays_out_of_scope`.

---

## Kết quả chính

| | |
|---|---|
| Dữ liệu | 750 câu tự soạn, 30 ý định, 4 kịch bản |
| Mô hình | TF-IDF n-gram ký tự (2-5) + Hồi quy Logistic |
| Độ chính xác (biết kịch bản) | **0.755** |
| Chặn được câu lạc đề | **82.0%** |
| Chặn oan câu hợp lệ (tầng luật) | **0.0%** |
| Tỉ lệ lỗi gây hại | **12.9%** |
| Dung lượng mô hình | **959 KB** |
| Độ trễ | **0.49 ms/câu** |
| Thời gian huấn luyện | **~2 giây, CPU** |
| Chi phí vận hành | **0 đồng** |

### So với dataset 730 câu

Bổ sung mẫu 「〜に行きたいです」 (xem mục trên) tốn một khoản đo được, tập trung
gần như hoàn toàn ở khả năng phát hiện lạc đề:

| | 730 câu | 750 câu | |
|---|---|---|---|
| Độ chính xác theo kịch bản | 0.765 | 0.755 | −0.010 |
| Macro-F1 | 0.661 | 0.663 | +0.002 |
| **OOS-F1** | **0.697** | **0.662** | **−0.035** |
| Chặn được câu lạc đề | 84.1% | 82.0% | −2.1 điểm |
| Trả lời sai câu hợp lệ | 11.6% | 10.6% | −1.0 điểm |
| Tỉ lệ lỗi gây hại | 12.9% | 12.9% | không đổi |

Đây là đánh đổi thật, không phải hiện tượng đo: kiểm riêng trên đúng 132 câu
`out_of_scope` CŨ (không tính 8 câu đối chứng mới) thì tỉ lệ chặn vẫn giảm
84.1% → 82.2%. Cái giá là làm lớp từ chối khó hơn; cái được là một mẫu mở lời
rất thông dụng không còn bị hiểu nhầm.

> **Lưu ý về dòng MiniLM dưới đây:** nó đo trên dataset 730 câu. `torch` và
> `sentence-transformers` không nằm trong `requirements.txt` (chủ ý — xem mục
> triển khai), nên muốn so lại trên 750 câu phải cài thêm rồi chạy `--heavy`.

Đáng chú ý: mô hình này **thắng** cả mô hình nhúng câu Transformer đa ngữ
(MiniLM) — cao hơn về độ chính xác, hơn hẳn về khả năng phát hiện lạc đề
(+0.12 F1), trong khi nhỏ hơn **456 lần** và nhanh hơn **33 lần**. Chi tiết
trong [EVALUATION.md](reports/EVALUATION.md).
