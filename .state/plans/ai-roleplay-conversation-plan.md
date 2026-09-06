# Kế hoạch kiến trúc: AI Roleplay Conversation (tối ưu chi phí)

> **Trạng thái:** RESEARCH / PLANNING — chưa viết code tính năng.
> **Ngày lập:** 2026-08-21
> **Phạm vi tài liệu:** Frontend-Native (Kotodama). Phần backend chỉ mô tả _yêu cầu_, không sửa code `BE_NihongoApp`.
> **Xác nhận hiện trạng repo:** `package.json` KHÔNG có SDK LLM nào (`openai`, `@anthropic-ai/sdk`, `@google/generative-ai` đều không có). `.env` chỉ có đúng một biến: `EXPO_PUBLIC_API_URL`. → Chưa có bất kỳ tích hợp LLM nào.

---

## 0. Tóm tắt điều hành (đọc cái này nếu chỉ có 2 phút)

| Câu hỏi                                | Trả lời                                                                                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có nên tự train/fine-tune model không? | **KHÔNG, không phải bây giờ.**                                                                                                                                                                       |
| Nên làm gì cho MVP?                    | Gọi **LLM API hosted giá rẻ** (tier "mini/flash-lite"), **qua backend**, với system prompt + whitelist từ vựng đã học + prompt caching.                                                              |
| Vì sao?                                | Ở cả 3 mốc 1k / 10k / 100k DAU, self-host GPU **đắt hơn** API rẻ (xem §2). Fine-tune còn cộng thêm 4–8 person-week và chi phí bảo trì vĩnh viễn, đổi lại chất lượng tiếng Nhật _thấp hơn_ model lớn. |
| Chi phí MVP dự kiến                    | ~**$54–75/tháng @ 1k DAU**, ~**$540–750/tháng @ 10k DAU** (tier rẻ nhất, có caching).                                                                                                                |
| Rủi ro lớn nhất                        | KHÔNG phải chi phí LLM. Là **backend chưa có API trả về "tập từ vựng user đã học"** — hiện `RoadmapTopicResponse` chỉ có `topicId/topicTitle/lessons[]`, không có vocab. Đây là blocker số 1.        |

---

## 1. Luồng UX

### 1.1. Node bài học AI trên learning map

Cấu trúc hiện tại (đã đọc `src/services/api/roadmap.ts` + `src/types/api.ts`):

```
RoadmapTopicResponse { topicId, topicTitle, lessons: RoadmapLessonResponse[] }
RoadmapLessonResponse { lessonId, title, lessonType, orderIndex, status, starsEarned? }
```

`lessonType` đang là `string` tự do → **backend có thể thêm `lessonType: "ROLEPLAY"` mà không phá vỡ type hiện có.** Frontend chỉ cần thêm nhánh render. Đây là điểm tích hợp rẻ nhất, không phải đổi contract.

**Vị trí node:** đặt ở **cuối mỗi topic**, sau node checkpoint/boss — đóng vai "bài kiểm tra hội thoại" của topic đó.

**Điều kiện mở khoá:** tất cả `lessons` trong cùng `topicId` có `status === "COMPLETED"`. Nếu chưa → node ở trạng thái `LOCKED`, tap vào hiện tooltip "Hoàn thành X bài còn lại để mở khoá".

**Chi phí vào bài:** dùng lại hệ thống Energy đã có (`API_ENDPOINTS.ENERGY`). Vừa nhất quán với gamification của app, **vừa là hàng rào chi phí tự nhiên** — user không thể spam vô hạn. Đề xuất: roleplay tốn nhiều energy hơn lesson thường (vì tốn tiền thật).

### 1.2. Luồng trong màn hình hội thoại

