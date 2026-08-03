-- V18__reseed_scientific_lessons.sql
-- Kịch bản dữ liệu: Hệ thống học tiếng Nhật khoa học (Lộ trình chuẩn EdTech)

-- 1. XÓA DỮ LIỆU CŨ ĐỂ RESET
DELETE FROM user_lesson_progress;
DELETE FROM lesson_question_options;
DELETE FROM lesson_questions;
DELETE FROM lessons;
DELETE FROM topics;

-- 2. RESET NĂNG LƯỢNG CHO USER TEST
UPDATE users SET current_energy = 9999, max_energy = 9999;

-- ==========================================
-- 3. KHỞI TẠO CHỦ ĐỀ (TOPICS)
-- ==========================================
INSERT INTO topics (id, title, description, order_index) VALUES 
(1, 'PHẦN 1: CHÀO HỎI & CƠ BẢN', 'Từ vựng cốt lõi, cách giới thiệu bản thân và chào hỏi', 1),
(2, 'PHẦN 2: MUA SẮM & SỐ ĐẾM', 'Đếm số cơ bản, chỉ định từ và mẫu câu mua sắm', 2);

-- ==========================================
-- 4. DỮ LIỆU TOPIC 1: CHÀO HỎI & CƠ BẢN
-- ==========================================

-- Thêm Bài học cho Topic 1
INSERT INTO lessons (id, topic_id, jlpt_level, title, order_index, lesson_type) VALUES 
(101, 1, 'N5', 'Bài 1.1: Từ vựng cốt lõi (Bản thân & Nghề nghiệp)', 1, 'NORMAL'),
(102, 1, 'N5', 'Bài 1.2: Ngữ pháp khẳng định (Tôi là...)', 2, 'NORMAL'),
(103, 1, 'N5', 'Bài 1.3: Chào hỏi giao tiếp cơ bản', 3, 'NORMAL'),
(104, 1, 'N5', 'Bài 1.4: Luyện tập tổng hợp Nghe - Nói - Đọc', 4, 'NORMAL'),
(105, 1, 'N5', 'Bài 1.5: Kiểm tra vượt ải (Topic 1)', 5, 'JUMP_TEST');

