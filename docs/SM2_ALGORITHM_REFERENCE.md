# TÀI LIỆU THAM KHẢO VÀ NGUỒN GỐC HỌC THUẬT: THUẬT TOÁN SUPERMEMO SM-2

Tài liệu này tổng hợp toàn diện nguồn gốc khoa học, lịch sử phát hành, công thức toán học và các định dạng trích dẫn học thuật (APA, IEEE, BibTeX) của thuật toán **SuperMemo SM-2**, phục vụ cho việc đưa vào báo cáo kỹ thuật, khóa luận hoặc đồ án tốt nghiệp.

---

## 1. Cơ Sở Khoa Học (Scientific Foundation)

### 1.1. Đường cong lãng quên của Ebbinghaus (The Forgetting Curve)
- **Nhà khoa học:** Hermann Ebbinghaus (1850 – 1909), nhà tâm lý học thực nghiệm người Đức.
- **Công trình gốc:** *Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie* (1885) — dịch sang tiếng Anh là *Memory: A Contribution to Experimental Psychology* (1913).
- **Phát hiện:** Trí nhớ của con người về một thông tin mới suy giảm theo hàm mũ theo thời gian nếu không được kích hoạt lại. Lượng kiến thức bị rơi rụng nhiều nhất trong vòng 24–48 giờ đầu tiên sau khi tiếp nhận.

### 1.2. Nguyên lý Ôn tập Ngắt quãng (Spaced Repetition Principle)
- **Hiệu ứng ngắt quãng (Spacing Effect):** Việc phân bố các buổi học ngắt quãng qua thời gian (spaced practice) mang lại hiệu quả ghi nhớ dài hạn vượt trội hơn hẳn so với việc học dồn một lần trong thời gian ngắn (massed practice / cramming).
- **Thời điểm vàng để ôn tập (Optimal Review Timing):** Não bộ đạt hiệu quả củng cố dấu vết trí nhớ (memory consolidation) tối đa khi việc ôn tập diễn ra **ngay tại thời điểm người học chuẩn bị quên** (retrieval practice right before forgetting).
- Nếu ôn quá sớm: Lãng phí thời gian, không tạo ra nỗ lực gợi nhớ (retrieval effort).
- Nếu ôn quá muộn: Thông tin đã bị quên hoàn toàn, não bộ phải học lại từ đầu (re-learning) thay vì củng cố.

---

## 2. Nguồn Gốc Lịch Sử & Tác Giả Thuật Toán SM-2

### 2.1. Tác giả
- **Tiến sĩ Piotr A. Woźniak** (sinh năm 1960 tại Ba Lan) — nhà nghiên cứu khoa học nhận thức, chuyên gia về tối ưu hóa học tập tại Đại học Công nghệ Poznań (Poznań University of Technology / Politechnika Poznańska).

### 2.2. Tiến trình ra đời
- **1985 (SM-0):** Trong quá trình học tiếng Anh và sinh thái học, Piotr Woźniak bắt đầu làm thí nghiệm thủ công trên giấy với hàng nghìn thẻ từ vựng để tìm quy luật giãn cách thời gian giữa các lần ôn.
- **1987 (SM-2):** Woźniak tin học hóa thuật toán và lập trình thành phần mềm chạy trên máy tính MS-DOS (SuperMemo 2). Đây là phiên bản mang tính bước ngoặt: đưa ra khái niệm **Hệ số dễ nhớ (Easiness Factor - $EF$)** có khả năng tự điều chỉnh theo độ khó riêng biệt của từng thẻ kiến thức và năng lực của từng cá nhân.
- **1990:** Woźniak bảo vệ thành công luận văn Thạc sĩ mang tên *"Optimization of learning"* tại Đại học Công nghệ Poznań, chính thức công bố công thức toán học và cơ sở dữ liệu thực nghiệm của SM-2.
- **1994:** Công bố bài báo khoa học trên tạp chí y sinh học thần kinh *Acta Neurobiologiae Experimentalis*.

---

## 3. Công Thức Toán Học Chuẩn Của SM-2