```
[Tap node ROLEPLAY]
   ↓
POST /roleplay/{lessonId}/start
   → BE trừ energy, tạo session, trả về:
     { sessionId, character{name,avatar,persona}, openingLine, allowedVocab[], suggestedReplies[], maxTurns }
   ↓
[Màn hình chat]
   - Avatar nhân vật (tái dùng Lottie/Rive mascot có sẵn)
   - Bong bóng chat, toggle furigana/romaji/nghĩa tiếng Việt
   - 3 "gợi ý trả lời" (chip) — LẤY TỪ BE, KHÔNG gọi LLM (xem §4.2)
   - Ô nhập tự do
   - Bộ đếm lượt: 3/8
   ↓
[Mỗi lượt] POST /roleplay/{sessionId}/turn  { text }
   → BE: pre-filter từ ngoài whitelist (local, không tốn LLM)
        → nếu có từ lạ: trả cảnh báo mềm "Từ 「XX」 chưa học, thử dùng 「YY」?"
        → gọi LLM 1 lần, trả { reply, replyFurigana, suggestedReplies[] }
   ↓
[Đủ maxTurns hoặc user bấm "Kết thúc"]
POST /roleplay/{sessionId}/finish
   → BE gọi LLM MỘT LẦN với toàn bộ transcript + rubric
   → { score, vocabUsedCorrectly[], grammarMistakes[], encouragement, expEarned, starsEarned }
   ↓
[Card kết quả] — tái dùng shape giống SubmitLessonResponse để không phá vỡ UI reward/streak hiện có
```

### 1.3. Cách giới hạn phạm vi từ vựng/ngữ pháp (phần cốt lõi)

**Nguyên tắc: giới hạn 2 lớp — 1 lớp deterministic (miễn phí) + 1 lớp prompt (tốn tiền).**

**Lớp A — Deterministic, chạy ở backend, chi phí $0:**

- BE truy vấn: tất cả `lessonId` user đã `COMPLETED` → join sang bảng vocab/grammar của các lesson đó → ra `learnedVocab: Set<string>` và `learnedGrammar: Set<patternId>`.
- Trước khi gọi LLM, tokenize câu user (thư viện phân tách tiếng Nhật ở BE) và đối chiếu với `learnedVocab`. Từ ngoài tập → sinh gợi ý sửa **không cần LLM**.
- Sau khi LLM trả lời, **validate lại output**: nếu câu trả lời chứa từ ngoài whitelist → retry 1 lần với instruction cứng hơn, hoặc fallback về câu mẫu soạn sẵn. Tối đa 1 retry để chặn chi phí.

**Lớp B — Prompt-constrained (RAG nhẹ):**
System prompt lắp theo thứ tự **cố định** để tối ưu prompt caching (xem §4.2):

```
[Khối 1 — TĨNH, dùng chung mọi user] persona nhân vật + luật hội thoại + độ dài tối đa
[Khối 2 — TĨNH theo topic] bộ từ vựng + mẫu ngữ pháp của topic này (~80–150 mục)   ← cache prefix dùng chung
[Khối 3 — ĐỘNG theo user] danh sách từ user đã học ở các topic TRƯỚC (~cắt còn 100 từ gần nhất)
[Khối 4 — ĐỘNG] lịch sử hội thoại
```

> ⚠️ Thứ tự này quan trọng. Khối 1+2 giống hệt nhau cho **mọi user đang học cùng topic** → cache prefix chia sẻ được, hit rate cao. Nếu đặt danh sách cá nhân hoá lên trước, cache hit rate về ~0 và chi phí input tăng gần gấp đôi.

> ⚠️ Đừng nhồi toàn bộ vocab đã học vào prompt. User học 6 tháng có thể có 2000+ từ → prompt phình lên 8K token/lượt. **Cắt còn ~100–150 từ**: toàn bộ vocab của topic hiện tại + N từ gần nhất từ các topic trước. Đây là quyết định kiểm soát chi phí, không phải giới hạn kỹ thuật.

---

## 2. Bảng so sánh kiến trúc & chi phí

### 2.1. Giả định tính toán (nêu rõ để kiểm chứng lại được)