-- BÀI 1.1: TỪ VỰNG CỐT LÕI (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(10101, 101, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Tôi / Bản thân"', '{"romaji": "watashi"}', 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png'),
(10102, 101, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Học sinh"', '{"romaji": "gakusei"}', 'https://cdn-icons-png.flaticon.com/512/2995/2995112.png'),
(10103, 101, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Giáo viên"', '{"romaji": "sensei"}', 'https://cdn-icons-png.flaticon.com/512/1975/1975091.png'),
(10104, 101, 'LISTEN_AND_SELECT', 'Nghe và chọn nghĩa của từ', '{"audio_url": "https://cdn.example.com/audio/watashi.mp3", "romaji": "watashi"}', NULL),
(10105, 101, 'TRANSLATE_TO_VN', 'Dịch sang tiếng Việt: "Anata"', '{"romaji": "anata"}', NULL),
(10106, 101, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Bác sĩ"', '{"hint": "Gợi ý: isha"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(10101, 'Watashi', true, 1), (10101, 'Anata', false, 2), (10101, 'Sensei', false, 3), (10101, 'Gakusei', false, 4),
(10102, 'Gakusei', true, 1), (10102, 'Watashi', false, 2), (10102, 'Isha', false, 3), (10102, 'Sensei', false, 4),
(10103, 'Sensei', true, 1), (10103, 'Gakusei', false, 2), (10103, 'Isha', false, 3), (10103, 'Anata', false, 4),
(10104, 'Tôi', true, 1), (10104, 'Bạn', false, 2), (10104, 'Bác sĩ', false, 3), (10104, 'Giáo viên', false, 4),
(10105, 'Bạn', true, 1), (10105, 'Tôi', false, 2), (10105, 'Học sinh', false, 3), (10105, 'Nhân viên', false, 4),
(10106, 'Isha', true, 1), (10106, 'Sensei', false, 2), (10106, 'Gakusei', false, 3), (10106, 'Watashi', false, 4);

-- BÀI 1.2: NGỮ PHÁP (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(10201, 102, 'TRANSLATE_TO_VN', 'Dịch câu sau: "Watashi wa gakusei desu."', '{"romaji": "watashi wa gakusei desu"}', NULL),
(10202, 102, 'LISTEN_AND_ARRANGE', 'Nghe và sắp xếp câu: "Tôi là giáo viên."', '{"audio_url": "https://cdn.example.com/audio/watashi_wa_sensei_desu.mp3"}', NULL),
(10203, 102, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Tôi là bác sĩ."', '{"hint": "Dùng cấu trúc: ...wa...desu"}', NULL),
(10204, 102, 'TRANSLATE_TO_VN', 'Dịch câu sau: "Anata wa isha desu."', '{"romaji": "anata wa isha desu"}', NULL),
(10205, 102, 'LISTEN_AND_ARRANGE', 'Nghe và sắp xếp câu hỏi: "Bạn là học sinh phải không?"', '{"audio_url": "https://cdn.example.com/audio/anata_wa_gakusei_desuka.mp3"}', NULL),
(10206, 102, 'SPEAKING', 'Đọc to để giới thiệu bản thân:', '{"expected": "watashi wa gakusei desu", "romaji": "Watashi wa gakusei desu"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(10201, 'Tôi là học sinh.', true, 1), (10201, 'Bạn là học sinh.', false, 2), (10201, 'Tôi là giáo viên.', false, 3), (10201, 'Tôi không phải học sinh.', false, 4),
(10202, 'Watashi', true, 1), (10202, 'wa', true, 2), (10202, 'sensei', true, 3), (10202, 'desu.', true, 4),
(10203, 'Watashi wa isha desu.', true, 1), (10203, 'Watashi wa sensei desu.', false, 2), (10203, 'Anata wa isha desu.', false, 3), (10203, 'Watashi wa isha arimasen.', false, 4),
(10204, 'Bạn là bác sĩ.', true, 1), (10204, 'Tôi là bác sĩ.', false, 2), (10204, 'Anh ấy là bác sĩ.', false, 3), (10204, 'Bạn là học sinh.', false, 4),
(10205, 'Anata', true, 1), (10205, 'wa', true, 2), (10205, 'gakusei', true, 3), (10205, 'desu ka?', true, 4),
(10206, 'Watashi wa gakusei desu.', true, 1);

-- BÀI 1.3: CHÀO HỎI (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(10301, 103, 'TRANSLATE_TO_VN', 'Dịch sang tiếng Việt: "Ohayou gozaimasu"', '{"romaji": "ohayou gozaimasu"}', 'https://cdn-icons-png.flaticon.com/512/2920/2920158.png'),
(10302, 103, 'TRANSLATE_TO_VN', 'Dịch sang tiếng Việt: "Konnichiwa"', '{"romaji": "konnichiwa"}', 'https://cdn-icons-png.flaticon.com/512/3222/3222792.png'),
(10303, 103, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Chào buổi tối"', '{"hint": "Bắt đầu bằng K..."}', NULL),
(10304, 103, 'LISTEN_AND_SELECT', 'Nghe và chọn lời chào phù hợp', '{"audio_url": "https://cdn.example.com/audio/arigatou.mp3"}', NULL),
(10305, 103, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Xin lỗi / Cho tôi hỏi"', '{"hint": "Sumima..."}', NULL),
(10306, 103, 'SPEAKING', 'Đọc to lời tạm biệt:', '{"expected": "sayounara", "romaji": "Sayounara"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(10301, 'Chào buổi sáng', true, 1), (10301, 'Chào buổi chiều', false, 2), (10301, 'Chào buổi tối', false, 3), (10301, 'Tạm biệt', false, 4),
(10302, 'Chào buổi chiều / Xin chào', true, 1), (10302, 'Chào buổi sáng', false, 2), (10302, 'Cảm ơn', false, 3), (10302, 'Xin lỗi', false, 4),
(10303, 'Konbanwa', true, 1), (10303, 'Konnichiwa', false, 2), (10303, 'Ohayou', false, 3), (10303, 'Sayounara', false, 4),
(10304, 'Cảm ơn', true, 1), (10304, 'Xin chào', false, 2), (10304, 'Tạm biệt', false, 3), (10304, 'Xin lỗi', false, 4),
(10305, 'Sumimasen', true, 1), (10305, 'Arigatou', false, 2), (10305, 'Ohayou', false, 3), (10305, 'Sayounara', false, 4),
(10306, 'Sayounara', true, 1);

-- BÀI 1.4: TỔNG HỢP (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(10401, 104, 'LISTEN_AND_ARRANGE', 'Nghe và sắp xếp câu: "Xin chào, tôi là giáo viên."', '{"audio_url": "https://cdn.example.com/audio/konnichiwa_watashi_wa_sensei_desu.mp3"}', NULL),
(10402, 104, 'TRANSLATE_TO_JP', 'Dịch: "Cảm ơn. Tôi là học sinh."', '{"hint": "Arigatou..."}', NULL),
(10403, 104, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Bác sĩ"', '{"romaji": "isha"}', 'https://cdn-icons-png.flaticon.com/512/3874/3874084.png'),
(10404, 104, 'LISTEN_AND_SELECT', 'Nghe và chọn phản hồi đúng:', '{"audio_url": "https://cdn.example.com/audio/sayounara.mp3"}', NULL),
(10405, 104, 'TRANSLATE_TO_VN', 'Dịch: "Sumimasen, anata wa sensei desu ka?"', '{"romaji": "Sumimasen, anata wa sensei desu ka"}', NULL),
(10406, 104, 'SPEAKING', 'Giao tiếp - Đọc to câu sau:', '{"expected": "ohayou gozaimasu", "romaji": "Ohayou gozaimasu."}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(10401, 'Konnichiwa,', true, 1), (10401, 'watashi wa', true, 2), (10401, 'sensei', true, 3), (10401, 'desu.', true, 4),
(10402, 'Arigatou. Watashi wa gakusei desu.', true, 1), (10402, 'Sumimasen. Watashi wa sensei desu.', false, 2), (10402, 'Ohayou. Anata wa isha desu.', false, 3), (10402, 'Arigatou. Watashi wa isha desu.', false, 4),
(10403, 'Isha', true, 1), (10403, 'Sensei', false, 2), (10403, 'Gakusei', false, 3), (10403, 'Watashi', false, 4),
(10404, 'Tạm biệt', true, 1), (10404, 'Cảm ơn', false, 2), (10404, 'Xin chào', false, 3), (10404, 'Xin lỗi', false, 4),
(10405, 'Xin lỗi, bạn là giáo viên phải không?', true, 1), (10405, 'Cảm ơn, bạn là giáo viên.', false, 2), (10405, 'Xin chào, tôi là giáo viên.', false, 3), (10405, 'Xin lỗi, tôi là học sinh.', false, 4),
(10406, 'Ohayou gozaimasu.', true, 1);

-- BÀI 1.5: KIỂM TRA VƯỢT ẢI (6 Câu ngẫu nhiên khó hơn)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(10501, 105, 'LISTEN_AND_ARRANGE', 'Sắp xếp câu bạn vừa nghe được:', '{"audio_url": "https://cdn.example.com/audio/sumimasen_watashi_wa_isha_desu.mp3"}', NULL),
(10502, 105, 'TRANSLATE_TO_JP', 'Viết bằng romaji: "Chào buổi chiều, bạn là học sinh phải không?"', '{"hint": "Konnichiwa, ..."}', NULL),
(10503, 105, 'SELECT_IMAGE', 'Ai là "Sensei"?', '{"romaji": "sensei"}', 'https://cdn-icons-png.flaticon.com/512/1975/1975091.png'),
(10504, 105, 'TRANSLATE_TO_VN', 'Dịch nhanh: "Arigatou gozaimasu"', '{}', NULL),
(10505, 105, 'LISTEN_AND_SELECT', 'Từ nào phát âm là "Anata"?', '{"audio_url": "https://cdn.example.com/audio/anata.mp3"}', NULL),
(10506, 105, 'SPEAKING', 'Đóng vai bác sĩ, đọc câu sau:', '{"expected": "watashi wa isha desu", "romaji": "Watashi wa isha desu."}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(10501, 'Sumimasen,', true, 1), (10501, 'watashi wa', true, 2), (10501, 'isha', true, 3), (10501, 'desu.', true, 4),
(10502, 'Konnichiwa, anata wa gakusei desu ka.', true, 1), (10502, 'Ohayou, anata wa sensei desu ka.', false, 2), (10502, 'Konnichiwa, watashi wa gakusei desu.', false, 3), (10502, 'Sumimasen, anata wa isha desu.', false, 4),
(10503, 'Giáo viên', true, 1), (10503, 'Học sinh', false, 2), (10503, 'Bác sĩ', false, 3), (10503, 'Bản thân', false, 4),
(10504, 'Xin cảm ơn rất nhiều', true, 1), (10504, 'Xin lỗi', false, 2), (10504, 'Chào buổi sáng', false, 3), (10504, 'Tạm biệt', false, 4),
(10505, 'Bạn / Ngôi thứ 2', true, 1), (10505, 'Tôi / Ngôi thứ 1', false, 2), (10505, 'Bác sĩ', false, 3), (10505, 'Học sinh', false, 4),
(10506, 'Watashi wa isha desu.', true, 1);


-- ==========================================
-- 5. DỮ LIỆU TOPIC 2: MUA SẮM & SỐ ĐẾM
-- ==========================================

-- Thêm Bài học cho Topic 2
INSERT INTO lessons (id, topic_id, jlpt_level, title, order_index, lesson_type) VALUES 
(201, 2, 'N5', 'Bài 2.1: Số đếm cơ bản (1 đến 10)', 1, 'NORMAL'),
(202, 2, 'N5', 'Bài 2.2: Từ vựng Đồ vật & Thực phẩm', 2, 'NORMAL'),
(203, 2, 'N5', 'Bài 2.3: Chỉ định từ & Hỏi giá tiền (Ikura)', 3, 'NORMAL'),
(204, 2, 'N5', 'Bài 2.4: Mua sắm thực tế (...wo kudasai)', 4, 'NORMAL'),
(205, 2, 'N5', 'Bài 2.5: Kiểm tra vượt ải (Topic 2)', 5, 'JUMP_TEST');

-- BÀI 2.1: SỐ ĐẾM (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(20101, 201, 'SELECT_IMAGE', 'Chọn hình ảnh cho Số 1', '{"romaji": "ichi"}', 'https://cdn-icons-png.flaticon.com/512/3133/3133276.png'),
(20102, 201, 'SELECT_IMAGE', 'Chọn hình ảnh cho Số 3', '{"romaji": "san"}', 'https://cdn-icons-png.flaticon.com/512/3133/3133296.png'),
(20103, 201, 'LISTEN_AND_SELECT', 'Nghe và chọn số tương ứng', '{"audio_url": "https://cdn.example.com/audio/go.mp3", "romaji": "go"}', NULL),
(20104, 201, 'TRANSLATE_TO_VN', 'Dịch sang số: "Nana"', '{"romaji": "nana"}', NULL),
(20105, 201, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Số 8"', '{"hint": "H..."}', NULL),
(20106, 201, 'SPEAKING', 'Đếm các số sau (1, 2, 3):', '{"expected": "ichi ni san", "romaji": "Ichi, Ni, San"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(20101, 'Ichi', true, 1), (20101, 'Ni', false, 2), (20101, 'San', false, 3), (20101, 'Yon', false, 4),
(20102, 'San', true, 1), (20102, 'Roku', false, 2), (20102, 'Ichi', false, 3), (20102, 'Hachi', false, 4),
(20103, '5', true, 1), (20103, '4', false, 2), (20103, '2', false, 3), (20103, '9', false, 4),
(20104, '7', true, 1), (20104, '1', false, 2), (20104, '6', false, 3), (20104, '10', false, 4),
(20105, 'Hachi', true, 1), (20105, 'Kyuu', false, 2), (20105, 'Juu', false, 3), (20105, 'Roku', false, 4),
(20106, 'Ichi, Ni, San', true, 1);

-- BÀI 2.2: TỪ VỰNG ĐỒ VẬT (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(20201, 201, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Quả táo"', '{"romaji": "ringo"}', 'https://cdn-icons-png.flaticon.com/512/415/415733.png'),
(20202, 201, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Quyển sách"', '{"romaji": "hon"}', 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png'),
(20203, 201, 'LISTEN_AND_SELECT', 'Nghe và chọn đồ vật', '{"audio_url": "https://cdn.example.com/audio/niku.mp3", "romaji": "niku"}', NULL),
(20204, 201, 'TRANSLATE_TO_VN', 'Dịch sang tiếng Việt: "Mizu"', '{"romaji": "mizu"}', 'https://cdn-icons-png.flaticon.com/512/4241/4241664.png'),
(20205, 201, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Con cá"', '{"hint": "Saka..."}', NULL),
(20206, 201, 'SPEAKING', 'Đọc tên đồ vật sau: Cặp sách', '{"expected": "kaban", "romaji": "Kaban"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(20201, 'Ringo', true, 1), (20201, 'Hon', false, 2), (20201, 'Niku', false, 3), (20201, 'Mizu', false, 4),
(20202, 'Hon', true, 1), (20202, 'Kaban', false, 2), (20202, 'Sakana', false, 3), (20202, 'Ringo', false, 4),
(20203, 'Thịt', true, 1), (20203, 'Cá', false, 2), (20203, 'Nước', false, 3), (20203, 'Sách', false, 4),
(20204, 'Nước', true, 1), (20204, 'Thịt', false, 2), (20204, 'Cặp sách', false, 3), (20204, 'Táo', false, 4),
(20205, 'Sakana', true, 1), (20205, 'Niku', false, 2), (20205, 'Mizu', false, 3), (20205, 'Hon', false, 4),
(20206, 'Kaban', true, 1);

-- BÀI 2.3: CHỈ ĐỊNH TỪ & GIÁ TIỀN (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(20301, 203, 'TRANSLATE_TO_VN', 'Dịch từ sau: "Kore"', '{"romaji": "kore"}', NULL),
(20302, 203, 'TRANSLATE_TO_VN', 'Dịch từ sau: "Sore"', '{"romaji": "sore"}', NULL),
(20303, 203, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Bao nhiêu tiền?"', '{"hint": "Ikura..."}', NULL),
(20304, 203, 'LISTEN_AND_ARRANGE', 'Nghe và sắp xếp câu: "Cái này bao nhiêu tiền?"', '{"audio_url": "https://cdn.example.com/audio/kore_wa_ikura_desuka.mp3"}', NULL),
(20305, 203, 'TRANSLATE_TO_JP', 'Dịch sang tiếng Nhật: "Cái đó bao nhiêu tiền?"', '{"hint": "Sore wa..."}', NULL),
(20306, 203, 'SPEAKING', 'Hỏi giá món đồ ở xa:', '{"expected": "are wa ikura desu ka", "romaji": "Are wa ikura desu ka?"}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(20301, 'Cái này (Gần người nói)', true, 1), (20301, 'Cái đó (Gần người nghe)', false, 2), (20301, 'Cái kia (Xa cả 2)', false, 3), (20301, 'Cái nào', false, 4),
(20302, 'Cái đó (Gần người nghe)', true, 1), (20302, 'Cái này (Gần người nói)', false, 2), (20302, 'Cái kia (Xa cả 2)', false, 3), (20302, 'Bao nhiêu', false, 4),
(20303, 'Ikura desu ka?', true, 1), (20303, 'Kore desu ka?', false, 2), (20303, 'Sore desu ka?', false, 3), (20303, 'Are desu ka?', false, 4),
(20304, 'Kore', true, 1), (20304, 'wa', true, 2), (20304, 'ikura', true, 3), (20304, 'desu ka?', true, 4),
(20305, 'Sore wa ikura desu ka.', true, 1), (20305, 'Kore wa ikura desu ka.', false, 2), (20305, 'Are wa ikura desu ka.', false, 3), (20305, 'Sore wa hon desu.', false, 4),
(20306, 'Are wa ikura desu ka.', true, 1);

-- BÀI 2.4: MUA SẮM THỰC TẾ (6 Câu)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(20401, 204, 'TRANSLATE_TO_VN', 'Dịch câu: "Kore wa 100 yen desu."', '{"romaji": "kore wa hyaku yen desu"}', NULL),
(20402, 204, 'TRANSLATE_TO_JP', 'Dịch: "Quả táo này bao nhiêu tiền?"', '{"hint": "Kono ringo wa..."}', NULL),
(20403, 204, 'TRANSLATE_TO_VN', 'Dịch câu mua hàng: "Ringo wo kudasai."', '{"romaji": "ringo wo kudasai"}', NULL),
(20404, 204, 'LISTEN_AND_ARRANGE', 'Nghe và sắp xếp câu: "Cho tôi quyển sách."', '{"audio_url": "https://cdn.example.com/audio/hon_wo_kudasai.mp3"}', NULL),
(20405, 204, 'LISTEN_AND_SELECT', 'Nghe khách hàng đang muốn mua gì?', '{"audio_url": "https://cdn.example.com/audio/mizu_wo_kudasai.mp3"}', NULL),
(20406, 204, 'SPEAKING', 'Đọc yêu cầu mua thịt:', '{"expected": "niku wo kudasai", "romaji": "Niku wo kudasai."}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(20401, 'Cái này 100 yên.', true, 1), (20401, 'Cái đó 100 yên.', false, 2), (20401, 'Cái này 10 yên.', false, 3), (20401, 'Quyển sách này 100 yên.', false, 4),
(20402, 'Kono ringo wa ikura desu ka.', true, 1), (20402, 'Kore ringo wa ikura desu ka.', false, 2), (20402, 'Sono ringo wa ikura desu ka.', false, 3), (20402, 'Ano ringo wa ikura desu ka.', false, 4),
(20403, 'Vui lòng cho tôi táo.', true, 1), (20403, 'Vui lòng cho tôi sách.', false, 2), (20403, 'Vui lòng cho tôi nước.', false, 3), (20403, 'Táo thì bao nhiêu tiền?', false, 4),
(20404, 'Hon', true, 1), (20404, 'wo', true, 2), (20404, 'kuda', true, 3), (20404, 'sai.', true, 4),
(20405, 'Nước', true, 1), (20405, 'Cá', false, 2), (20405, 'Thịt', false, 3), (20405, 'Cặp sách', false, 4),
(20406, 'Niku wo kudasai.', true, 1);

-- BÀI 2.5: KIỂM TRA VƯỢT ẢI (6 Câu ngẫu nhiên)
INSERT INTO lesson_questions (id, lesson_id, question_type, question_text, metadata_json, image_url) VALUES 
(20501, 205, 'LISTEN_AND_ARRANGE', 'Sắp xếp lại câu bạn nghe được:', '{"audio_url": "https://cdn.example.com/audio/sono_hon_wa_ikura_desuka.mp3"}', NULL),
(20502, 205, 'TRANSLATE_TO_JP', 'Viết câu: "Vui lòng cho tôi cái này."', '{"hint": "Kore wo..."}', NULL),
(20503, 205, 'SELECT_IMAGE', 'Chọn hình ảnh cho "Cá"', '{"romaji": "sakana"}', 'https://cdn-icons-png.flaticon.com/512/3067/3067253.png'),
(20504, 205, 'TRANSLATE_TO_VN', 'Dịch: "Are wa 8 yen desu."', '{"romaji": "Are wa hachi yen desu"}', NULL),
(20505, 205, 'LISTEN_AND_SELECT', 'Từ này có nghĩa là gì?', '{"audio_url": "https://cdn.example.com/audio/kaban.mp3"}', NULL),
(20506, 205, 'SPEAKING', 'Đọc to yêu cầu:', '{"expected": "mizu wo kudasai", "romaji": "Mizu wo kudasai."}', NULL);

INSERT INTO lesson_question_options (question_id, option_text, is_correct, order_index) VALUES 
(20501, 'Sono', true, 1), (20501, 'hon wa', true, 2), (20501, 'ikura', true, 3), (20501, 'desu ka?', true, 4),
(20502, 'Kore wo kudasai.', true, 1), (20502, 'Sore wo kudasai.', false, 2), (20502, 'Kore wa ikura desu ka.', false, 3), (20502, 'Are wo kudasai.', false, 4),
(20503, 'Sakana', true, 1), (20503, 'Niku', false, 2), (20503, 'Ringo', false, 3), (20503, 'Hon', false, 4),
(20504, 'Cái kia là 8 yên.', true, 1), (20504, 'Cái này là 8 yên.', false, 2), (20504, 'Cái đó là 7 yên.', false, 3), (20504, 'Cái kia là 4 yên.', false, 4),
(20505, 'Cặp sách', true, 1), (20505, 'Sách', false, 2), (20505, 'Nước', false, 3), (20505, 'Thịt', false, 4),
(20506, 'Mizu wo kudasai.', true, 1);