Mỗi mục kiến thức (từ vựng) được theo dõi qua 3 biến số trạng thái:
1. $n$: Số lần ôn tập thành công liên tiếp ($n \in \mathbb{N}_{\ge 0}$).
2. $EF$: Hệ số dễ nhớ (Easiness Factor), khởi tạo mặc định ban đầu là $EF_0 = 2.5$.
3. $I(n)$: Khoảng cách thời gian đến lần ôn tập tiếp theo (Interval), tính bằng ngày.

### 3.1. Thang điểm đánh giá chất lượng phản hồi ($q$)
Sau mỗi lần ôn tập, chất lượng nhớ lại của người học được đánh giá trên thang điểm từ 0 đến 5 ($q \in \{0, 1, 2, 3, 4, 5\}$):
- **5 (Perfect):** Trả lời hoàn hảo, phản xạ ngay tức thì, không chút do dự.
- **4 (Good):** Trả lời đúng sau một thoáng suy nghĩ hoặc do dự nhẹ.
- **3 (Pass):** Trả lời đúng nhưng rất chật vật, tốn nhiều nỗ lực suy nghĩ (ngưỡng đạt tối thiểu).
- **2 (Incorrect - Easy recall):** Trả lời sai; nhận ra ngay đáp án đúng khi được gợi ý.
- **1 (Incorrect - Remembered on sight):** Trả lời sai; chỉ nhớ mang máng khi nhìn thấy đáp án.
- **0 (Complete blackout):** Hoàn toàn không có ấn tượng hoặc quên sạch kiến thức.

### 3.2. Cập nhật Hệ số dễ nhớ ($EF$)
Hệ số $EF$ mới ($EF'$) được tính toán dựa trên đánh giá $q$:
$$EF' = EF + \left(0.1 - (5 - q) \times \left(0.08 + (5 - q) \times 0.02\right)\right)$$

**Quy tắc chặn sàn (Lower Bound Clamp):**
$$EF' = \max\left(1.3, \; EF'\right)$$
> **Lưu ý kỹ thuật:** Giá trị $EF$ không bao giờ được phép nhỏ hơn $1.3$. Nếu không có ngưỡng sàn này, các từ vựng khó sẽ khiến $EF$ tụt về gần 0, làm cho từ đó bị lặp lại liên tục mỗi ngày và kẹt vĩnh viễn trong hàng đợi ôn tập.

### 3.3. Tính toán khoảng cách ôn tập kế tiếp $I(n)$
- Nếu $q \ge 3$ (Học sinh nhớ được):
  $$I(n) = \begin{cases} 
  1 \text{ ngày} & \text{khi } n = 1 \\ 
  6 \text{ ngày} & \text{khi } n = 2 \\ 
  I(n-1) \times EF' & \text{khi } n > 2 
  \end{cases}$$
  Đồng thời tăng số lần thành công: $n \leftarrow n + 1$.

- Nếu $q < 3$ (Học sinh bị quên / trả lời sai):
  - Đặt lại chuỗi thành công: $n \leftarrow 0$.
  - Khoảng cách quay về bước đầu tiên: $I \leftarrow 1 \text{ ngày}$ (chu kỳ học lại).
  - $EF$ vẫn cập nhật theo công thức trên (khiến $EF$ bị giảm mạnh, phản ánh từ này khó).

---

## 4. Đối Chiếu Triển Khai Thực Tế Trong Dự Án (Nihongo App)