| Tham số                          | Giá trị                                  | Ghi chú                                    |
| -------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Số lượt/hội thoại                | 8                                        | Cap cứng, cũng là cơ chế kiểm soát chi phí |
| System prompt + vocab pack       | ~1.200 token                             | Khối 1+2+3                                 |
| Câu user/lượt                    | ~25 token                                |                                            |
| Câu AI/lượt                      | ~80 token                                | Câu ngắn trình độ N5–N4 + gợi ý            |
| Lời gọi chấm điểm cuối           | 1 lần, ~2.400 in / 250 out               | Transcript + rubric                        |
| **Tổng/hội thoại (không cache)** | **~15.100 input / ~890 output**          |                                            |
| **Tổng/hội thoại (có cache)**    | **~8.000 input hiệu dụng / ~890 output** | ~47% tiết kiệm input                       |
| Tần suất                         | 1 hội thoại/user/ngày hoạt động          |                                            |
| Quy đổi tháng                    | DAU × 30 hội thoại                       | 1k → 30K, 10k → 300K, 100k → 3M            |

### 2.2. Phương án (a) — Gọi LLM API hosted giá rẻ + prompt caching

Chi phí/hội thoại (đã áp caching):

| Model                    | Giá in/out ($/1M tok)              | $/hội thoại  | 1k DAU      | 10k DAU      | 100k DAU       |
| ------------------------ | ---------------------------------- | ------------ | ----------- | ------------ | -------------- |
| GPT-4o-mini              | $0.15 / $0.60 _(cached in $0.075)_ | **~$0,0018** | **~$54/th** | **~$540/th** | **~$5.400/th** |
| Gemini 2.5 Flash-Lite ⚠️ | $0.10 / $0.40                      | ~$0,0016     | ~$48/th     | ~$480/th     | ~$4.800/th     |
| Gemini 3.5 Flash-Lite    | $0.15 / $1.25                      | ~$0,0025     | ~$75/th     | ~$750/th     | ~$7.500/th     |
| Gemini 3.7 Flash         | $0.38 / $1.88 ⚠️ intro             | ~$0,0060     | ~$180/th    | ~$1.800/th   | ~$18.000/th    |
| Claude Haiku 4.5         | $1.00 / $5.00 _(cache read ~0,1×)_ | ~$0,0125     | ~$390/th    | ~$3.900/th   | ~$39.000/th    |

⚠️ **Cảnh báo giá — PHẢI kiểm tra lại trước khi quyết:**

- Gemini 2.5 Flash-Lite **dự kiến deprecate 2026-10-16** → không chọn làm nền tảng dài hạn.
- Gemini 3.7 Flash đang ở **giá giới thiệu, sẽ tăng gấp đôi từ 2027-01-01** ($0.75/$3.75).
- Giá GPT-4o-mini và Gemini lấy từ tổng hợp web tháng 8/2026 → **[uncertain]**, phải xác nhận trên trang giá chính thức (`openai.com/api/pricing`, `ai.google.dev/pricing`) trước khi chốt.
- Giá Claude Haiku 4.5 ($1/$5, context 200K) lấy từ bảng model chính thức của Anthropic → **độ tin cậy cao**. Cache read ~0,1×, cache write ~1,25×, Batch API giảm 50%.

**Ưu:** Không hạ tầng. Deploy trong ngày. Chất lượng tiếng Nhật cao nhất trong 3 phương án. Chi phí = $0 khi không có user (quan trọng ở giai đoạn đầu).
**Nhược:** Phụ thuộc vendor, có latency mạng, dữ liệu hội thoại đi ra bên thứ ba (xem §4.4).

### 2.3. Phương án (b) — Self-host open-weight model trên GPU thuê

Giả định: Qwen2.5-7B-Instruct hoặc Llama 3.1 8B, chạy vLLM trên A100 80GB.

Throughput ước tính: ~1,5–2 GPU-giây/hội thoại (prefill ~15K token + decode ~890 token, có batching). Với **30% utilization trung bình** (traffic học tập rất peaky — cao điểm buổi tối, gần như 0 lúc 3h sáng), một A100 phục vụ được **~400.000–500.000 hội thoại/tháng**.

Giá thuê GPU **[uncertain — cần check lại trên RunPod/Vast.ai/Lambda]**:

- A100 80GB on-demand: **~$1,07–2,00/giờ**
- A100 spot: **~$0,60/giờ** (bị preempt — không dùng cho production interactive)
- H100: $1,49–$6,98/giờ tuỳ provider — **không cần thiết cho model 7B**

| Quy mô   | Hội thoại/tháng | Số GPU cần (kèm HA + peak headroom)         | Chi phí GPU on-demand @$1,50/h | $/hội thoại |
| -------- | --------------- | ------------------------------------------- | ------------------------------ | ----------- |
| 1k DAU   | 30.000          | 2 (1 chạy + 1 dự phòng — vẫn phải bật 24/7) | **~$2.160/th**                 | ~$0,072     |
| 10k DAU  | 300.000         | 2                                           | **~$2.160/th**                 | ~$0,0072    |
| 100k DAU | 3.000.000       | 9–10                                        | **~$9.700–10.800/th**          | ~$0,0036    |

**Kết luận quan trọng:** ở **cả 3 mốc**, self-host **đắt hơn** phương án (a) với model tier mini ($54 / $540 / $5.400). Ở 1k DAU nó đắt hơn **~40 lần**. Lý do: GPU phải bật 24/7 kể cả khi không ai dùng, còn API tính theo token thực dùng.
Chỉ khi dùng spot GPU ($0,60/h → ~$4.320/th @100k DAU) thì (b) mới rẻ hơn (a) — đánh đổi bằng preemption và độ phức tạp vận hành.

**Chi phí ẩn chưa tính:** ~$2.000–4.000/tháng công sức DevOps/MLOps (monitor, autoscale, cập nhật model, xử lý sự cố lúc 2h sáng). Cộng khoản này vào thì (b) không thắng ở bất kỳ mốc nào dưới 100k DAU.

**Nhược về chất lượng:** model 7–8B viết tiếng Nhật ở mức chấp nhận được nhưng dễ sai kính ngữ (敬語), dễ trộn kanji ngoài trình độ, và tuân thủ ràng buộc whitelist kém hơn đáng kể so với model hosted. Với app **dạy** tiếng Nhật, output sai là lỗi sản phẩm nghiêm trọng chứ không chỉ là "hơi kém".

### 2.4. Phương án (c) — Fine-tune/LoRA open model rồi self-host

Chi phí = **toàn bộ chi phí (b)** + các khoản dưới:

| Hạng mục                        | Ước tính                  | Ghi chú                                                                                                                    |
| ------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Sinh dữ liệu synthetic          | **~$225–700** một lần     | 30K hội thoại mẫu × ~1.500 output token = 45M token, sinh bằng model mạnh                                                  |
| Compute train LoRA              | **~$10–40/lần chạy**      | 7B + LoRA, 3 epoch, ~8–20 GPU-giờ trên 1×A100 — **rẻ bất ngờ, không phải rào cản**                                         |
| **Review chất lượng bởi người** | **4–8 person-week**       | ⬅️ **ĐÂY MỚI LÀ CHI PHÍ THẬT.** Cần người trình độ N2+ soát dữ liệu synthetic; dữ liệu train sai = model dạy sai vĩnh viễn |
| Hạ tầng eval                    | 1–2 person-week           | Không có eval thì không biết fine-tune có tốt hơn hay không                                                                |
| Re-train khi đổi giáo trình     | 1–3 ngày/lần, lặp lại mãi | Thêm topic mới → phải train lại, hoặc chấp nhận model tụt hậu                                                              |

**Tổng đầu tư giai đoạn đầu: ~$500–1.500 compute + 6–12 person-week người.** Và chi phí runtime **vẫn bằng (b)**, tức vẫn đắt hơn (a).

---

## 3. Phân tích khả thi tự train model

### 3.1. Yêu cầu hạ tầng thực tế

| Việc                      | Yêu cầu                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| LoRA fine-tune model 7–8B | 1× A100 80GB (hoặc 1× H100), ~8–20 giờ. **Khả thi về mặt kỹ thuật.**                                           |
| Full fine-tune 7B         | 4–8× A100, hàng trăm GPU-giờ. **Không cần thiết** — LoRA đủ để ép phong cách/phạm vi.                          |
| Dữ liệu cần               | ~20.000–50.000 cặp hội thoại có gắn nhãn topic + vocab constraint. Sinh synthetic được, **nhưng phải review**. |
| Serving                   | vLLM + autoscaler + health check + fallback provider. Ít nhất 2 GPU cho HA.                                    |
| Nhân sự                   | 1 ML engineer (không phải "dev kiêm nhiệm").                                                                   |

### 3.2. Rủi ro

1. **Chất lượng thấp hơn, và sai theo cách khó phát hiện.** Model 7B fine-tune sẽ _trôi chảy_ nhưng có thể sai ngữ pháp tinh vi. Với app dạy học, đây là loại lỗi tệ nhất — user tin tưởng và học sai theo.
2. **Vòng lặp tự nhiễm (self-poisoning).** Dữ liệu synthetic sinh từ model lớn kế thừa cả lỗi của model lớn, rồi được nhân bản 30.000 lần.
3. **Gánh nặng bảo trì vĩnh viễn.** Mỗi lần thêm topic/đổi giáo trình → train lại. Model hosted thì chỉ cần sửa prompt (5 phút).
4. **Chi phí cơ hội.** 6–12 person-week đổ vào fine-tune là 6–12 person-week KHÔNG dùng để làm voice, spaced repetition, hay sửa bug. Ở giai đoạn tính năng chưa có user, đây là đánh đổi rất tệ.
5. **Fine-tune không giải quyết được vấn đề bạn nghĩ nó giải quyết.** Ràng buộc "chỉ dùng từ đã học" **thay đổi theo từng user, từng ngày**. Đó là bài toán _runtime constraint_, không phải _model weights_. Fine-tune không thể encode "user #4821 đã học 137 từ tính đến hôm nay". Việc đó bắt buộc phải làm bằng prompt + validate deterministic — **và nếu đã phải làm rồi thì phần lớn lợi ích của fine-tune biến mất.** Đây là lý do kỹ thuật mạnh nhất để không fine-tune.

### 3.3. Khi nào tự train THỰC SỰ đáng làm

Chỉ khi **TẤT CẢ** điều kiện sau đồng thời đúng:

- [ ] ≥ **1.000.000 hội thoại/tháng**, duy trì ≥ 3 tháng
- [ ] Hoá đơn API > **$5.000/tháng** và đã tối ưu hết mức (cache hit > 70%, prompt < 1.5K token, đã cap lượt)
- [ ] Đã có ≥ **50.000 hội thoại thật** có nhãn chất lượng (không phải synthetic)
- [ ] Có **ML engineer chuyên trách**, không kiêm nhiệm
- [ ] Có bộ **eval tự động** chứng minh được model mới tốt hơn/bằng model hosted trên chính dữ liệu của bạn

Thiếu bất kỳ mục nào → tiếp tục prompt-constrain model có sẵn.

**Đường giữa nên cân nhắc trước khi tự host:** các provider đều có **fine-tuning hosted** cho model nhỏ — được lợi ích fine-tune mà **không phải tự vận hành GPU**. Giá **[uncertain]**, cần check trang giá chính thức. Nếu Phase 3 thực sự xảy ra, thử đường này TRƯỚC khi thuê GPU.

---

## 4. Khuyến nghị MVP

### 4.1. Chọn phương án (a) — LLM API hosted giá rẻ, gọi qua backend

**Lý do:**

1. **Rẻ nhất ở mọi quy mô đang xét** ($54/th @1k DAU so với $2.160/th nếu self-host).
2. **Chi phí co giãn về $0** khi chưa có user — đúng với thực tế tính năng này chưa launch.
3. **Chất lượng tiếng Nhật tốt nhất** — quan trọng vì đây là sản phẩm dạy học.
4. **Thời gian ra mắt tính bằng ngày, không phải tuần.**
5. **Reversible** — nếu sau này cần đổi, chỉ đổi lớp provider ở backend; frontend không đổi một dòng nào (miễn contract `/roleplay/*` giữ nguyên).

### 4.2. Cơ chế kiểm soát chi phí (thiết kế NGAY từ MVP, không để sau)