Trong hệ thống của dự án, thuật toán SM-2 được cài đặt tại:
- **Backend Service:** Class [`Sm2Scheduler.java`](file:///c:/Users/Endministrator/Documents/BE_NihongoApp/src/main/java/com/example/nihongo_app/service/impl/Sm2Scheduler.java) và [`VocabularyServiceImpl.java`](file:///c:/Users/Endministrator/Documents/BE_NihongoApp/src/main/java/com/example/nihongo_app/service/impl/VocabularyServiceImpl.java).
- **Database Table:** Migration [`V40__create_vocabulary_and_srs.sql`](file:///c:/Users/Endministrator/Documents/BE_NihongoApp/src/main/resources/db/migration/V40__create_vocabulary_and_srs.sql) (bảng `user_vocabulary_progress` lưu các trường `ease_factor`, `interval_minutes`, `repetitions`, `next_due_at`).
- **Frontend App:** Màn hình [`review/vocabulary.tsx`](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/review/vocabulary.tsx) và sổ tay [`(tabs)/dictionary.tsx`](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(tabs)/dictionary.tsx).

### 4.1. Các điểm tinh chỉnh phù hợp cho ứng dụng di động:
1. **Chuyển đơn vị từ Ngày sang Phút (Learning Steps):**
   - SM-2 gốc đặt mốc $I(1) = 1$ ngày. Trên app di động, từ mới nếu đến ngày mai mới nhắc lại thì người học đã quên sạch.
   - Dự án áp dụng cơ chế bước học tương tự Anki: gặp lại sau 10 phút (`LEARNING_STEPS_MINUTES = {10, 1440}`), sau đó mới "tốt nghiệp" sang khoảng cách 6 ngày.
2. **Ánh xạ điểm chất lượng $q$ tự động:**
   - Do người học làm bài trắc nghiệm khách quan thay vì tự chấm độ khó 0–5:
     - Trả lời đúng $\rightarrow q = 4$.
     - Trả lời sai $\rightarrow q = 1$.
3. **Chống lạm phát khoảng cách do học dồn (Before-due Protection):**
   - Nếu người học làm lại bài khi từ **chưa tới hạn** (`beforeDue`), câu trả lời đúng sẽ không nhân giãn thêm khoảng cách $I$, tránh việc làm đi làm lại 5 lần trong một ngày khiến từ vựng bị đẩy xa hàng tháng.

---

## 5. Mẫu Trích Dẫn Học Thuật Chuẩn (Academic Citations)

### 5.1. Chuẩn APA (American Psychological Association, 7th Edition)
```text
Wozniak, P. A., & Gorzelanczyk, E. J. (1994). Optimization of repetition spacing in the practice of learning. Acta Neurobiologiae Experimentalis, 54(1), 59–62.

Wozniak, P. A. (1990). Optimization of learning (Master's thesis). University of Technology in Poznań, Poznań, Poland.

Ebbinghaus, H. (1885). Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie. Duncker & Humblot.
```

### 5.2. Chuẩn IEEE
```text
[1] P. A. Wozniak and E. J. Gorzelanczyk, "Optimization of repetition spacing in the practice of learning," Acta Neurobiologiae Experimentalis, vol. 54, no. 1, pp. 59–62, 1994.

[2] P. A. Wozniak, "Optimization of learning," Master's thesis, Department of Computer Science, University of Technology in Poznań, Poznań, Poland, 1990.

[3] H. Ebbinghaus, Memory: A Contribution to Experimental Psychology, H. A. Ruger and C. E. Bussenius, Trans. New York, NY, USA: Teachers College, Columbia University, 1913.
```

### 5.3. Định dạng BibTeX (Dành cho LaTeX / Overleaf)
```bibtex
@article{wozniak1994optimization,
  title={Optimization of repetition spacing in the practice of learning},
  author={Wozniak, Piotr A and Gorzelanczyk, Edward J},
  journal={Acta Neurobiologiae Experimentalis},
  volume={54},
  number={1},
  pages={59--62},
  year={1994},
  publisher={Nencki Institute of Experimental Biology}
}

@mastersthesis{wozniak1990optimization,
  title={Optimization of learning},
  author={Wozniak, Piotr A},
  school={University of Technology in Pozna{\'n}},
  address={Pozna{\'n}, Poland},
  year={1990}
}

@book{ebbinghaus1885gedachtnis,
  title={{\"U}ber das Ged{\"a}chtnis: Untersuchungen zur experimentellen Psychologie},
  author={Ebbinghaus, Hermann},
  year={1885},
  publisher={Duncker \& Humblot},
  address={Leipzig, Germany}
}
```

### 5.4. Các Đường Dẫn Trực Tuyến Chính Thống (Primary Web Resources)
- **Bài phân tích thuật toán gốc của SuperMemo:**
  - Tiêu đề: *Application of a computer to improve the results of obtaining photographic memory*
  - URL: `https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-of-obtaining-photographic-memory`
- **Kho lưu trữ học thuật của TS. Piotr Woźniak:**
  - URL: `https://super-memo.com/articles/paper.htm`
- **Mã nguồn tài liệu mở tham khảo phổ biến của SM-2:**
  - Anki SRS Documentation: `https://docs.ankiweb.net/background.html`