| #   | Cơ chế                                                                                                     | Tiết kiệm ước tính                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Cap 8 lượt/hội thoại** (server-enforce, không tin client)                                                | Chặn trên cứng cho chi phí xấu nhất/session                                                                                         |
| 2   | **`max_tokens` = 120/lượt**                                                                                | Chặn đuôi output dài bất thường (output đắt gấp 4–8× input)                                                                         |
| 3   | **Prompt caching, khối tĩnh đặt trước khối cá nhân hoá**                                                   | ~45–50% chi phí input                                                                                                               |
| 4   | **Câu mở đầu + 3 chip gợi ý soạn sẵn lúc tạo nội dung**, lưu DB                                            | Bỏ hẳn 1 lời gọi LLM/session; chip gợi ý là nội dung tĩnh theo topic, không cần sinh runtime                                        |
| 5   | **Chấm điểm 1 lần ở cuối**, KHÔNG chấm từng lượt                                                           | Tiết kiệm ~7 lời gọi/session (~60% tổng chi phí nếu làm sai)                                                                        |
| 6   | **Pre-filter từ ngoài whitelist bằng code, không bằng LLM**                                                | Phần lớn feedback "từ chưa học" là $0                                                                                               |
| 7   | **Rate limit qua hệ thống Energy có sẵn** + hard cap 3 session/user/ngày                                   | Chặn abuse; tái dùng gamification đã có                                                                                             |
| 8   | **Cache câu trả lời cho input phổ biến** (hash của `topicId + turnIndex + normalized user text`)           | Người mới học gõ những câu giống hệt nhau (`はい`, `わかりません`, `おげんきですか`). Hit rate thực tế có thể 15–30% ở các lượt đầu |
| 9   | **Model rẻ hơn cho phần chấm điểm/feedback** — chấm điểm là classification có rubric, không cần model mạnh | 20–30% chi phí phần feedback                                                                                                        |
| 10  | **Log `input_tokens` / `output_tokens` / `cache_read` cho MỌI request từ ngày 1**                          | Không đo được thì không tối ưu được. Đây là mục quan trọng nhất trong bảng.                                                         |
| 11  | Cân nhắc **Batch API (giảm 50%)** nếu chấp nhận feedback trả về sau vài phút                               | 50% phần chấm điểm — nhưng đánh đổi UX, chỉ làm nếu đo thấy chi phí thật sự đau                                                     |

### 4.3. Quyết định còn để ngỏ — cần chọn (xem §7)

Chọn provider nào trong phương án (a). Chênh lệch tới **~7×** giữa lựa chọn rẻ nhất và Claude Haiku, đổi lại khác biệt về chất lượng tiếng Nhật và độ tuân thủ ràng buộc. Đây là quyết định sản phẩm, không nên tự quyết.

### 4.4. Ràng buộc bắt buộc, không thương lượng

- **KHÔNG BAO GIỜ gọi LLM trực tiếp từ app React Native.** API key trong `EXPO_PUBLIC_*` là public — bất kỳ ai unzip file APK cũng đọc được, và sẽ bị lạm dụng để chạy hoá đơn của bạn. Mọi lời gọi phải đi qua `BE_NihongoApp`.
- **Không đưa PII vào prompt.** Dùng userId ẩn danh, không gửi email/tên thật/số điện thoại.
- **Cần chính sách dữ liệu.** Hội thoại của user đi ra bên thứ ba → phải nêu trong privacy policy. Kiểm tra chính sách lưu trữ/huấn luyện của provider trước khi chốt.
- **Cần fallback.** Provider down → hiện thông báo thân thiện và **hoàn energy**, không được để user mất lượt.

---

## 5. Phạm vi ảnh hưởng phía Frontend-Native

> Danh sách để lập kế hoạch. **CHƯA tạo file nào ở bước này.** Đường dẫn tuân theo `AGENTS.md`.

### 5.1. Frontend (`Frontend-Native`)

| Thư mục                              | File dự kiến                                                                                                                                                         | Ghi chú                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/`                         | `roleplay.ts` (mới) + export trong `index.ts`                                                                                                                        | `RoleplaySession`, `RoleplayTurn`, `RoleplayCharacter`, `RoleplayFeedback`                                                                                |
| `src/types/`                         | `lesson.ts` (sửa nhỏ)                                                                                                                                                | Thêm `"roleplay"` vào `LearningPathNode["nodeType"]`                                                                                                      |
| `src/types/`                         | `api.ts` (thêm DTO)                                                                                                                                                  | `StartRoleplayResponse`, `RoleplayTurnRequest/Response`, `FinishRoleplayResponse`                                                                         |
| `src/services/api/`                  | `roleplay.ts` (mới)                                                                                                                                                  | Theo đúng pattern của `lessons.ts` / `roadmap.ts`                                                                                                         |
| `src/services/api/`                  | `endpoints.ts` (thêm khối `ROLEPLAY`)                                                                                                                                | `START` / `TURN` / `FINISH`                                                                                                                               |
| `src/hooks/`                         | `use-roleplay-session.ts` (mới)                                                                                                                                      | Quản lý state lượt, optimistic UI, retry, hoàn energy khi lỗi                                                                                             |
| `src/components/roleplay/`           | `chat-bubble.tsx`, `character-header.tsx`, `typing-indicator.tsx`, `suggested-replies.tsx`, `turn-counter.tsx`, `vocab-warning.tsx`, `feedback-card.tsx`, `index.ts` | Mỗi component 1 file, theo quy tắc dự án                                                                                                                  |
| `src/components/lessons/`            | sửa component render node roadmap                                                                                                                                    | Thêm nhánh cho `lessonType === "ROLEPLAY"`                                                                                                                |
| `src/app/lesson/roleplay/`           | `[id].tsx`, `_layout.tsx`                                                                                                                                            | **Screen mỏng** — chỉ compose component + điều hướng                                                                                                      |
| `src/data/`                          | `roleplay.ts` (mock)                                                                                                                                                 | Để dev FE song song trước khi BE xong                                                                                                                     |
| `src/locales/`                       | thêm chuỗi i18n                                                                                                                                                      |                                                                                                                                                           |
| `src/app/lesson/roleplay/__tests__/` | test tích hợp                                                                                                                                                        | **Bắt buộc theo AGENTS.md**: `@testing-library/react-native`, mock API, `fireEvent.changeText` + `fireEvent.press`, assert bong bóng chat và card kết quả |

**Không cần dependency mới** cho MVP text-only — `axios` đã có, `FlatList` đủ để render chat.
**Lưu ý kỹ thuật:** MVP nên dùng **response thường, không streaming**. Câu trả lời chỉ ~80 token (dưới 1 giây), còn streaming SSE trên React Native cần thêm thư viện và xử lý phức tạp. Không đáng ở giai đoạn này.

### 5.2. Backend team cần làm (KHÔNG thuộc phạm vi repo này)

1. **API trả về tập vocab/grammar đã học của user** — ⚠️ **BLOCKER SỐ 1.** Hiện chưa có endpoint nào trả dữ liệu này. Cần bảng liên kết lesson ↔ vocabulary và query theo lesson đã COMPLETED.
2. Ba endpoint `POST /api/v1/roleplay/{lessonId}/start`, `/{sessionId}/turn`, `/{sessionId}/finish`.
3. **Giữ API key LLM**, tích hợp SDK provider, quản lý prompt template theo topic.
4. Lưu session state (Redis) kèm TTL, chống replay và giữ đúng số lượt.
5. Tokenizer/phân tách tiếng Nhật để pre-filter input và validate output.
6. Rate limit + tích hợp trừ/hoàn Energy.
7. **Logging token usage + dashboard chi phí.**
8. Content safety filter (input & output).
9. Thêm `lessonType: "ROLEPLAY"` vào response của `/api/v1/topics`.

---

## 6. Lộ trình theo giai đoạn

### Phase 0 — Đo trước, đoán sau (~1 tuần)

- Dựng prototype thô (script, không phải app) với 3 topic, chạy **50 hội thoại thật** bằng người trong team.
- **Mục tiêu duy nhất: thay các con số ước tính ở §2.1 bằng số đo thật** — số lượt trung bình thực tế, độ dài prompt thực tế, cache hit rate thực tế.
- Chốt provider dựa trên chất lượng tiếng Nhật quan sát được, không dựa trên benchmark chung.
- **Gate:** nếu chi phí thật/hội thoại > 3× ước tính → xem lại thiết kế prompt trước khi viết bất kỳ dòng code UI nào.

### Phase 1 — MVP (~2–3 tuần sau khi BE sẵn sàng)

- Text-only. Phương án (a). Đủ 11 cơ chế kiểm soát chi phí ở §4.2.
- Ra mắt cho **1 topic duy nhất** trước, đo retention + chi phí thật trong 2 tuần.
- **Gate:** chỉ mở rộng ra mọi topic nếu (i) tỉ lệ hoàn thành hội thoại > 60% và (ii) chi phí/DAU nằm trong ngân sách.

### Phase 2 — Giọng nói (chỉ khi Phase 1 chứng minh có nhu cầu)

- STT + TTS. **Đây mới là phần đắt** — giá STT/TTS **[uncertain]**, phải khảo sát riêng; theo kinh nghiệm chung nó thường **đắt hơn phần LLM text vài lần**.
- App đã có sẵn `src/components/voice/` và `expo-av` → chi phí frontend thấp, chi phí vận hành mới là vấn đề.
- Cân nhắc gate sau paywall/premium ngay từ đầu.

### Phase 3 — Fine-tune (CHỈ khi dữ liệu chứng minh; có thể không bao giờ xảy ra)

- Kích hoạt khi **và chỉ khi** đủ cả 5 điều kiện ở §3.3.
- Thử **hosted fine-tuning trước**; tự host GPU là phương án cuối.
- Nếu đến Phase 3 mà vẫn chưa đủ 5 điều kiện — đó là kết quả tốt, không phải thất bại. Nó nghĩa là phương án rẻ đang hoạt động.

---

## 7. Câu hỏi cần quyết trước khi triển khai

1. **Provider nào?** Chênh ~7× chi phí (xem §2.2 và §4.3). Trade-off: rẻ nhất so với chất lượng tiếng Nhật / độ tuân thủ ràng buộc tốt nhất.
2. **Ngân sách trần/tháng cho tính năng này?** Con số này quyết định cap lượt và rate limit, nên cần biết trước khi thiết kế prompt.
3. **Backend team có sẵn sàng làm API "vocab đã học" không?** Không có nó thì tính năng không thể giới hạn phạm vi từ vựng — mà đó chính là điểm khác biệt cốt lõi của tính năng này.

---

## Phụ lục — Nguồn tham khảo giá

- Anthropic model pricing (Haiku 4.5 $1/$5, context 200K; cache read ~0,1×, cache write ~1,25×; Batch −50%): bảng model chính thức của Anthropic, cached 2026-06-24 — **độ tin cậy cao**.
- GPT-4o-mini $0.15/$0.60, cached input $0.075 — tổng hợp web 08/2026, **[uncertain]**, xác nhận tại `openai.com/api/pricing`.
- Gemini 3.7 Flash $0.38/$1.88 (intro, ×2 từ 2027-01-01); 3.6 Flash $1.50/$7.50; 3.5 Flash-Lite $0.15/$1.25; 2.5 Flash-Lite $0.10/$0.40 (deprecate 2026-10-16) — tổng hợp web 08/2026, **[uncertain]**, xác nhận tại `ai.google.dev/pricing`.
- Giá thuê GPU (A100 80GB ~$1,07–2,00/h on-demand, ~$0,60/h spot; H100 $1,49–$6,98/h) — tổng hợp web 08/2026, **[uncertain]**, xác nhận tại RunPod / Vast.ai / Lambda Labs.
- Ước tính throughput vLLM và mức utilization 30% là **suy luận kỹ thuật, không phải số đo** — phải benchmark thật nếu phương án (b) từng được cân nhắc nghiêm túc.
