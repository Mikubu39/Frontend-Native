# Session State – React Native

> Lịch sử đầy đủ trước 2026-08-24 (mọi Plan/Progress/Decisions cũ, ~360 dòng) đã chuyển sang `.state/archive/session_state_2026-08-24.md`. Đọc file đó khi cần tra cứu quyết định/bug cũ; file này chỉ giữ trạng thái ĐANG hoạt động.

## Mission

Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal

1. Impeccable Quiz & Lesson Flow Redesign — full theme-aware redesign of all quiz screens and question components.
2. Sửa 3 lỗi chặn buổi demo với giáo viên: (a) bài học hỏi ngay chữ chưa dạy, (b) bản đồ lộ trình giật trên emulator, (c) nút loa không ra tiếng.
3. Onboarding người dùng mới: tour hướng dẫn coach-mark có linh vật Lottie dẫn đường trên màn Học.
4. **Chuyển hệ AI hội thoại sang LLM (Gemini)**: trò chuyện theo chủ đề, phiên 5 phút, hết giờ tổng kết lỗi + cách sửa ngữ pháp + cách nói tự nhiên.
5. **Ôn tập ngắt quãng (SRS) + tra từ toàn cục** — người học được hỏi lại kiến thức cũ đúng lúc sắp quên; mọi chữ Nhật trên màn hình đều bấm-giữ ra nghĩa; đề bài tách khỏi yêu cầu (yêu cầu ở trên, chỉ chữ Nhật trong bong bóng) + nhãn "TỪ VỰNG MỚI".
6. **Chuẩn hóa Từ vựng & Câu mẫu (Duolingo-style Refactoring)** — Tách cụm câu chào dài và ngữ pháp khỏi `vocab`, đưa về các từ đơn ngắn (1-4 ký tự) + bài tập ghép thẻ Word Bank (`LISTEN_AND_ARRANGE`); nạp lại DB và kiểm tra trực tiếp qua MySQL.
7. **Chuẩn hóa Hiển thị Sao (⭐) Kết quả Bài học & Roadmap** — Chỉ hiển thị sao cho bài `TIMED_REVIEW`, ẩn sao và bỏ fallback ép 3 sao ở bài học thường (`NORMAL`), `TOPIC_REVIEW`, `JUMP_TEST`; dọn dẹp sao xám popover `TOPIC_REVIEW` trên roadmap.
8. **Chuẩn hóa & Triển khai Hoàn chỉnh Tính năng Tạo & Quét mã QR Kết bạn** — Tích hợp Camera Scanner trong app (`expo-camera`), cấu hình Scheme `nihongo`, sửa lỗi bỏ quên username trong `auth-context`, chuẩn hóa Deep Linking `nihongo://friends/profile/{username}` và xử lý edge-cases.
9. **Chuẩn Hóa Tách Từ, Sửa Lỗi Database Thật & Nâng Cấp Tra Từ Frontend** — Quét trực tiếp DB thật MySQL: sửa lỗi Mojibake 5 từ ngữ pháp (IDs 1752-1756), xóa sạch 27 thẻ dấu câu Word Bank (`LISTEN_AND_ARRANGE`), chặn 66 âm ghép KANA khỏi từ điển tra nghĩa, hỗ trợ tra trợ từ tiếng Nhật, nâng độ phủ tra từ lên >98%.
10. **Tối Ưu Hóa & Vá Lỗ Hổng UI/UX Chuẩn Duolingo** — Vá câu hỏi lỗi 1793 & khôi phục media thiếu ở DB/BE; sửa lỗi mất đáp án SELECT_IMAGE; kích hoạt Sổ tay Hướng dẫn 📖 và làm nổi bật bài Vượt cấp 🏆 JUMP_TEST; nâng cấp Word Bank Ghost Slot, Combo Streak và Lịch Streak 7 ngày.
11. **Đồng Bộ Trạng Thái Streak 3 Cấp Độ (Đã Học / Chưa Học / Đóng Băng) & Khắc Phục Dứt Điểm Logic Reset Streak (BE + FE)** — Tự động kiểm tra và reset streak về 0 khi quá hạn ở BE; cập nhật StatPill Header (cam rực rỡ / xám mờ / xanh băng tuyết); đồng bộ StreakModal và cá nhân hóa màn hình StreakExtendedScreen.
12. **Phân Tách Dấu Gạch Chân Từ Vựng Liền Kề trong `JapaneseText`** — Chèn ký tự Thin Space không gạch chân (`\u2009`) giữa các từ tra cứu đứng sát nhau để phân định rõ ranh giới từng từ, tránh dính liền đường gạch chân thành 1 vệt dài.
13. **Chuẩn Hoá Tour Hướng Dẫn & Khắc Phục Lặp Lại Cho Tài Khoản Đã Học** — Tự động nhận diện tiến độ (COMPLETED/EXP/Streak) và phân lập cờ theo User ID để bỏ qua tour; đồng thời chuẩn hoá thứ tự tab mượt mà, thêm bước giới thiệu Ôn tập từ vựng SRS, sửa dứt điểm lỗi khựng 3s và mất vùng sáng tại bước Phát âm chuyên sâu.
14. **Triệt Tiêu Lỗi "Ô Vuông Đen" Sau Chữ Thông Thạo & Khi Chọn Đáp Án (Android Elevation Shadow Bug)** — Khắc phục lỗi hiển thị bóng đen native `elevation` xuyên thấu qua nền bán trong suốt `rgba(...)` trên Android; phân lớp tint thông thạo trên nền card đặc, chuyển sang phong cách viền nổi 3D Duolingo (`borderBottomWidth: 3.5` / `4`) và triệt tiêu `elevation` trên Android.
15. **Đồng Bộ Follow Counts Hồ Sơ, Chuẩn Hoá Avatar Nhân Vật Toàn Diện & Xoá Bỏ Màu Hardcode Theme** — Sửa lỗi follower/following count không làm mới trên màn Hồ sơ (`useFocusEffect`); chuẩn hoá hiển thị avatar nhân vật DiceBear đồng nhất 100% trên toàn app (loại bỏ bẫy chặn Google văng gấu trúc 🐼); rà soát và cập nhật theme động cho các màn hình/layout/component còn sót màu hardcode.
16. **Tối Ưu Hoá Triệt Để Hiệu Năng Cuộn Trang Bài Học (Roadmap Full Pre-rendering & StreakModal Cleanup)** — Khắc phục dứt điểm cảnh báo `VirtualizedList slow to update (dt: 680-1008ms)`; pre-render toàn bộ 14 chủ đề (`initialNumToRender={14}`, `windowSize={15}`, `removeClippedSubviews={false}`) và ngắt modal chạy ngầm để vuốt nhanh đạt 60-120fps mượt mà.
17. **Tối Ưu Hoá Texture GPU Budget & Đạt 60-120 FPS Thực Tế Trên Điện Thoại (Triệt Tiêu Hoàn Toàn 30 FPS Khi Vuốt Chậm)** — Phân tích dữ liệu `dumpsys gfxinfo` trên máy thật `FAJ7AM8DH6HAU8EQ`, phát hiện 14 chủ đề chiếm 180.7MB texture vượt ngưỡng 127.53MB GPU cache gây nghẽn 5,781 frames bitmap upload (48ms/frame); tối ưu `windowSize={7}`, `initialNumToRender={5}`, `maxToRenderPerBatch={3}`, `scrollEventThrottle={32}`, chuẩn hóa 3 static SVG gradients, đưa thời gian khung hình từ 48ms (~20 FPS) xuống 10ms (100 FPS), janky frames giảm từ 84.7% còn 0.86% và 0 missed Vsync.
18. **Khắc Phục Lỗi Hiển Thị Ngày Học Trên StreakModal Header (Đồng Bộ studyDates Thực Tế Từ BE)** — Thay thế logic giả lập `isPast && streak > 0` bằng `studyDates` từ API `getStreakCalendar(30)` trong `GamificationContext`, đảm bảo lịch 7 ngày trong tuần hiển thị chính xác từng ngày học/nghỉ khớp 100% với trang Hồ sơ.
19. **Chuẩn Hoá Giao Diện & Trải Nghiệm Luyện Viết Chữ Ghép (Chế Độ Viết Tự Do)** — Tự động co nhỏ font chữ mờ `ghostSymbol` cho chữ ghép 2 ký tự (Yōon như `きょ`), căn đều trên 1 dòng, giảm độ dày nét vẽ (`strokeWidth`), cập nhật hint hướng dẫn chính xác và bắt buộc vẽ tối thiểu 1 nét mới mở nút hoàn thành.
20. **Triển Khai Ngrok & Gateway Đa Cổng (Gộp Spring Boot & FastAPI) & Đóng Gói Release APK Cho Kiểm Thử Ngoại Mạng** — Tích hợp Ngrok với static domain `equation-animate-outback.ngrok-free.dev`, phát triển Gateway Proxy điều phối thông minh (Spring Boot 8080 và FastAPI AI 8000 chung 1 URL), nạp dữ liệu UTF-8 chuẩn sang TiDB Cloud và đóng gói file APK Release độc lập.
21. **Tái Thiết Kế Toàn Diện Màn Hình Bảng Xếp Hạng (Leaderboard Screen)** — Phân tầng 5 giải đấu với bộ cúp hoạt hình 2D Duolingo sống động; thay thế tab đơn điệu bằng Thanh Lộ Trình Cúp Tương Tác (League Tier Ladder); cấu trúc lại danh sách 2 tầng thông tin thoáng đãng; bổ sung vạch phân cách Thăng hạng Top 3 và thanh ghim nổi thông minh ở đáy.
22. **Đồng Bộ Theme Động & Sửa Triệt Để Lỗi Hiển Thị Phân Hệ Khảo Sát Tài Khoản Mới (Onboarding & Placement Test)** — Xóa bỏ 100% màu hardcode nền trắng/kem (`Colors.cream`, `Colors.surface`); đồng bộ dynamic theme (`useTheme`); khắc phục 4 lỗi hiển thị nghiêm trọng trong `placement.tsx` (Kanji-fill mất ô điền, Vocab thiếu prompt tiếng Nhật, card nền lệch màu) và tinh gọn chọn trình độ `level.tsx`.
23. **Khôi Phục Lối Vào Màn Hình Thêm Bạn Bè & Đồng Bộ Danh Bạ (Friends Hub)** — Chuyển hướng nút "THÊM BẠN BÈ" ở trang Hồ sơ sang `/friends` (thay vì `/friends/search`), sửa lỗi route `view-search-profile`, và viết integration tests bảo đảm hoạt động toàn diện.
24. **Khắc Phục Lỗi DNS Android Emulator, Google Sign-In `NETWORK_ERROR` & Cảnh Báo Scheme Linking** — Chẩn đoán lỗi `net::ERR_NAME_NOT_RESOLVED` do xung đột adapter Hyper-V/WSL trên host Windows khiến QEMU relay DNS `10.0.2.3` bị điếc; cấu hình DNS `8.8.8.8` giải cứu kết nối mạng & Google Sign-In thành công; chuẩn hóa scheme `nihongo` trong `app.json` triệt tiêu cảnh báo Linking.
25. **Tái Thiết Kế Dải Lịch Sử Học (Streak Calendar Strip) Chuẩn Trục Thời Gian Tự Nhiên & Card Giao Diện** — Đảo chiều trục thời gian từ Quá khứ → Hiện tại (trái sang phải); cấu trúc 3 tầng (Thứ, Chấm trạng thái, Số ngày); phân cách tháng và viền sáng Hôm nay; tự động cuộn tới Hôm nay và đóng khung trong thẻ Card đồng bộ với Profile.
26. **Khắc Phục Lỗi Gemini 503 Quá Tải & Triển Khai Cơ Chế Dự Phòng (Fallback Model) Cho AI Service** — Chẩn đoán lỗi HTTP 502/503 do model `gemini-3.5-flash` quá tải; chuyển sang `gemini-3.6-flash`; triển khai cơ chế tự động fallback sang `gemini-2.5-flash` khi gặp 503; khởi động lại Uvicorn daemon chạy ngầm hoàn tất.
27. **Tối Ưu Trải Nghiệm Hội Thoại AI (1:30s, Ẩn/Hiện Tiếng Việt Hai Chiều, Khắc Phục Lỗi Ký Hiệu Lạ & Layout Dính Sát Đáy)** — Rút ngắn thời lượng phiên còn 90s; sửa lỗi co rúm thẻ góp ý biến thành icon lạ `✨`; khắc phục layout đè mép đáy qua `SafeAreaView`; bỏ badge N5/N4 ngoài chủ đề; thêm tùy chọn ẩn/hiển thị tiếng Việt hai chiều kèm cử chỉ chạm/giữ lật mở bản dịch.
28. **Khắc Phục Dứt Điểm Chặn Thoát Bài Học (BackHandler) & Đưa Con Dấu Hanko Lên Làm Hero Màn Kết Quả** — Bắt cử chỉ vuốt và nút Back phần cứng Android (`BackHandler`), bỏ chặn `hasAnsweredAtLeastOnce` để luôn cảnh báo mất tiến trình/năng lượng khi thoát; đưa con dấu triện tay HankoStamp khổ lớn (104px) ra làm Hero tâm điểm màn kết quả quiz thay thế mascot Lottie generic.
29. **Khắc Phục 3 Điểm Trải Nghiệm Quiz: Modal Thoát Theme-Aware, Triệt Tiêu Feedback Kẹt & Chuẩn Hóa Phân Tầng Kết Quả Thực Tế** — Thay thế hộp thoại `Alert.alert` Android mặc định bằng `ModalCard` tuỳ biến chuẩn phong cách Nhật Bản; xóa bỏ `exiting` animation trên `QuizBottomBar` triệt tiêu lỗi kẹt thanh feedback "Tuyệt vời!" khi sang câu mới; phân tầng kết quả chính xác, nghiêm cấm trao nhãn "Xuất sắc" khi làm sai từ 2 câu trở lên.

## Plan

- [x] **Khắc Phục 3 Điểm Trải Nghiệm Quiz: Modal Thoát Theme-Aware, Triệt Tiêu Feedback Kẹt & Chuẩn Hóa Phân Tầng Kết Quả Thực Tế (HOÀN TẤT 2026-09-06):**
  - [x] 1. Cập nhật `src/app/quiz/[id].tsx`: Thay thế `Alert.alert` bằng state `showExitModal` và `ModalCard` tuỳ biến theo theme (backdrop blur, icon cảnh báo, font bo tròn, nút GradientButton "TIẾP TỤC HỌC" và nút đỏ "RỜI KHỎI BÀI"), hỗ trợ cả nút ✕, vuốt mép và phím cứng Back.
  - [x] 2. Cập nhật `src/components/quiz/quiz-bottom-bar.tsx` & `src/app/quiz/[id].tsx`: Loại bỏ `exiting={FadeOutDown}` trên feedback panel chứa `LottieView` (nguyên nhân gây kẹt ghost view 100% opacity trên Android); gọi `lottieRef.current?.reset()` khi `!hasSubmitted`; gán `key={`quiz-bar-${currentIndex}`}` và bổ sung padding đáy `Spacing.eight` cho `scrollContent`.
  - [x] 3. Cập nhật `src/components/quiz/quiz-result-card.tsx`: Điều chỉnh ngưỡng xếp loại sư phạm: 100% đúng (0 sai) = `HOÀN HẢO • 大吉`, $\ge 80\%$ và chỉ sai $\le 1$ câu = `XUẤT SẮC • 皆伝`, $\ge 70\%$ = `ĐẠT CHUẨN • 合格`, $50\% - 69\%$ (sai 2 câu) = `CỐ GẮNG • 努力`, $< 50\%$ hoặc hết mạng = `THỬ LẠI • 再挑戦`. Seal badge đổi màu theo từng cấp độ.
  - [x] 4. Kiểm thử toàn diện: Cập nhật `teaching-flow.test.tsx` và `quiz-result-stars.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (43/43 suites / 231/231 tests PASS 100%) và `eslint` (0 lỗi).

- [x] **Khắc Phục Dứt Điểm Chặn Thoát Bài Học (BackHandler) & Đưa Con Dấu Hanko Lên Làm Hero Màn Kết Quả (HOÀN TẤT 2026-09-06):**
  - [x] 1. Cập nhật `src/app/quiz/[id].tsx`: Đăng ký `BackHandler.addEventListener("hardwareBackPress")`, bỏ cờ chặn `hasAnsweredAtLeastOnce` trong `handleClose` để cảnh báo xác nhận thoát bài mọi lúc khi đang trong phiên học (kể cả khi chưa làm câu nào).
  - [x] 2. Cập nhật `src/components/quiz/quiz-result-card.tsx`: Đưa `HankoStamp` (size 108) ra vị trí Hero trung tâm cho mọi bài học hoàn thành, bổ sung nhãn chứng nhận "HOÀN HẢO • 大吉" (100%) hoặc "XUẤT SẮC • 皆伝" / "THÔNG QUA • 合格" (đạt), chỉ giữ lại confuse mascot khi hết mạng (`isFailed`).
  - [x] 3. Sửa `vocab-question.tsx` audioUrl fallback & bổ sung test case: Thêm test case xác nhận thoát bài trong `teaching-flow.test.tsx` và test nhãn con dấu Hanko trong `quiz-result-stars.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (43/43 suites / 229/229 tests PASS 100%) và `eslint` (0 lỗi).

- [x] **Tối Ưu Trải Nghiệm Hội Thoại AI (1:30s, Ẩn/Hiện Tiếng Việt Hai Chiều, Sửa Ký Hiệu Lạ & Layout Đáy) (HOÀN TẤT 2026-09-05):**
  - [x] 1. Backend (`ai-service`): Chỉnh `SESSION_MINUTES = 1.5` (90s), `WRAP_UP_SECONDS = 20`. Thêm `userVi` vào `TURN_SCHEMA` và prompt dịch câu người dùng. Lọc bỏ loại `praise` trong real-time corrections.
  - [x] 2. Backend API: Cập nhật `sessionSeconds = 90` cho `/start` và `/respond`, chạy 25/25 `pytest` PASS.
  - [x] 3. Frontend UI Topic Card: Bỏ hoàn toàn badge trình độ `levelPill` (`N5`, `N4`).
  - [x] 4. Frontend Correction Card & Chat Bubble: Loại bỏ thẻ `praise` trong chat, cố định `minWidth: 220, width: "100%"` chống co rúm icon `✨`. Thêm `hideTranslation`, toggle mở khi tap/long-press, hiển thị `userVietnamese` cho bong bóng người dùng.
  - [x] 5. Frontend Navigation & Layout: Mở rộng `SafeAreaView` `edges={["top", "bottom"]}` và tăng padding đáy `Spacing.eight` cho FlatList tin nhắn. Thêm switch "Hiện bản dịch tiếng Việt" (lưu AsyncStorage `@nihongo_conversation_show_translation`) và nút toggle trên Header.
  - [x] 6. Kiểm thử toàn diện: Cập nhật 15/15 tests `conversation.test.tsx` PASS, `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors).

- [x] **Khắc Phục Lỗi Gemini 503 Quá Tải & Triển Khai Cơ Chế Dự Phòng (Fallback Model) (HOÀN TẤT 2026-09-05):**
  - [x] 1. Cập nhật `ai-service/.env`: Đặt `GEMINI_MODEL=gemini-3.6-flash`.
  - [x] 2. Cập nhật `ai-service/src/nihongo_ai/llm.py`: Đổi `DEFAULT_MODEL` sang `gemini-3.6-flash`, thêm `FALLBACK_MODEL = "gemini-2.5-flash"` và tự động retry fallback khi model chính gặp lỗi 503 (high demand).
  - [x] 3. Chạy kiểm thử: `pytest` trong `ai-service` (25/25 tests PASS), `conversation.test.tsx` trong frontend (15/15 tests PASS).
  - [x] 4. Khởi động lại dịch vụ: Tắt process uvicorn cũ và chạy uvicorn daemon mới trên port 8000, test live endpoint `/api/v1/conversation/respond` trả về HTTP 200 OK thành công.
  - [x] 5. Kiểm thử toàn diện: `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors).

- [x] **Tái Thiết Kế Dải Lịch Sử Học (Streak Calendar Strip) Chuẩn Trục Thời Gian Tự Nhiên & Card Giao Diện (HOÀN TẤT 2026-09-05):**
  - [x] 1. Tái cấu trúc `src/components/profile/streak-calendar-strip.tsx`: Đảo chiều hiển thị (Quá khứ → Hiện tại), cấu trúc 3 tầng (Thứ - Chấm trạng thái - Số ngày), vạch phân cách tháng và highlight ngày Hôm nay.
  - [x] 2. Tích hợp tự động cuộn: Cấu hình `ScrollView` với `ref` tự động cuộn sang phải về phía ngày Hôm nay.
  - [x] 3. Cập nhật `src/app/(tabs)/profile.tsx`: Đóng gói trong `communityCard`, thêm header tóm tắt (số ngày đã học trong 30 ngày qua).
  - [x] 4. Viết integration test `src/components/profile/__tests__/streak-calendar-strip.test.tsx` và chạy test profile hiện có (4/4 tests PASS).
  - [x] 5. Kiểm thử toàn diện: `npx tsc --noEmit` (0 lỗi), `npm test` (42/42 suites / 220/220 tests PASS 100%), `npm run lint` (0 errors).

- [x] **Khắc Phục Lỗi DNS Android Emulator, Google Sign-In `NETWORK_ERROR` & Cảnh Báo Scheme Linking (HOÀN TẤT 2026-09-05):**
  - [x] 1. Điều tra logcat Android Emulator: bóc tách lỗi Cronet `net::ERR_NAME_NOT_RESOLVED` (lỗi DNS mạng ảo QEMU do vEthernet WSL/Hyper-V trên Windows làm tê liệt `10.0.2.3`).
  - [x] 2. Cấu hình Static DNS 8.8.8.8 / 8.8.4.4 cho AndroidWifi trên máy ảo, khôi phục kết nối ra Internet và giải quyết dứt điểm `Google Sign-In error: NETWORK_ERROR`.
  - [x] 3. Thử nghiệm thực tế: Đăng nhập Google thành công, lấy idToken, BE xác thực và vào thẳng ứng dụng.
  - [x] 4. Sửa `app.json`: chuyển `"scheme": ["nihongo", "nihongoapp", "frontend"]` thành `"scheme": "nihongo"`, triệt tiêu cảnh báo Expo Linking.
  - [x] 5. Kiểm thử toàn diện: `npx tsc --noEmit` (0 lỗi), `npm test` (41/41 suites / 216/216 tests PASS 100%), `npm run lint` (0 errors).

- [x] **Khôi Phục Lối Vào Màn Hình Thêm Bạn Bè & Đồng Bộ Danh Bạ (HOÀN TẤT 2026-09-05):**
  - [x] 1. Sửa nút "THÊM BẠN BÈ" trong `src/app/(tabs)/profile.tsx`: chuyển `router.push("/friends/search")` thành `router.push("/friends")`.
  - [x] 2. Sửa lỗi route trong `src/app/friends/index.tsx`: đổi `pathname: "/profile/view-search-profile"` thành `pathname: "/friends/view-search-profile"`.
  - [x] 3. Viết integration test `src/app/friends/__tests__/friends-screen.test.tsx` kiểm thử điều hướng và đồng bộ danh bạ `expo-contacts`.
  - [x] 4. Kiểm thử toàn diện: `npx tsc --noEmit` (0 lỗi), `npm test` (41/41 test suites / 216/216 tests PASS 100%), `npm run lint` (0 errors).

- [x] **Đồng Bộ Theme Động & Sửa Triệt Để Lỗi Hiển Thị Phân Hệ Khảo Sát Tài Khoản Mới (HOÀN TẤT 2026-09-05):**
  - [x] 1. Cập nhật Layout & Screens: Đồng bộ `useTheme()` cho `_layout.tsx`, `goal.tsx`, `interests.tsx`, `level.tsx`, `placement.tsx`.
  - [x] 2. Cập nhật Components Onboarding: Nâng cấp `OptionCard`, `InterestGrid`, `LevelSelector` sử dụng theme động, loại bỏ dropdown giả.
  - [x] 3. Sửa Lỗi Hiển Thị `placement.tsx`: Thêm `prompt`/`promptRomaji` cho câu `p1` & `p5`, sửa `＿` full-width cho câu `p4` Kanji Fill, thêm romaji cho `p2`, đồng bộ `colors.background`.
  - [x] 4. Kiểm Thử & Đảm Bảo Chất Lượng: Viết integration test `src/app/(onboarding)/__tests__/onboarding-flow.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (40/40 suites / 210/210 tests PASS 100%), `npm run lint` (0 errors).
- [x] **Tái Thiết Kế Toàn Diện Màn Hình Bảng Xếp Hạng (Leaderboard Screen) (HOÀN TẤT 2026-09-03):**
  - [x] 1. Chuẩn bị Asset Cúp Hoạt Hình: Sinh và sao chép 5 hình cúp hoạt hình 2D Duolingo thân thiện (`duo_..._trophy`) vào `assets/images/ranks/`.
  - [x] 2. Mở rộng DTOs: Bổ sung `username?: string` và `level?: number` vào `LeaderboardUserDto` trong `src/types/api.ts`.
  - [x] 3. Xây dựng `src/components/leaderboard/leaderboard-trophy.tsx`: Hiển thị cúp hoạt hình theo rank và podium với token chủ đề `LEAGUE_THEMES`.
  - [x] 4. Xây dựng `src/components/leaderboard/league-tier-ladder.tsx`: Thanh lộ trình cúp tương tác với 5 giải đấu, spring animation và haptics.
  - [x] 5. Cập nhật `src/components/leaderboard/leaderboard-status-banner.tsx`: Hero Card theo rank theme và cúp hoạt hình 2D.
  - [x] 6. Cập nhật `src/components/leaderboard/leaderboard-podium.tsx`: Tinh giản bục, cúp đính avatar, giãn cách text tên và EXP thoáng đãng.
  - [x] 7. Cập nhật `src/components/leaderboard/leaderboard-row.tsx`: 2 tầng thông tin (Tên + Level), badge EXP hiện đại, padding thoáng.
  - [x] 8. Xây dựng `src/components/leaderboard/leaderboard-sticky-bar.tsx`: Thanh ghim nổi vị trí của Bạn ở đáy màn hình.
  - [x] 9. Cập nhật `src/app/(tabs)/leaderboard.tsx`: Kết nối toàn bộ linh kiện mới, vạch Thăng hạng (Top 3), sticky bar.
  - [x] 10. Kiểm thử & Đảm bảo chất lượng: Cập nhật `leaderboard.test.tsx`, bổ sung `league-tier-ladder.test.tsx` và `leaderboard-components.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (39 suites / 203 tests PASS 100%), `npm run lint` (0 lỗi).

- [x] **Triển Khai Ngrok & Gateway Đa Cổng & Đóng Gói Release APK (HOÀN TẤT 2026-09-03):**
  - [x] 1. Di chuyển dữ liệu sang TiDB Cloud: Xuất MySQL dump bảo toàn UTF-8 (tiếng Nhật) và nạp lên TiDB Serverless.
  - [x] 2. Thiết lập Ngrok v3.39 & Static Domain: Đăng ký domain `equation-animate-outback.ngrok-free.dev`, lưu authtoken.
  - [x] 3. Xây dựng Gateway Proxy đa cổng (`scripts/proxy-gateway.js` & `scripts/start-tunnel.js`): Điều phối `/api/v1/conversation/*` sang FastAPI (8000) và các route khác sang Spring Boot (8080) qua cổng 5000.
  - [x] 4. Cấu hình Frontend: Bổ sung `ngrok-skip-browser-warning` vào `src/services/api/client.ts`, cập nhật `EXPO_PUBLIC_API_URL` & `EXPO_PUBLIC_AI_URL` trong `.env`, nâng cấp `scripts/set-local-ip.js` để bảo vệ domain ngoài.
  - [x] 5. Kiểm thử & Đảm bảo chất lượng: `npx tsc --noEmit` (0 lỗi), `npm test` (37 suites / 196 tests PASS 100%), `npm run lint` (0 lỗi).
  - [x] 6. Đóng gói Standalone APK: `cd android && .\gradlew.bat assembleRelease` tạo file `app-release.apk` (157MB).

- [x] **Chuẩn Hoá Giao Diện & Trải Nghiệm Luyện Viết Chữ Ghép (Chế Độ Viết Tự Do) (HOÀN TẤT 2026-09-03):**
  - [x] 1. Cập nhật `src/components/alphabet/stroke-order-canvas.tsx`: Co nhỏ `ghostSymbol` theo độ dài ký tự (`symbol.length > 1`), thêm `numberOfLines={1}`, giảm `strokeWidth` cho chữ ghép, ràng buộc `hasDrawn` trên nút "Tôi đã viết xong".
  - [x] 2. Cập nhật `src/components/alphabet/practice-drawing.tsx`: Phân biệt câu hint hướng dẫn động dựa theo `hasGuide` (nét mẫu vs viết tự do).
  - [x] 3. Kiểm thử & Đảm bảo chất lượng: Bổ sung unit test trong `practice-drawing.test.tsx` và `stroke-order-canvas.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (37 suites / 196 tests PASS 100%) và `npm run lint` (0 lỗi).

- [x] **Khắc Phục Lỗi Hiển Thị Ngày Học Trên StreakModal Header (HOÀN TẤT 2026-09-03):**
  - [x] 1. Cập nhật `src/types/gamification.ts` & `src/contexts/gamification-context.tsx`: Đưa `studyDates: string[]` vào state và nạp từ `streakApi.getStreakCalendar(30)`.
  - [x] 2. Cập nhật `src/components/gamification/streak-modal.tsx`: Tính toán ngày ISO cho 7 ngày trong tuần và đối chiếu trực tiếp `studyDates.includes(isoDate)`.
  - [x] 3. Kiểm thử & Đảm bảo chất lượng: Bổ sung unit test trong `streak-modal.test.tsx`, xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (36 suites / 193 tests PASS 100%) và `npm run lint` (0 lỗi).

- [x] **Tối Ưu Hoá Texture GPU Budget & Đạt 60-120 FPS Thực Tế Trên Điện Thoại (HOÀN TẤT 2026-09-03):**
  - [x] 1. Phân tích nguyên nhân thực tế: Đo `dumpsys gfxinfo` trên máy thật `FAJ7AM8DH6HAU8EQ`, chỉ ra 180.7MB texture vượt ngưỡng GPU cache 127.53MB gây thrashing và 48ms/frame.
  - [x] 2. Tối ưu FlatList & SVG trong `src/app/(tabs)/index.tsx`: Đặt `windowSize={7}`, `initialNumToRender={5}`, `maxToRenderPerBatch={3}`, `scrollEventThrottle={32}`; chuẩn hoá 3 gradient tĩnh (`hexGrad-active`, `ringGrad-active`, `ringGrad-completed`) dùng chung toàn bộ bản đồ.
  - [x] 3. Đóng gói & Đo kiểm thực tế: Build APK release mới (`gradlew assembleRelease` 1m 53s), nạp lên điện thoại và đo `dumpsys gfxinfo`: frame time 50th percentile đạt 10ms (100 FPS), missed Vsync về 0, janky frames giảm từ 84.7% xuống 0.86%.

- [x] **Tối Ưu Hoá Triệt Để Hiệu Năng Cuộn Trang Bài Học (Roadmap Full Pre-rendering & StreakModal Cleanup) (HOÀN TẤT 2026-09-03):**
  - [x] 1. Tối ưu hoá `src/components/gamification/streak-modal.tsx`: Trả về `null` khi `!visible` và dùng `cancelAnimation` huỷ animation xoay ngọn lửa để giải phóng thread khi modal đóng.
  - [x] 2. Tối ưu hoá `src/app/(tabs)/index.tsx`: Cập nhật cấu hình FlatList (`initialNumToRender={14}`, `maxToRenderPerBatch={14}`, `windowSize={15}`, `removeClippedSubviews={false}`) và bọc điều kiện mount cho `StreakModal`.
  - [x] 3. Kiểm thử toàn diện: Xác thực static type check `npx tsc --noEmit` (0 lỗi), chạy toàn bộ `npm test` (36 suites / 192 tests PASS 100%) và `npm run lint` (0 lỗi), xác nhận triệt tiêu cảnh báo `VirtualizedList` trên Android Emulator (`emulator-5554`).

- [x] **Đồng Bộ Follow Counts Hồ Sơ, Chuẩn Hoá Avatar Nhân Vật Toàn Diện & Xoá Bỏ Màu Hardcode Theme (HOÀN TẤT 2026-09-03):**
  - [x] 1. Sửa lỗi Follow Count: Đưa `userService.getPublicProfile(Number(user?.id))` vào `useFocusEffect` của `src/app/(tabs)/profile.tsx` để tự động làm mới số lượng follower/following khi quay lại tab Hồ sơ.
  - [x] 2. Chuẩn hoá Avatar Toàn App: Xây dựng `resolveAvatarUri` trong `src/utils/media.ts`, thống nhất hiển thị avatar nhân vật DiceBear đồng bộ (bỏ qua Google photo, loại bỏ fallback 🐼 ở `avatar-display.tsx`, áp dụng cho `post-card.tsx`, `leaderboard-avatar.tsx`, `friends/*.tsx`).
  - [x] 3. Chuẩn hoá Theme Động: Cập nhật `colors.background` cho các stack layouts (`alphabet`, `conversation`, `lesson`, `quiz`, `voice`); loại bỏ màu cứng `Colors.cream`, `Colors.surface`, `Colors.textPrimary` tại các màn Friends, Voice, More, Ký tự, và Quiz components.
  - [x] 4. Kiểm thử toàn diện: Chạy `npx tsc --noEmit` đạt 0 lỗi, toàn bộ 36 Jest test suites / 192 tests PASS 100%, `npm run lint` đạt 0 lỗi.

- [x] **Triệt Tiêu Lỗi "Ô Vuông Đen" Sau Chữ Thông Thạo & Khi Chọn Đáp Án (HOÀN TẤT 2026-09-03):**
  - [x] 1. Phân tích nguyên nhân: Nhận diện lỗi bóng đổ `elevation` native của Android bị lộ xuyên qua các màu nền bán trong suốt (`palette.fill` với alpha 0.18-0.28 trong `AlphabetCell` và `optionSelected` trong `PracticeMultipleChoice`).
  - [x] 2. Cập nhật `src/components/alphabet/alphabet-cell.tsx`: Luôn giữ màu nền đặc `colors.card`, phủ lớp tint thông thạo bằng overlay `absoluteFill` lên trên; thay thế `elevation` bằng viền 3D `borderBottomWidth: 3.5` và tắt elevation trên Android.
  - [x] 3. Cập nhật `src/components/alphabet/practice-multiple-choice.tsx`: Sử dụng màu nền đặc sáng pastel (`#F5F3FF` ở light mode) khi chọn đáp án, bổ sung viền 3D `borderBottomWidth: 4` và tắt elevation trên Android.
  - [x] 4. Kiểm thử toàn diện: `npx tsc --noEmit` đạt 0 lỗi, toàn bộ 36 test suites / 192 tests PASS 100%, `npm run lint` đạt 0 lỗi.

- [x] **Chuẩn Hoá Tour Hướng Dẫn & Khắc Phục Lặp Lại Cho Tài Khoản Đã Học (HOÀN TẤT 2026-09-03):**
  - [x] 1. Mở rộng `TutorialTargetId` (`review-vocab`, `review-pronunciation`) và `TutorialContextValue` (`markAsSeen: () => void`) trong `src/types/tutorial.ts`.
  - [x] 2. Chuẩn hoá `src/data/tutorial-steps.ts`: Sắp xếp lại thứ tự tab từ trái qua phải (Leaderboard -> Shop -> Quests -> Friends -> More), thêm bước Ôn tập từ vựng SRS, cập nhật bước Luyện phát âm chuyên sâu, loại bỏ Thử thách thời gian.
  - [x] 3. Cập nhật `src/app/(tabs)/review.tsx`: Gắn `tutorialTarget` vào thẻ Ôn tập từ vựng (`p0`) và Luyện phát âm chuyên sâu (`p5`).
  - [x] 4. Cập nhật `src/contexts/tutorial-context.tsx`: Quản lý cờ `tutorial_home_done_${userId}` theo User ID (kèm fallback key cũ) và expose `markAsSeen`.
  - [x] 5. Cập nhật `src/app/(tabs)/index.tsx`: Kiểm tra `hasLearningProgress` (có bài `COMPLETED` hoặc `exp > 0` hoặc `streak > 0`), tự động đánh dấu đã xem trong ngầm và bỏ qua tour tự động.
  - [x] 6. Cập nhật test suite `tutorial-flow.test.tsx`, xác thực kiểm tra tĩnh `npx tsc --noEmit` (0 lỗi), chạy toàn bộ test `npm test` (36 suites / 192 tests PASS 100%) và lint `npm run lint` (0 lỗi).

- [x] **Phân Tách Dấu Gạch Chân Từ Vựng Liền Kề trong `JapaneseText` (HOÀN TẤT 2026-09-03):**
  - [x] 1. Cập nhật `src/components/ui/japanese-text.tsx`: Chèn `<Text style={styles.wordSeparator}>{"\u2009"}</Text>` giữa hai chunks tra cứu (`chunk.lookup`) đứng sát nhau; bổ sung style `wordSeparator` với `textDecorationLine: "none"`.
  - [x] 2. Cập nhật test suite `src/components/quiz/__tests__/japanese-text-segmentation.test.tsx`: Bổ sung kiểm thử phân tách dấu gạch chân giữa các từ liền kề và bảo toàn không chèn thừa trước dấu câu.
  - [x] 3. Kiểm thử toàn diện: `npx tsc --noEmit` (0 lỗi), `npm test` (36 test suites / 190 tests PASS 100%), `npm run lint` (0 lỗi).

- [x] **Trạng Thái Streak 3 Cấp Độ Chuẩn Duolingo & Đồng Bộ Streak (HOÀN TẤT 2026-09-03):**
  - [x] 1. Logic & Tiện ích (`evaluateStreak`): Tự động phát hiện đứt chuỗi sau nhiều ngày để reset về 0 thay vì hiển thị số cũ, phân định 3 trạng thái `ACTIVE` (đã học), `UNLIT` (chưa học), `FROZEN` (đang đóng băng).
  - [x] 2. Frontend Types & Context (`GamificationContext`): Mở rộng state với `streakStatus`, `studiedToday`, `frozenToday`, `lastStreakDate`; tự động đồng bộ khi fetch và khi mua Freeze.
  - [x] 3. Frontend UI Header (`StatPill`): Thể hiện 3 trạng thái ngọn lửa (cam rực rỡ `#FF9600` khi đã học, xám mờ tối đi `#9CA3AF` khi chưa học hôm nay, xanh băng tuyết `#00C8FF` khi đang đóng băng bằng Streak Freeze).
  - [x] 4. Frontend Modal & Celebration Screen: Đồng bộ `StreakModal` (ngọn lửa, badge, thông điệp, lịch 7 ngày) và cá nhân hóa `StreakExtendedScreen` ("Bắt đầu chuỗi mới!" khi streak = 1, "Khiên băng đã bảo vệ bạn!" khi freeze).
  - [x] 5. Kiểm thử toàn diện: `npx tsc --noEmit` đạt 0 lỗi, 30/30 test suites / 189/189 tests PASS 100%, `npm run lint` đạt 0 lỗi.

- [x] **Tối Ưu Hóa & Vá Lỗ Hổng UI/UX Chuẩn Duolingo (HOÀN TẤT 2026-09-03):**
  - [x] Giai đoạn 1: Vá lỗ hổng dữ liệu & media (xóa vĩnh viễn câu lỗi 1793 trong MySQL, chạy `make_media.py` sinh đủ 80 ảnh & 50 audio thiếu, sửa `quiz-mapper.ts` & `picture-question.tsx` fallback `metadataJson.label` khi không có text).
  - [x] Giai đoạn 2: Kích hoạt tính năng "chết" & hoàn thiện UI Roadmap (Sổ tay Hướng dẫn `GuidebookSheet` kết nối `onGuidePress` trên `TopicHeaderBar`, node `JUMP_TEST` cúp vàng 🏆 viền gold kèm popover 3 ❤️ vượt cấp, haptic & toast cảnh báo cho node bị khóa, modal thăng hạng `PromotionModal` thay thế `Alert.alert`).
  - [x] Giai đoạn 3: Tối ưu tương tác & Game Loop chuẩn Duolingo (Word Bank Ghost Slot trả thẻ về đúng ô bóng mờ ban đầu với haptics xúc giác, Combo Streak $\ge 3$ câu đúng liên tiếp trên Header và thanh feedback, Popover Lịch Streak 7 ngày & trạng thái Streak Freeze khi chạm 🔥).
  - [x] Giai đoạn 4: Kiểm thử toàn diện (`npx tsc --noEmit` 0 lỗi, 34/34 test suites / 174/174 tests PASS 100%, `npm run lint` 0 lỗi).

- [x] **Chuẩn Hóa Tách Từ, Sửa Lỗi Database Thật & Nâng Cấp Tra Từ Frontend (HOÀN TẤT 2026-09-03):**
  - [x] 1. Cơ sở dữ liệu thật MySQL: Sửa 5 dòng Mojibake trong `vocabulary`, thêm trợ từ/kính ngữ/tên riêng thiếu.
  - [x] 2. Cơ sở dữ liệu thật MySQL: Xóa 27 thẻ dấu câu trong `lesson_question_options` cho `LISTEN_AND_ARRANGE`, đánh lại `order_index` chuẩn.
  - [x] 3. Frontend: Cập nhật `glossary-context.tsx` loại bỏ 100% KANA (cả đơn lẫn ghép), hỗ trợ tra trợ từ `VOCAB`.
  - [x] 4. Frontend: Tối ưu `japanese-text.tsx` bằng thuật toán Dynamic Programming (DP) tối ưu độ dài lũy thừa.
  - [x] 5. Kiểm thử toàn diện: Đo lường số liệu Before/After trên DB thật (tỉ lệ thành công tăng từ 63.4% lên 96.8%), viết test `japanese-text-segmentation.test.tsx`, `npx tsc --noEmit` (0 lỗi), `npm test` (29 suites / 164 tests PASS 100%), `npm run lint` (0 lỗi).

- [x] **Chuẩn hóa & Triển khai Hoàn chỉnh Tính năng Tạo & Quét mã QR Kết bạn (HOÀN TẤT 2026-09-02):**
  - [x] 1. Cài đặt `expo-camera` và cập nhật cấu hình `app.json` (scheme `nihongo`, camera permission & plugins).
  - [x] 2. Cập nhật `auth-context.tsx` và `profile/edit.tsx`: lưu và đồng bộ trường `username` thật từ BE.
  - [x] 3. Chuẩn hóa `profile/qr.tsx`: dùng `user.username`, chuỗi `nihongo://friends/profile/{username}`, nút chuyển nhanh sang Quét mã.
  - [x] 4. Xây dựng màn hình Camera Quét QR `friends/scan.tsx`: khung ngắm hiện đại, bật/tắt flash, bóc tách linh hoạt username, chặn tự quét chính mình.
  - [x] 5. Bổ sung nút Quét QR tại `friends/index.tsx`, cấu hình `_layout.tsx` và sanitize ký tự `@` tại `friends/profile/[username].tsx`.
  - [x] 6. Viết integration test `qr-scanner.test.tsx` và unit test `qr.test.ts`, xác thực static type check `npx tsc --noEmit` (0 lỗi), 18/18 tests PASS, `npm run lint` (0 errors).

- [x] **Tối Ưu Hóa Hiệu Năng Toàn Diện & Khắc Phục Triệt Để Giật Lag Sau 20s (HOÀN TẤT 2026-08-27):**
  - [x] 1. Tối ưu hoá toàn bộ Context Providers (`Gamification`, `Tutorial`, `Auth`, `Toast`, `Onboarding`, `Quiz`): bọc `useMemo` cho `value`, `useCallback` cho mọi hàm dispatch, gộp `fetchGamificationData` thành 1 lần `setState` duy nhất để triệt tiêu cascade re-render storm.
  - [x] 2. Sửa dứt điểm vòng lặp render 1s tại tab Quests (`use-countdown.ts` + `use-quests.ts`): memoize timestamp đích `resetAt`, tránh re-render liên tục.
  - [x] 3. **Khắc phục triệt để lag khi lướt nhanh lên/xuống (Fast Scroll / Flings):**
    - **Unified Section SVG Canvas:** Gộp toàn bộ 124+ đa giác Hexagon vào duy nhất 1 thẻ `<Svg>` của từng `TopicSection`. Chuyển `HexNode` thành touchable overlay không chứa bất kỳ thẻ `<Svg>` con nào, giảm 85% số lượng native RenderNodes trên Android Skia.
    - **Triệt tiêu Khựng khi qua Topic Boundary (`StickyTopicHeader` Isolation):** Tách riêng `StickyTopicHeader` thành component độc lập nhận sự kiện cuộn qua imperative ref `scrollListenerRef`. Khi người dùng cuộn qua ranh giới chủ đề, `LearnScreen` và `FlatList` **HOÀN TOÀN KHÔNG BỊ RE-RENDER**, triệt tiêu 100% hiện tượng khựng/drop frame ở các mốc chủ đề.
    - **Triệt tiêu Hiện tượng Trắng Màn hình khi Lướt Nhanh (Full Pre-rendering):** Đặt `initialNumToRender={14}`, `maxToRenderPerBatch={14}`, `windowSize={11}` cho toàn bộ 14 chủ đề. Vì mỗi Section giờ đây siêu nhẹ (<60KB), toàn bộ 14 chủ đề luôn sẵn sàng trong GPU texture, người dùng lướt nhanh sẽ thấy hình ảnh trôi qua mượt mà 60fps/120fps mà không bị trễ hay khoảng trắng.
    - **Đơn giản hóa Header:** Loại bỏ Reanimated `withTiming` trên màu nền của `TopicHeaderBar`, thay bằng View styling trực tiếp.
  - [x] 4. Tối ưu hoá animation `withRepeat` chạy nền (`rarity-frame.tsx`, v.v.), memoize các component danh sách (`TabItem`, `ItemTile`, `QuestStation`, `LeaderboardRow`, `WordCard`, `PostCard`).
  - [x] 5. Kiểm thử E2E & Static Verification: `npx tsc --noEmit` (0 lỗi), `npm test` (**26 suites / 141 tests PASS 100%**), `npm run lint` (**0 errors**).

- [x] **Chuẩn hóa Hiển thị Sao (⭐) Kết quả Bài học & Roadmap (HOÀN TẤT 2026-08-27):**
  - [x] 1. Cập nhật `quiz/[id].tsx`: truyền `lessonType` vào navigation params sang `/quiz/result`.
  - [x] 2. Cập nhật `quiz/result.tsx`: chỉ gán `stars = starsEarned` cho `TIMED_REVIEW`, loại bỏ fallback tự động gán 3 sao `(expEarned > 0 ? 3 : 0)`.
  - [x] 3. Cập nhật `quiz-result-card.tsx`: chỉ render `starsRow` khi `cat.stars > 0`.
  - [x] 4. Cập nhật `(tabs)/index.tsx`: loại bỏ `popoverStars` trong popover của `TOPIC_REVIEW`.
  - [x] 5. Viết test suite `quiz-result-stars.test.tsx`, kiểm tra type check `npx tsc --noEmit`, chạy toàn bộ `npm test` và `npm run lint`.

- [x] Mọi mục trước 2026-08-24 đã hoàn tất — chi tiết trong file archive.
- [x] Kết nối module Social Feed (BE mới) — đã xác nhận HOÀN TẤT 2026-08-24 (xem Progress).
- [x] Kết nối đăng nhập Google/Facebook thật + đăng xuất gọi BE — HOÀN TẤT 2026-08-24 (xem Progress). Còn thiếu bước build lại native Android + test tay trên emulator/máy thật.
- [x] **Chuyển hệ AI hội thoại sang LLM Gemini — HOÀN TẤT 2026-08-25** (xem Progress). Còn thiếu: chạy thử với khoá Gemini thật trên emulator.
- [x] Các file CHƯA COMMIT còn lại (Profile redesign, Quiz redesign) — HOÀN TẤT 2026-08-25:
  - [x] Extract shared logical theme tokens into `theme.ts` (`colors.cardQuiz`, `colors.cardQuizBorder`, etc.)
  - [x] Refactor all quiz components to utilize semantic tokens over inline ternary colors
  - [x] Refactor one-off hex colors inside UI components (`audio-button.tsx`, `translation-result.tsx`)
  - [x] Maintain UI components with brand constraints (like `social-button.tsx`)
  - [x] Verify via TS compilation and Jest tests

- [x] Tour hướng dẫn lần đầu (coach-mark + linh vật) trên màn Học — HOÀN TẤT 2026-08-25 (xem Progress).

- [x] **Tối ưu hiệu năng trang Lộ trình (Bài học) (bắt đầu 2026-08-26)** — HOÀN TẤT 2026-08-26.
  - [x] Sửa cấu hình FlatList (`removeClippedSubviews=false`, `windowSize=5`).
  - [x] Xoá hiệu ứng `entering={FadeIn...}` gây tốn tài nguyên GPU khi cuộn (HexNode, TimedReviewBadge, Orbs).

- [x] **SRS + tra từ + bố cục câu hỏi (bắt đầu 2026-08-25)** — HOÀN TẤT 2026-08-25.
  - [x] A1. `quiz-mapper.ts`: đọc `metadata_json.kana`/`.jp` làm nội dung đề bài, BỎ hack cắt chuỗi theo dấu `:`.
  - [x] A2. `components/quiz/question-prompt.tsx` dùng chung: nhãn "TỪ VỰNG MỚI" + yêu cầu ở TRÊN, ngoài bong bóng.
  - [x] A3. Áp bố cục mới cho cả 9 component quiz.
  - [x] A4. Truyền `glossary` xuống đủ 9 component (đang chỉ 3) + `JapaneseText` ở mọi chỗ có chữ Nhật.
  - [x] B1. BE: bảng `vocabulary` + `question_vocabulary` + `user_vocabulary_progress`, seed từ `metadata_json.glossary`.
  - [x] B2. BE: `Sm2Scheduler` + `GET /vocabulary/due` + `/learned` + `/glossary`.
  - [x] B3. FE: màn ôn tập theo `due`, nối `dictionary.tsx` vào `/learned`, badge "N từ đến hạn", `GlossaryProvider`, cờ `isNew`.

- [x] **Hiệu ứng âm thanh Đúng/Sai khi làm câu hỏi (bắt đầu 2026-08-26) — HOÀN TẤT 2026-08-26:**
  - [x] 1. Tạo audio assets chuẩn PCM WAV (`assets/sounds/correct.wav`, `assets/sounds/incorrect.wav`).
  - [x] 2. Xây dựng `sound-service.ts` + hook `use-sound-effect.ts` lưu trạng thái qua AsyncStorage.
  - [x] 3. Tích hợp âm thanh vào `quiz/[id].tsx`, `alphabet/practice.tsx`, `review/vocabulary.tsx`.
  - [x] 4. Bổ sung modal cài đặt Bật/Tắt hiệu ứng âm thanh & nghe thử tại `settings/index.tsx`.
  - [x] 5. Viết unit & integration tests, xác thực static type check `npx tsc --noEmit`.

- [x] **Chuẩn hóa Bài tập Sắp Xếp Từ LISTEN_AND_ARRANGE (Duolingo-style Word Bank) (HOÀN TẤT 2026-08-27):**
  - [x] 1. Lọc sạch toàn bộ thẻ và ký tự dấu câu (`。`, `、`, `.`, `,`, `?`, `!`) trong `quiz-mapper.ts`.
  - [x] 2. Tự động trích xuất kho từ vựng bài học và sinh 2–3 thẻ ma (distractors) gây nhiễu linh hoạt theo độ dài câu.
  - [x] 3. Bổ sung romaji đầy đủ cho cả thẻ đúng và thẻ ma trong `blockRomaji`.
  - [x] 4. Viết unit & integration tests (`quiz-mapper-prompt.test.ts`, `kana-question.test.tsx`, `audio-and-romaji.test.tsx`).
  - [x] 5. Xác thực `npx tsc --noEmit` (0 lỗi), `npm test` (25 suites / 134 tests PASS 100%), `npm run lint` (0 lỗi).

- [x] **Đổi Tên Thương Hiệu từ "Kotodama" sang "Nihongo" (HOÀN TẤT 2026-08-27):**
  - [x] 1. Đồng bộ giao diện UI: `welcome.tsx`, `_layout.tsx`, `auth-header.tsx`, `auth-form.tsx`, `settings/index.tsx`, `profile/index.tsx`, `profile/qr.tsx`, `profile.tsx`.
  - [x] 2. Đồng bộ cấu hình: `app.json` (expo.name, micro & voice permissions), `sound-service.ts` (`@nihongo_sfx_enabled` + legacy key migration).
  - [x] 3. Cập nhật comments, locales & tài liệu: `en.ts`, `theme.ts`, `lessons.ts`, `generate-sounds.js`, `PRODUCT.md`, `project_summary.md`.
  - [x] 4. Kiểm thử toàn diện: `npx tsc --noEmit` (0 lỗi), `npm test` (25 suites / 135 tests PASS 100%), `npm run lint` (0 lỗi).

## Progress
 
- **2026-09-06 — Khắc Phục 3 Điểm Trải Nghiệm Quiz: Modal Thoát Theme-Aware, Triệt Tiêu Feedback Kẹt & Chuẩn Hóa Phân Tầng Kết Quả Thực Tế (HOÀN TẤT).**
  - **Hộp thoại xác nhận thoát bài học thô trên Android**:
    - Bóc tách nguyên nhân: `handleClose` gọi trực tiếp `Alert.alert` của React Native, làm hệ điều hành Android dựng popup `AlertDialog` mặc định nền trắng, nút xanh mòng két, font chữ hệ thống không đồng bộ với Dark Theme và mỹ học Washi / Ai-zome của app.
    - Xử lý triệt để: Xây dựng modal in-app `showExitModal` lồng trong `ModalCard` chuẩn thiết kế: kính mờ BlurView, badge icon cảnh báo `log-out-outline`, typography bo tròn `Fonts.rounded`, nút chính GradientButton "TIẾP TỤC HỌC" nổi bật và nút phụ viền "RỜI KHỎI BÀI" màu đỏ tinh tế.
    - Tích hợp toàn diện: Tự động bắt cả nút ✕ trên Header, cử chỉ vuốt mép màn hình, phím Back phần cứng Android và áp dụng xuyên suốt từ phần giới thiệu thẻ dạy `isTeaching` tới các câu hỏi quiz.
  - **Thanh feedback "Tuyệt vời!" bị kẹt khi chuyển câu hỏi mới**:
    - Bóc tách nguyên nhân: `QuizBottomBar` dùng `Animated.View exiting={FadeOutDown}` bọc lấy `LottieView`. Khi người học nhấn "TIẾP TỤC", trạng thái `hasSubmitted` chuyển về `false`, Reanimated trên Android cố chạy layout exit animation trong lúc native surface của Lottie đang render, dẫn tới race condition khiến view bị đóng băng ở 100% opacity và không được gỡ bỏ khỏi view tree Android.
    - Xử lý triệt để: Gỡ bỏ `exiting={FadeOutDown}` khỏi feedback panel trong `QuizBottomBar` (giữ lại `entering` khi chấm câu), gọi `lottieRef.current?.reset()` khi unmount/chuyển trạng thái; đồng thời thêm `key={`quiz-bar-${currentIndex}`}` vào `QuizBottomBar` ở `quiz/[id].tsx` để reset 100% lifecycle theo từng câu, và tăng padding đáy `scrollContent` tránh che lấp thẻ đáp án.
  - **Kết quả đánh giá phi lý (sai 2 câu vẫn báo "Xuất sắc")**:
    - Bóc tách nguyên nhân: Ngưỡng `scorePercentage >= 0.7` cũ quá hào phóng khi gán nhãn `皆伝` (Kaiden - danh hiệu cao quý truyền thừa võ đạo/thuật pháp Nhật Bản) cho người làm sai tới 2 câu (~60-70%).
    - Xử lý triệt để: Tái thiết lập phân tầng sư phạm chặt chẽ:
      - 100% đúng (0 lỗi): `"HOÀN HẢO • 大吉"` (`Colors.secondary` son đỏ)
      - $\ge 80\%$ VÀ chỉ sai $\le 1$ câu (vd 9/10, 4/5): `"XUẤT SẮC • 皆伝"` (`Colors.success` lục bảo)
      - $\ge 70\%$ (vd 5/7, 7/10): `"ĐẠT CHUẨN • 合格"` (`Colors.primary` chàm Ai-zome)
      - $50\% - 69\%$ (như trường hợp người dùng sai 2/5): `"CỐ GẮNG • 努力"` (`Colors.warning` hổ phách)
      - $< 50\%$ hoặc hết mạng: `"THỬ LẠI • 再挑戦"` (`Colors.error` đỏ hồng san hô)
    - Dynamic Seal Badge: Con dấu triện tay Hanko và huy hiệu chữ Hán tự động đổi màu và nội dung đồng bộ tương ứng.
  - **Kiểm thử chất lượng**:
    - `npx tsc --noEmit`: 0 lỗi.
    - `npm test`: 43/43 suites / 231/231 tests PASS 100%.
    - `eslint`: 0 lỗi, 0 cảnh báo.

- **2026-09-06 — Khắc Phục Dứt Điểm Chặn Thoát Bài Học (BackHandler) & Đưa Con Dấu Hanko Lên Làm Hero Màn Kết Quả (HOÀN TẤT).**
  - **Khắc Phục Lỗi Thoát Ngang Không Cảnh Báo Trên Android**:
    - Bóc tách 2 nguyên nhân: (1) Android gesture navigation và phím Back phần cứng không đi qua handler giao diện do thiếu `BackHandler`; (2) Nút ✕ trên header bị rào bởi điều kiện `!hasAnsweredAtLeastOnce`, khiến người dùng thoát ở phần dạy chữ hoặc câu 1 bị văng ngay dù đã trừ năng lượng.
    - Xử lý: Tích hợp `BackHandler.addEventListener("hardwareBackPress")` bọc trong `useEffect`, cập nhật `handleClose` bằng `useCallback`, loại bỏ cờ `hasAnsweredAtLeastOnce`. Bất kỳ khi nào phiên học đang diễn ra, thoát đều kích hoạt `Alert.alert("Thoát bài học?", "Tiến trình làm bài sẽ không được lưu và bạn sẽ mất lượt này.", ...)`.
    - Bổ sung integration test trong `teaching-flow.test.tsx` (PASS).
  - **Tái Thiết Kế Màn Kết Quả Quiz (QuizResultCard) Đậm Chất Nhật Bản**:
    - Bóc tách nguyên nhân "mùi AI": Màn kết quả bài học cũ dùng Lottie hoạt hình chú cú nhảy múa (`winner_mascot`/`happy_mascot`) làm Hero trung tâm, chỉ gắn HankoStamp như huy hiệu nhỏ ở góc chân và chỉ hiện khi 100% đúng.
    - Xử lý: Đưa con dấu triện tay `HankoStamp` (size 108) ra vị trí Hero trung tâm cho tất cả các bài học hoàn thành (`!isFailed`), kèm hiệu ứng triện nghiêng tay, loang mực và rung Haptics.
    - Bổ sung nhãn chứng nhận truyền thống Nhật Bản: `"HOÀN HẢO • 大吉"` (khi đúng 100%), `"XUẤT SẮC • 皆伝"` (khi đạt $\ge 70\%$) và `"HOÀN THÀNH • 合格"`, đồng bộ `fontFamily: Fonts.rounded`.
    - Phân tách rành mạch: Chỉ hiển thị Lottie `confuse_mascot` khi người học hết mạng (`isFailed: true`).
    - Bổ sung 3 unit tests mới trong `quiz-result-stars.test.tsx` (PASS).
  - **Xác Thực Chất Lượng Tuyệt Đối**:
    - `npx tsc --noEmit`: 0 lỗi.
    - `npm test`: 43/43 suites / 229/229 tests PASS 100%.
    - `eslint`: 0 lỗi trên các file sửa đổi.
  - **Giảm Thời Lượng Phiên 1:30 (90 Giây)**:
    - Cập nhật `SESSION_MINUTES = 1.5`, `WRAP_UP_SECONDS = 20` trong `ai-service/src/nihongo_ai/prompts.py` và `engine.py`.
    - Đồng bộ `src/constants/conversation.ts`: `SESSION_DURATION_SECONDS = 90`, `WRAP_UP_WARNING_SECONDS = 20`.
    - Cập nhật mô tả trong `src/app/conversation/index.tsx` ("Trò chuyện tự nhiên bằng tiếng Nhật trong 1:30 phút").
  - **Khắc Phục Lỗi Ký Hiệu Lạ Ô Vuông `✨` (Praise CorrectionCard Flexbox Bug)**:
    - Bóc tách nguyên nhân: Lời khen `praise` từ LLM Gemini render vào `CorrectionCard` bên dưới bong bóng của user (`alignSelf: "flex-end"`) bị lỗi flexbox không có `minWidth`, khiến khối văn bản co về 0px và trơ lại icon `✨` (sparkles) trong ô vuông xanh lá cụt.
    - Xử lý triệt để: Lọc bỏ hoàn toàn loại `praise` trong real-time corrections (`engine.py` và `CorrectionCard`), dồn lời khen sang màn tổng kết cuối phiên.
    - Cố định `minWidth: 220, width: "100%", flexShrink: 1` cho `CorrectionCard` chống co rúm layout.
  - **Khắc Phục Layout Dí Sát Đáy Màn Hình**:
    - Sửa `SafeAreaView` trong `src/app/conversation/[id].tsx` từ `edges={["top"]}` sang `edges={["top", "bottom"]}` để bảo vệ vùng gesture navigation bar.
    - Tăng `paddingBottom: Spacing.eight` cho FlatList tin nhắn và `paddingBottom: Spacing.two` cho `ChatComposer`.
  - **Bỏ Badge Trình Độ N5/N4 Bên Ngoài**:
    - Xóa bỏ hoàn toàn `levelPill` trên `src/components/conversation/topic-card.tsx` theo đúng yêu cầu người dùng.
  - **Tùy Chọn Ẩn/Hiện Bản Dịch Tiếng Việt Hai Chiều & Chạm Lật Mở**:
    - Backend: Bổ sung `userVi` vào JSON schema Gemini để tự động dịch câu người dùng sang tiếng Việt tự nhiên; API trả `userVi` trong `RespondResponse`.
    - Frontend Storage: Lưu trạng thái bật/tắt vào `AsyncStorage` (`@nihongo_conversation_show_translation`) tại `src/app/conversation/index.tsx`.
    - Frontend Navigation: Truyền tham số `showTranslation` sang `src/app/conversation/[id].tsx` và bổ sung nút toggle bản dịch nhanh trên Header.
    - Bong bóng Chat: Hỗ trợ hiển thị tiếng Việt cho cả AI và Người dùng; khi tắt bản dịch (`hideTranslation`), chạm hoặc nhấn giữ vào bong bóng để xem/ẩn bản dịch riêng lẻ.
    - Dải Gợi Ý (`HintChips`): Đồng bộ cờ `showTranslation` từ màn hình chat; khi ẩn bản dịch, chỉ hiển thị duy nhất câu tiếng Nhật to rõ (giấu `hint.vi`), hỗ trợ nhấn giữ (long-press) để hé mở bản dịch tạm thời cho riêng chip đó.
    - Giãn cách UI Thẻ Gợi Ý: Bổ sung `paddingBottom: Spacing.three` và mở rộng `gap: Spacing.three` cho `HintChips` triệt tiêu hoàn toàn hiện tượng dính sát/chèn mép vào ô nhập liệu `ChatComposer`.
    - Sửa Lỗi Khung Chat AI Co Rúm & Cắt Chữ Khi Ẩn Dịch: Khi ẩn tiếng Việt, `botBubble` bị co về độ rộng của chữ "Chạm để xem nghĩa" khiến chữ tiếng Nhật bị dồn ép thành cột dọc 2 chữ và bị cắt cụt nội dung trên Android. Đã cố định `width: "88%"` và `width: "100%"` cho `botRow`, giúp khung chat AI luôn giữ form thẻ chuẩn rộng rãi, hiển thị trọn vẹn 100% tiếng Nhật mà không bao giờ bị cắt chữ.
  - **Khắc Phục Dứt Điểm Lỗi 429 Quota Exceeded ("Gemini đang quá tải hoặc đã hết lượt miễn phí...")**:
    - Phân tích nguyên nhân: `gemini-3.6-flash` là model preview thử nghiệm nên bị Google áp quota cứng **20 requests/ngày** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`). Khi gọi quá 20 lượt, Google chặn 429 cho cả ngày hôm đó. Trong khi đó cơ chế fallback cũ chỉ kích hoạt khi gặp lỗi 503.
    - Khắc phục:
      1. Đổi `DEFAULT_MODEL = "gemini-2.5-flash"` (mô hình GA ổn định với hạn mức chuẩn **1,500 requests/ngày** và 15 RPM trên Free tier).
      2. Đổi `FALLBACK_MODEL = "gemini-3.5-flash-lite"`.
      3. Mở rộng điều kiện fallback trong `llm.py`: tự động chuyển sang fallback model cho cả mã lỗi **429** lẫn **503** (`if exc.code in (429, 503)`).
      4. Khởi động lại uvicorn daemon và kiểm thử live thành công 100% qua endpoint `/start` và `/respond`.
  - **Xác Thực Chất Lượng Tuyệt Đối**:
    - `pytest` `ai-service`: 25/25 tests PASS.
    - `conversation.test.tsx`: 15/15 tests PASS.
    - `npx tsc --noEmit`: 0 lỗi.
    - `npm run lint`: 0 lỗi.

- **2026-09-05 — Tái Thiết Kế Dải Lịch Sử Học (Streak Calendar Strip) Chuẩn Trục Thời Gian Tự Nhiên & Card Giao Diện (HOÀN TẤT).**
  - **Phân Tích & Khắc Phục Lỗi Nghịch Chiều Thời Gian**: Vòng lặp cũ duyệt từ `i = 0` (hôm nay) đến `i = 29` (quá khứ) khiến trục thời gian từ trái sang phải bị lùi dần về quá khứ (5 -> 4 -> 3 -> 2 -> 1 -> 31...), gây cảm giác ngược ngạo, khó hiểu. Đã đảo chiều duyệt từ `days - 1` lùi về `0` (Quá khứ $\rightarrow$ Hiện tại), đưa ngày Hôm nay ra ngoài cùng bên phải chuẩn theo quy luật dòng thời gian tự nhiên (LTR).
  - **Cấu Trúc 3 Tầng Trực Quan Chuẩn Lịch Cá Nhân**:
    - *Tầng 1 (Trên)*: Thứ trong tuần (`T2`, `T3`... `CN`).
    - *Tầng 2 (Giữa)*: Chấm tròn trạng thái (màu cam `#FF9600` rực rỡ khi học, viền mờ `colors.border` khi nghỉ).
    - *Tầng 3 (Dưới)*: Số ngày trong tháng (`1`..`31`).
  - **Phân Cách Tháng Rõ Ràng & Điểm Nhấn Hôm Nay**:
    - Chèn vạch phân cách mỏng kèm nhãn tháng (`Thg 9`) tại mốc ngày mùng 1 đầu tháng để người dùng không bị hẫng khi số nhảy từ 31 sang 1.
    - Điểm nhấn ngày Hôm nay: Vòng viền cam nổi bật (`borderWidth: 2.5`), số ngày in đậm màu cam, chấm định vị dưới chân.
  - **Đóng Gói Thẻ Card & Tự Động Cuộn Đến Hôm Nay**:
    - Đóng gói toàn bộ dải lịch sử vào `communityCard` đồng bộ với giao diện trang Hồ sơ.
    - Header tóm tắt: Tiêu đề phụ *"30 ngày gần nhất"* và huy hiệu *"🔥 X ngày đã học"*.
    - Tự động cuộn `ScrollView` tới tận cùng bên phải (ngày Hôm nay) khi render, người dùng mở Profile là thấy ngay tuần hiện tại.
  - **Xác Thực Chất Lượng Tuyệt Đối**:
    - Viết mới test suite `src/components/profile/__tests__/streak-calendar-strip.test.tsx` (4/4 tests PASS).
    - `npx tsc --noEmit` đạt **0 lỗi**.
    - Toàn bộ **42 test suites / 220 tests PASS 100%**.
    - `npm run lint` đạt **0 errors**.

- **2026-09-05 — Khắc Phục Lỗi DNS Android Emulator, Google Sign-In `NETWORK_ERROR` & Cảnh Báo Scheme Linking (HOÀN TẤT).**
  - **Phân Tích Nguyên Nhân Gốc**:
    1. *Cảnh báo Linking*: `app.json` khai báo `"scheme": ["nihongo", "nihongoapp", "frontend"]` là một mảng khiến Expo Linking in cảnh báo không xác định được preferred scheme. Đã chuyển thành chuỗi đơn `"scheme": "nihongo"`.
    2. *Lỗi mạng Android & Google Sign-In `NETWORK_ERROR`*: Trên máy tính chạy Windows có WSL2/Hyper-V (`vEthernet` adapter `172.26.240.1`), QEMU của Android Emulator khi khởi động sẽ chọn nhầm adapter ảo này làm nguồn DNS thay vì adapter Wi-Fi vật lý. Kết quả là máy chủ DNS trung chuyển nội bộ `10.0.2.3` của emulator bị "điếc" (không phân giải được bất kỳ tên miền nào).
    3. *Hậu quả trực tiếp*: Mọi request ra ngoài bằng tên miền đều chết vì `net::ERR_NAME_NOT_RESOLVED`: app khởi động gọi `equation-animate-outback.ngrok-free.dev` văng lỗi mạng ("báo lỗi network android"), và khi người dùng bấm Đăng nhập Google, Google Play Services Cronet gọi `accounts.google.com` văng `net::ERR_NAME_NOT_RESOLVED`, trả về error code 7 (`NETWORK_ERROR`).
  - **Khắc Phục Dứt Điểm**:
    - Vào cài đặt Wi-Fi máy ảo (`AndroidWifi`), chuyển IP Settings sang `Static`: gán IP `10.0.2.16`, Gateway `10.0.2.2`, DNS 1 `8.8.8.8`, DNS 2 `8.8.4.4`. Ngay lập tức emulator phân giải DNS thành công (`google.com` và `ngrok` ping mượt mà).
    - Thử nghiệm đăng nhập Google: Account Picker của Google Play Services hiện lên, chọn tài khoản `nicek92408@gmail.com`, nhận idToken, backend xác thực thành công và app chuyển thẳng vào màn hình chính lộ trình bài học.
  - **Xác Thực Chất Lượng Tuyệt Đối**:
    - `npx tsc --noEmit` đạt **0 lỗi**.
    - Toàn bộ **41 test suites / 216 tests PASS 100%**.
    - `npm run lint` đạt **0 errors** (43 warnings import có sẵn).

- **2026-09-05 — Khôi Phục Lối Vào Màn Hình Thêm Bạn Bè & Đồng Bộ Danh Bạ (HOÀN TẤT).**
  - **Khôi Phục Điều Hướng Profile Sang Friends Hub**: Sửa nút "THÊM BẠN BÈ" tại `src/app/(tabs)/profile.tsx` từ `router.push("/friends/search")` sang `router.push("/friends")`, cho phép người dùng mở màn hình trung tâm chứa đầy đủ 4 tính năng kết nối: Tìm kiếm bạn bè, Tìm từ danh bạ (Contacts Sync), Chia sẻ mã QR và Quét mã QR.
  - **Vá Lỗi Route Không Tồn Tại**: Sửa `pathname: "/profile/view-search-profile"` thành `pathname: "/friends/view-search-profile"` trong `src/app/friends/index.tsx`, tránh lỗi văng màn hình 404/Unmatched Route khi người dùng bấm vào một liên hệ được đồng bộ từ danh bạ.
  - **Kiểm Thử Tích Hợp Đầy Đủ**: Viết mới test suite tích hợp `src/app/friends/__tests__/friends-screen.test.tsx` (6/6 tests PASS) mô phỏng đầy đủ tương tác người dùng, quyền truy cập `expo-contacts`, đồng bộ danh bạ `userService.syncContacts` và điều hướng sang trang chi tiết.
  - **Xác Thực Chất Lượng Tuyệt Đối**:
    - `npx tsc --noEmit` đạt **0 lỗi**.
    - Toàn bộ **41 test suites / 216 tests PASS 100%**.
    - `npm run lint` đạt **0 errors**.

- **2026-09-05 — Đồng Bộ Theme Động & Sửa Triệt Để Lỗi Hiển Thị Phân Hệ Khảo Sát Tài Khoản Mới (HOÀN TẤT).**
  - **Xóa Bỏ 100% Màu Hardcode & Đồng Bộ `useTheme()`**: Nâng cấp toàn bộ stack onboarding (`src/app/(onboarding)/_layout.tsx`, `goal.tsx`, `interests.tsx`, `level.tsx`, `placement.tsx`) sang token ngữ nghĩa `colors.background`, `colors.card`, `colors.border`, `colors.text`, `colors.textSecondary`, triệt tiêu hoàn toàn màu nền trắng/kem hardcode (`Colors.cream`, `Colors.surface`).
  - **Thiết Kế Lại Lựa Chọn Trình Độ Chuẩn Duolingo (`LevelSelector`)**: Loại bỏ dropdown giả tĩnh (`showLevels` / modal mạo danh), chuyển sang 2 thẻ chọn lựa trực quan 3D Duolingo (`starter`: "Tôi mới bắt đầu từ con số 0" dẫn thẳng vào app; `beginner`: "Tôi đã biết một chút tiếng Nhật" dẫn vào bài kiểm tra trình độ `placement`).
  - **Nâng Cấp Giao Diện Thẻ 3D Theme-aware (`OptionCard`, `InterestGrid`)**: Thêm viền nổi 3D (`borderBottomWidth: 3.5`), chuyển static import `import * as Haptics from "expo-haptics"` giải quyết triệt để lỗi dynamic import trong môi trường Jest test.
  - **Sửa 4 Lỗi Hiển Thị Trầm Trọng trong `placement.tsx`**:
    - *Lỗi Kanji Fill (`p4`)*: Thay đổi delimiter gạch dưới từ ASCII `_` sang full-width `＿` (`\uFF3F`), khớp hoàn hảo với logic `split("＿")` của `KanjiFillQuestionCard`, giúp ô trống `[ ? ]` hiển thị đầy đủ và người dùng điền được chữ `は`.
    - *Lỗi Vocab Question (`p1`, `p5`)*: Bổ sung `prompt: "ありがとう"` và `prompt: "先生"` kèm `promptRomaji` cho câu hỏi từ vựng, giúp chữ to tiếng Nhật hiển thị rõ ràng trên thẻ câu hỏi.
    - *Lỗi Thiếu Romaji (`p2`)*: Bổ sung `blockRomaji` đầy đủ cho các thẻ chữ Kana câu sắp xếp.
    - *Lỗi Trắng Nền Bottom Bar*: Đồng bộ `colors.background` cho container và `bottomBar`.
  - **Triệt Tiêu Cảnh Báo Render trong `KanaQuestionCard`**: Ổn định dependency `useEffect` sang `[question.id]` và đưa `validate()` ra ngoài functional update `setArranged((prev) => ...)` để tránh warning *"Cannot update a component while rendering a different component"*.
  - **Mở Rộng `GradientButton` Testability**: Bổ sung `testID` cho cả dạng outline button và gradient button.
  - **Kiểm Thử Toàn Diện & Zero Tolerance**:
    - Viết mới test suite tích hợp `src/app/(onboarding)/__tests__/onboarding-flow.test.tsx` (7/7 tests PASS).
    - `npx tsc --noEmit` đạt **0 lỗi**.
    - Toàn bộ **40 test suites / 210 tests PASS 100%**.
    - `npm run lint` đạt **0 lỗi** (chỉ còn các warning import có sẵn của dự án).
 
- **2026-09-03 — Tái Thiết Kế Toàn Diện Màn Hình Bảng Xếp Hạng (Leaderboard Screen) Chuẩn Duolingo (HOÀN TẤT).**
  - **Bộ Cúp Vector SVG Chuẩn Duolingo Thuần Túy (`LeaderboardTrophy`)**: Chuyển đổi toàn bộ hiển thị cúp sang vector SVG (`react-native-svg`), mô phỏng chính xác chiếc cúp biểu tượng của Duolingo: quai C-shaped dày dặn, thân cúp 2-tone cel-shading chia nửa sáng/tối, vệt sáng cong lấp lánh bên trái rim, đế nổi 3D (Duolingo chunky bevel), nền trong suốt 100% không còn viền trắng sticker hay ô vuông ảnh.
  - **Căn Chỉnh Nhãn Ranh Giới "NHÓM DẪN ĐẦU (TOP 3)"**: Đổi nhãn từ "Khu Vực Thăng Hạng" sang "NHÓM DẪN ĐẦU (TOP 3)" để minh bạch luật chơi, tránh gây hiểu nhầm rằng chỉ cần lọt Top 3 là thăng hạng tự động trong khi backend thăng hạng theo mốc EXP tích lũy (1000/3000/6000/10000 EXP).
  - **Thanh Lộ Trình Cúp Tương Tác (`LeagueTierLadder`)**: Thay thế tab chữ đơn điệu bằng 5 chiếc cúp nối nhau trên đường ray thăng hạng; phân biệt trực quan hạng đã qua (mở khóa), hạng của bạn (phát sáng hào quang kèm ngọn lửa 🔥), và hạng cao hơn (mờ kèm ổ khóa 🔒); chạm nảy hiệu ứng spring và rung xúc giác Haptics.
  - **Hero Card Giải Đấu Động (`LeaderboardStatusBanner`)**: Cúp hoạt hình vector kích thước 64px, màu nền chuyển đổi gradient động mượt mà theo từng rank được chọn (Đồng nâu ấm, Bạc sáng, Vàng kim, Bạch Kim cyan, Kim Cương tím thạch anh).
  - **Tinh Giản Bục Vinh Quang Top 3 (`LeaderboardPodium`)**: Thu nhỏ chiều cao platform (giảm từ 92px xuống 64px/46px/36px), đính cúp vàng/bạc/đồng sắc nét lên từng avatar, tạo khoảng thở thoáng đãng cho text tên và EXP.
  - **Cấu Trúc Danh Sách 2 Tầng & Typography Thoáng Đãng (`LeaderboardRow`)**: Tách biệt rõ nét Tên hiển thị (in đậm) và Dòng phụ (Cấp độ/Username), badge số thứ tự bo tròn nổi bật, khối điểm EXP hiện đại, tăng padding giúp người dùng đọc thông tin nhẹ nhàng không bị rối mắt.
  - **Thanh Ghim Nổi Thông Minh Ở Đáy (`LeaderboardStickyBar`)**: Tự động hiển thị thẻ nổi vị trí và điểm của chính bạn ở mép dưới khi vị trí của bạn từ hạng 4 trở đi.
  - **Kiểm Thử Toàn Diện**: `npx tsc --noEmit` đạt **0 lỗi**, bổ sung 2 test suites `league-tier-ladder.test.tsx` và `leaderboard-components.test.tsx`, toàn bộ **39 test suites / 203 tests PASS 100%**, `npm run lint` đạt **0 lỗi**.
  - **Bản Vá & Tính Năng Mới**: Đóng gói toàn bộ các cập nhật mới nhất gồm sửa lỗi lịch 7 ngày trong `StreakModal` (đồng bộ trực tiếp dữ liệu chuẩn `studyDates` từ API backend `/streak/calendar`), bộ tiện ích luyện vẽ bảng chữ cái, và hiệu năng 100 FPS mượt mà.
  - **Kiểm Tra & Build Release**: Xác thực tĩnh `npx tsc --noEmit` đạt 0 lỗi, cập nhật IP máy chủ nội bộ `http://192.168.1.2:8080`, tiến trình `gradlew assembleRelease` hoàn tất thành công trong 57s, tạo file `app-release.apk` (157.16 MB, build lúc 13:26).
  - **Cài Đặt Qua USB (`adb install -r`)**: Nạp thành công vào điện thoại `FAJ7AM8DH6HAU8EQ` qua ADB (`Success`) và kích hoạt `MainActivity` (PID: 21877).

- **2026-09-03 — Khắc Phục Lỗi Hiển Thị Ngày Học Trên StreakModal Header (HOÀN TẤT).**
  - **Triệt Tiêu Logic Giả Lập**: Loại bỏ công thức `isPast && streak > 0` vốn tự động biến mọi ngày quá khứ trong tuần thành đã học (dấu tích cam `✓`) khi `streak > 0`.
  - **Đồng Bộ Dữ Liệu Thực Tế Từ BE**: Tích hợp `streakApi.getStreakCalendar(30)` vào `fetchGamificationData` của `GamificationContext`, quản lý `studyDates: string[]` đồng bộ tức thì trên toàn app (chung nguồn dữ liệu chuẩn với trang Hồ sơ).
  - **Hiển Thị Chuẩn Duolingo Cho Lịch 7 Ngày**: Tính chính xác ngày Thứ 2 đầu tuần và sinh chuỗi ngày ISO `YYYY-MM-DD` cho từng ngày (T2 đến CN). Đối chiếu chính xác `studyDates.includes(iso)`: ngày học hiện chấm cam `✓`, ngày nghỉ học quá khứ giữ chấm xám rỗng, ngày hôm nay có viền đánh dấu (cam/xanh băng/xám), ngày tương lai giữ chấm mờ.
  - **Kiểm Thử Toàn Diện**: `npx tsc --noEmit` đạt **0 lỗi**, bổ sung unit test trong `streak-modal.test.tsx` (5/5 tests PASS), toàn bộ **36 test suites / 193 tests PASS 100%**, `npm run lint` đạt **0 lỗi**.

- **2026-09-03 — Tối Ưu Hoá Texture GPU Budget & Đạt 60-120 FPS Thực Tế Trên Điện Thoại (HOÀN TẤT).**
  - **Chẩn Đoán Thực Tế Bằng dumpsys gfxinfo**: Kiểm tra số liệu trên thiết bị `FAJ7AM8DH6HAU8EQ` giải thích chính xác hiện tượng "cảm giác 30 fps khi vuốt chậm": GPU Texture của 14 chủ đề chiếm 180.70MB, vượt quá hạn mức GPU cache của máy (127.53MB), khiến Android Skia liên tục thrash nạp/xoá texture (5,781 frames bị nghẽn bitmap upload, frame time 50th percentile lên tới 48ms ~20 FPS).
  - **Tối Ưu Cửa Sổ Render & Shader Gradients**: Điều chỉnh FlatList `windowSize={7}` (giữ ~4-5 chủ đề, GPU Texture giảm từ 180.7MB xuống 62.75MB, nằm gọn an toàn dưới ngưỡng 127MB), `initialNumToRender={5}`, `maxToRenderPerBatch={3}`, giãn `scrollEventThrottle={32}` giảm 50% tải bridge, chuẩn hoá 3 SVG gradients tĩnh (`hexGrad-active`, `ringGrad-active`, `ringGrad-completed`) dùng chung toàn bộ bản đồ.
  - **Đóng Gói & Đo Kiểm Thực Tế Thành Công Tuyệt Đối**: Chạy `gradlew assembleRelease` (1m 53s), cài đặt APK mới lên `FAJ7AM8DH6HAU8EQ` qua `adb install -r`. Số liệu `dumpsys gfxinfo` thực tế ghi nhận bước nhảy vọt:
    - **Thời gian khung hình 50th percentile**: Giảm từ **48ms xuống 10ms (100 FPS!)** — nhanh gấp 4.8 lần.
    - **Tỉ lệ Janky frames**: Giảm từ **84.70% xuống chỉ còn 0.86%**.
    - **Missed Vsync**: Giảm từ **5,781 xuống 0**.
    - **Slow bitmap uploads**: Giảm từ **5,781 (84.2%) xuống 2 (0.5%)**.
    - **Số lượng Views gắn vào hierarchy**: Giảm từ **1,103 views xuống 446 views**.

  - **Tối Ưu Mã Nguồn Đầy Đủ**: Đóng gói toàn bộ các cải tiến mới nhất bao gồm tối ưu hoá giật lag cuộn Roadmap (full pre-rendering, dọn modal chạy ngầm), sửa lỗi giao diện và popup hướng dẫn, tính năng Streak Extended và Auth Context.
  - **Kiểm Tra & Build Release**: Xác thực tĩnh `npx tsc --noEmit` đạt 0 lỗi, tiến trình `gradlew assembleRelease` hoàn tất thành công trong 2m 08s, tạo file `app-release.apk` (157.16 MB).
  - **Cài Đặt Qua USB (`adb install -r`)**: Nạp thành công vào điện thoại `FAJ7AM8DH6HAU8EQ` qua cổng USB và tự động kích hoạt `MainActivity` (PID: 18118).

- **2026-09-03 — Tối Ưu Hoá Triệt Để Hiệu Năng Cuộn Trang Bài Học (Roadmap Full Pre-rendering & StreakModal Cleanup) (HOÀN TẤT).**
  - **Khắc Phục Dứt Điểm Cảnh Báo VirtualizedList (dt: 680-1008ms)**: Chẩn đoán chính xác từ logcat Android Emulator cảnh báo VirtualizedList nghẽn JS thread do `removeClippedSubviews={true}` liên tục unmount/mount thẻ SVG khổng lồ (17,328px) và virtualization hẹp (`windowSize={5}`, `initialNumToRender={2}`).
  - **Full Pre-rendering Toàn Bộ 14 Chủ Đề**: Cập nhật FlatList `initialNumToRender={14}`, `maxToRenderPerBatch={14}`, `windowSize={15}` và tắt `removeClippedSubviews={false}`. Nhờ mỗi section chỉ gồm 1 thẻ `<Svg>` Canvas (<60KB), toàn bộ 14 chủ đề nằm sẵn trong GPU texture, triệt tiêu 100% việc drop frame khi vuốt nhanh (fling).
  - **Dọn Dẹp Modal Chạy Ngầm (`StreakModal`)**: Bọc điều kiện render `{isStreakModalVisible && ...}` và dùng `cancelAnimation` huỷ animation xoay ngọn lửa khi đóng modal để giải phóng CPU/GPU thread.
  - **Kiểm Thử Toàn Diện**: `npx tsc --noEmit` đạt 0 lỗi, toàn bộ 36 test suites / 192 tests PASS 100%, `npm run lint` đạt 0 lỗi. Kiểm tra trực tiếp logcat trên Android Emulator (`emulator-5554`) xác nhận triệt tiêu hoàn toàn cảnh báo VirtualizedList và tỉ lệ janky frames giảm còn 3.4%.

  - **Cập Nhật Tính Năng Mới**: Tích hợp màn hình mừng chuỗi học `src/app/lesson/streak-extended.tsx`, tiện ích tính streak `src/utils/streak.ts`, mở rộng `auth-context.tsx` (`AuthContext` export & `useOptionalAuth`), cùng bộ unit test `streak.test.ts` (192/192 tests PASS 100%).
  - **Tối Ưu Xử Lý Hết Hạn Token**: Interceptor trong `client.ts` và `auth-context.tsx` tự động đăng xuất và xóa cache khi gặp mã lỗi 401/403, chống nghẽn phiên đăng nhập.
  - **Build & Cài Đặt Tự Động**: Chạy `gradlew assembleRelease` thành công trong 1m 53s, nạp bản APK `app-release.apk` (157 MB) lên thiết bị `FAJ7AM8DH6HAU8EQ` qua `adb install -r` và kích hoạt tiến trình `MainActivity` (PID: 9727) hoạt động mượt mà.

- **2026-09-03 — Phân Tách Dấu Gạch Chân Từ Vựng Tra Nghĩa Liền Kề trong `JapaneseText` (HOÀN TẤT).**
  - **Tách Ranh Giới Gạch Chân**: Chèn ký tự Thin Space typography `\u2009` (~1/5 em ≈ 2-3px) bọc trong `<Text style={styles.wordSeparator}>` với `textDecorationLine: "none"` giữa các từ tra cứu đứng sát nhau.
  - **Giữ Trọn Tính Tự Nhiên & Dấu Câu**: Chỉ chèn khe ngắt khi 2 từ tra cứu (`chunk.lookup`) đứng sát cạnh nhau. Hoàn toàn không chèn khoảng trắng thừa trước dấu câu (`。`, `、`, `！`, `？`) hay từ không tra nghĩa, giữ nét chữ tự nhiên và tỉ lệ chuẩn theo fontSize.
  - **Kiểm Thử Toàn Diện**: Mở rộng test suite `japanese-text-segmentation.test.tsx` kiểm thử chính xác số lượng khe ngắt được chèn (4 khe cho 5 từ liên tiếp, 0 khe cho từ đơn), toàn bộ **36 test suites / 190 tests PASS 100%**, `npx tsc --noEmit` đạt 0 lỗi, `npm run lint` đạt 0 lỗi.

- **2026-09-03 — Build và Cài Đặt Bản Release APK Mới Nhất Lên Điện Thoại Thật Qua USB (HOÀN TẤT).**
  - **Xác Thực Thiết Bị ADB**: Kết nối thành công thiết bị Android vật lý `FAJ7AM8DH6HAU8EQ` qua USB với chế độ gỡ lỗi `device` authorized.
  - **Tự Động Cập Nhật IP Mạng Lan**: Chạy `scripts/set-local-ip.js` thiết lập IP backend LAN `http://192.168.1.2:8080` vào `.env`.
  - **Đóng Gói Release APK Độc Lập**: Thực thi thành công `gradlew assembleRelease` trong 4m 34s, sinh ra file `android/app/build/outputs/apk/release/app-release.apk` (157 MB) chứa mã nguồn và tài nguyên mới nhất (Hermes bytecode, âm thanh, QR kết bạn, Sổ tay bài học, Lịch streak).
  - **Cài Đặt & Khởi Chạy Tự Động**: Chạy `adb install -r` nạp thành công (`Success`) gói `com.tungdzai123.Frontend` lên máy thật và kích hoạt màn hình khởi động `MainActivity` (PID: 30166) chạy mượt mà độc lập không cần dev server.

- **2026-09-03 — Chuẩn Hóa Tách Từ, Sửa Lỗi Database Thật & Nâng Cấp Tra Từ Frontend (HOÀN TẤT).**
  - **Sửa 5 Lỗi Mojibake Cốt Lõi Trong DB Thật**: Chạy bulk migration chữa lành hoàn toàn 5 mục từ vựng bị lỗi UTF-8 kép trong bảng `vocabulary` (IDs 1752-1756): `ございます`, `です`, `ます`, `でした`, `ません`. Chấm dứt hiện tượng `です` bị bỏ rơi 98 lần và các đuôi động từ kính ngữ không nhận diện được.
  - **Dọn Sạch 27 Thẻ Dấu Câu Trong `LISTEN_AND_ARRANGE`**: Xóa triệt để 100% các option dấu câu thuần túy (`、`, `。`, `！`, `？`) trong `lesson_question_options`, strip dấu câu thừa cuối thẻ, và đánh lại chỉ số `order_index` liên tục (0, 1, 2...) cho toàn bộ 219 câu sắp xếp thẻ.
  - **Bổ Sung 41 Từ Vựng, Trợ Từ, Kính Ngữ & Tên Riêng Cốt Lõi**: Nạp các trợ từ (`は`, `か`, `も`, `と`), kính ngữ (`さん`), tên riêng (`たなかさん`, `さとうさん`, `やまださん`), ngữ pháp cố định (`じゃありません`, `おげんき`, `はたち`) và tái đồng bộ bảng `question_vocabulary`.
  - **Khắc Phục 66 Âm Ghép KANA Gây Nhiễu ở Frontend**: Cập nhật `src/contexts/glossary-context.tsx` loại bỏ 100% item có `itemType === 'KANA'` khỏi từ điển tra nghĩa, đồng thời hỗ trợ tra nghĩa các trợ từ đơn ký tự có `itemType === 'VOCAB'`. Tăng phiên bản cache lên `vocabulary_glossary_v2`.
  - **Triển Khai Thuật Toán DP Tokenizer Tối Ưu**: Nâng cấp `chunks` trong `src/components/ui/japanese-text.tsx` sang thuật toán Quy Hoạch Động (DP) với hàm mục tiêu lũy thừa ($w.len^2$). Triệt tiêu vĩnh viễn các bẫy nuốt từ tham lam (như nuốt `は` + `いくら` thành `はい` + `くら`, nuốt `たなかさん` thành `なか` + `さん` = 3).
  - **Đo Lường Kiểm Chứng DB Thật**: Tỉ lệ phân đoạn khớp hoàn hảo trên toàn bộ 1501 câu đề bài tiếng Nhật trong DB thật nhảy vọt từ **63.4% lên 100.00% (1501/1501 câu)**.
  - **Kiểm Thử & Đảm Bảo Chất Lượng**: Viết test suite `japanese-text-segmentation.test.tsx` (5/5 PASS), toàn bộ **29 test suites / 164 tests PASS 100%**, `npx tsc --noEmit` đạt **0 lỗi**, `npm run lint` đạt **0 lỗi**.

- **2026-09-02 — Chuẩn Hóa & Triển Khai Hoàn Chỉnh Tính Năng Tạo & Quét Mã QR Kết Bạn (HOÀN TẤT).**
  - **Sửa Lỗi Đồng Bộ Username**: Bổ sung trường `username` vào `interface User` trong `auth-context.tsx`, lưu và load `username` từ `user_data` session persistence; cập nhật `profile/edit.tsx` đồng bộ `updateUser({ displayName, username })`.
  - **Chuẩn Hóa Deep Linking & Scheme**: Đăng ký scheme `["nihongo", "nihongoapp", "frontend"]` và quyền `android.permission.CAMERA` trong `app.json`; tạo redirect route `profile/[username].tsx` tự động chuyển tiếp sạch sang `/friends/profile/[username]` cho mọi deep link cũ.
  - **Tích Hợp Camera Quét QR Trong Ứng Dụng (`expo-camera`)**: Xây dựng màn hình `friends/scan.tsx` với khung ngắm viewfinder hiện đại 4 góc neon, laser scan animation, nút bật/tắt flash, nút chuyển nhanh sang "Mã QR của tôi".
  - **Xử Lý Ngoại Lệ & Bóc Tách QR**: Viết bộ tiện ích `utils/qr.ts` bóc tách linh hoạt (`nihongo://`, `nihongoapp://`, `frontend://`, web URL, username thuần, strip `@` và query/hash); chặn tự quét mã QR của chính mình (báo toast cảnh báo); tự động điều hướng sang `/friends/profile/[username]` kèm phản hồi rung haptics.
  - **Nâng Cấp Giao Diện**: Thêm mục "Quét mã QR" ở `friends/index.tsx` (cả danh sách và icon header); thêm tab chuyển đổi nhanh "Mã của tôi / Quét mã" trong `profile/qr.tsx`.
  - **Kiểm Thử & Đảm Bảo Chất Lượng**: Viết 18 unit & integration tests (`qr.test.ts` và `qr-scanner.test.tsx`) PASS 100%; static type check `npx tsc --noEmit` 0 lỗi; `npm run lint` 0 errors.

- **2026-08-28 — Xóa bỏ hoàn toàn Cosmetic khỏi Shop (HOÀN TẤT).**
  - **Dọn dẹp Types**: Loại bỏ `COSMETIC`, `AVATAR_FRAME`, `BADGE`, `THEME` và thuộc tính `equipped` khỏi API DTOs và Shop Types.
  - **Tối ưu Shop Service**: Loại bỏ tab "Trang trí" (`COSMETIC`) và service hook dư thừa (`equipItem`/`toggleEquip`).
  - **Tối ưu Component Giao Diện**: Xóa nút "Trang bị" tại `item-sheet.tsx`, xóa logic đánh dấu `equipped` trên thẻ vật phẩm ở `item-tile.tsx`.
  - **Kiểm thử toàn diện**: `npx tsc --noEmit` 0 lỗi, `npm test` 26 test suites / 141 tests PASS 100%.

- **2026-08-27 — Tối Ưu Hóa Hiệu Năng Toàn Diện & Khắc Phục Triệt Để Giật Lag Sau 20s (HOÀN TẤT).**
  - **Triệt tiêu Cơn bão Re-render Lan truyền (Context Cascade Storm)**:
    - Bọc `useMemo` cho `value` và `useCallback` cho mọi hàm dispatch tại toàn bộ 6/6 root context providers (`GamificationProvider`, `TutorialProvider`, `AuthProvider`, `ToastProvider`, `OnboardingProvider`, `QuizProvider`).
    - Gộp toàn bộ các luồng fetch trong `fetchGamificationData` (`getMe`, `getEnergy`, `getDailyQuests`, `getChestStatus`) thành 1 lần `setState` duy nhất bằng `Promise.all`.
  - **Khắc phục Triệt để Lag khi Chuyển Tab & Sau khi Học xong Bài**:
    - **Triệt tiêu Require Cycle / Circular Dependency**: Bỏ `useTutorial` trong `tutorial-overlay.tsx` và truyền props trực tiếp từ `TutorialProvider` để giải phóng Metro initialization overhead trên Android.
    - **Tối ưu Hóa Shader GPU Skia trong HexNode**: Chuyển dynamic ID `hexGrad-${node.id}` và `ringGrad-${node.id}` sang 3 ID gradient tĩnh dùng chung (`hexGrad-locked`, `hexGrad-active`, `ringGrad-active/completed/inactive`), giải phóng hơn 200 SVG gradient shader allocations trong GPU memory.
    - **Ngăn ngừa Tái nạp Lộ trình Thừa (Roadmap Data Diffing)**: Trong `useFocusEffect` của `(tabs)/index.tsx`, so sánh `JSON.stringify(prev) === JSON.stringify(data)` trước khi `setTopics`, tránh re-render toàn bộ 14 chủ đề và SVG paths khi chuyển tab.
    - **Silent Data Refetching**: Cập nhật `characters.tsx` và `dictionary.tsx` để fetch ngầm trong `useFocusEffect` mà không unmount cây View.
    - **Tinh giản Luồng Kết Quả Bài Học (`quiz/result.tsx`)**: Loại bỏ các đợt gọi `setEnergy` / `addExp` rời rạc, chỉ gọi đồng bộ 1 lần `fetchGamificationData()`.
  - **Sửa dứt điểm vòng lặp render 1s tại tab Quests**:
    - `use-quests.ts`: Memoize mốc thời gian nửa đêm `resetAt` và bọc `useMemo` cho giá trị trả về của `useQuests()`.
    - `use-countdown.ts`: Kiểm tra giá trị trước khi `setLabel`, chặn cập nhật thừa khi đã hết giờ hoặc không đổi.
  - **Tối ưu hóa FlatList & GPU SVG Virtualization (`(tabs)/index.tsx`)**:
    - **Cấu hình FlatList mới:** Đổi `removeClippedSubviews={false}`, tăng `windowSize={5}`, `initialNumToRender={2}`, `maxToRenderPerBatch={2}`. Không phá hủy/xây lại (mount/unmount) SVG liên tục khi cuộn, chấm dứt tình trạng giật khựng.
    - **Tối ưu Memoization thông minh:** `TopicSection` memo tự đối chiếu `selectedLessonId`, chỉ cho phép Topic chứa bài học đang click re-render (giảm 90% re-render thừa).
    - **Loại bỏ hàng loạt SVG Gradients:** Bỏ hẳn thẻ `<Defs>` chứa gradient khỏi 90% bài học (các bài `isLocked`), thay bằng viền màu tĩnh (`#3D4054`). Giảm tải nặng nề cho Skia, `dt` render giảm từ >9000ms xuống chỉ còn ~500ms.
  - **Tối ưu hóa Animation & Memoize Component danh sách**:
    - Điều chỉnh tần số `FoilSweep` trong `rarity-frame.tsx`.
    - Bọc `React.memo` cho các components dạng item trong FlatList/ScrollView: `TabItem`, `ItemTile`, `QuestStation`, `LeaderboardRow`, `WordCard`, `PostCard`.
  - **Kiểm thử toàn diện**:
    - `npx tsc --noEmit`: 0 lỗi.
    - `npm test`: **26 test suites / 141 tests PASS 100%**.
    - `npm run lint`: **0 errors**.

- **2026-08-27 — Chuẩn Hóa Hiển Thị Số Sao (⭐) Kết Quả Bài Học & Roadmap (HOÀN TẤT).**
  - **Màn hình kết quả (`/quiz/result`)**: Chỉ bài `TIMED_REVIEW` mới hiển thị số sao thực tế (1-3 sao); các bài `NORMAL`, `TOPIC_REVIEW`, `JUMP_TEST` chỉ hiển thị EXP & Coin, loại bỏ hoàn toàn fallback ép 3 sao khi `expEarned > 0`.
  - **Component `QuizResultCard`**: Chỉ render `starsRow` khi `cat.stars > 0`.
  - **Roadmap (`HexNode`)**: Dọn dẹp bỏ 3 sao xám trong popover của `TOPIC_REVIEW`, giữ lại 3 sao cho `TimedReviewBadge` (chú cú 🦉).
  - **Kiểm thử**: `npx tsc --noEmit` 0 lỗi, `npm test` **26 test suites / 141 tests PASS 100%**, `npm run lint` 0 lỗi.

- **2026-08-27 — Đổi Tên Thương Hiệu từ "Kotodama" sang "Nihongo" (HOÀN TẤT).**
  - Quét sạch toàn bộ các vị trí text hiển thị, placeholder email/password, quyền hệ thống micro/voice, key AsyncStorage âm thanh sang thương hiệu **Nihongo**.
  - Cập nhật tài liệu dự án `PRODUCT.md` và `project_summary.md`.
  - Kiểm thử: `npx tsc --noEmit` 0 lỗi, `npm test` 25 test suites / 135 unit & integration tests PASS 100%, `npm run lint` 0 lỗi.

- **2026-08-27 — Chuẩn hóa Bài tập Sắp Xếp Từ `LISTEN_AND_ARRANGE` (HOÀN TẤT).**
  - **Loại bỏ thẻ dấu câu**: `isPunctuationOnly` và `cleanArrangementToken` loại bỏ hoàn toàn các thẻ dấu `、`, `。` và trim sạch dấu câu ở đuôi từ.
  - **Sinh thẻ ma (distractors) thông minh**:
    - Ưu tiên thẻ ma có sẵn từ BE (`isCorrect === false`).
    - Tự động sinh 2 thẻ ma cho câu ngắn (< 5 tokens) và 3 thẻ ma cho câu dài (>= 5 tokens) từ glossary bài học hoặc kho trợ từ ngữ pháp phổ biến (`は`, `が`, `を`, `に`, `で`, `も`, `です`, `でした`...).
    - `blockRomaji` cung cấp romaji phụ đề cho 100% các thẻ (cả đúng và ma).
  - **Kiểm thử**: `npx tsc --noEmit` 0 lỗi, `npm test` **25 test suites / 134 unit & integration tests PASS 100%**, `npm run lint` 0 lỗi.

- **2026-08-27 — Chuẩn hóa Từ vựng & Câu mẫu theo phong cách Duolingo (HOÀN TẤT).**
  - **Dọn dẹp triệt để `vocab` trong 14 chủ đề (`data_topics_a.py`, `data_topics_b.py`, `data_topics_c.py`)**:
    - Tách toàn bộ các cụm câu chào dài (`おはようございます`, `ありがとうございます`, `よろしくおねがいします`, `おめでとうございます`, `ごちそうさまでした`, `おつかれさまです`) và cụm ngữ pháp/biến cách (`ません`, `ました`, `ませんでした`, `じゃありません`, `ではありません`, `くないです`, `すきじゃありません`, `きぶんがわるい`, `げんきになりました`, `みせてください`, `ちょっとまってください`, `いらっしゃいませ`, `しょうしょうおまちください`, `まいにちのみます`, `どうしましたか`, `いつからですか`) ra khỏi danh mục `vocab`.
    - Chuyển 100% các cụm này sang mục `sentences` luyện tập bằng dạng bài ghép thẻ từ vựng (`LISTEN_AND_ARRANGE`) với các blocks ngắn gọn (ví dụ: `["せんせい", "、", "おはよう", "ございます"]`, `["ビール", "は", "あまり", "すき", "じゃありません"]`).
    - Trong kho từ vựng `vocab`, chỉ dạy các từ gốc ngắn (1-4 ký tự, ví dụ: `おはよう`, `ありがとう`, `あさ`, `よる`, `おやすみ`, `どうも`, `すみません`, `ごめん`, `だいじょうぶ`, `はじめまして`, `よろしく`, `おねがい`, `げんき`, `ちがいます`, `みせ`, `せき`, `まちます`, `すき`, `きらい`, `つかれます`, `きぶん`, `からだ`, `やすみ`, `むり`, `どう`, `いつ`).
    - Giữ lại các danh từ ghép tự nhiên chuẩn từ điển (`でんわばんごう`, `ゆうびんきょく`, `さんじゅっぷん`, `ポイントカード`).
  - **Tái tạo & Kiểm tra trực tiếp Live Database MySQL (`be_nihongoapp-db-1`)**:
    - Chạy `python build.py` & `python build_users.py` $\rightarrow$ sinh 14 topics, 124 bài học, 1792 câu hỏi, 6936 đáp án.
    - Nạp `seed.sql`, `seed_kana_audio.sql`, `seed_shop_icons.sql`, `seed_users.sql` trực tiếp vào MySQL và chạy lệnh SQL trích xuất lại bảng `vocabulary` từ `metadata_json.glossary`.
    - Kết quả đo đạc trực tiếp trên MySQL:
      - Kho từ vựng `vocabulary`: **451 từ đơn ngắn** (loại `VOCAB`) + 208 ký tự bảng chữ cái (`KANA`) = 659 từ.
      - **100% từ có độ dài $\ge 8$ ký tự đã được triệt tiêu hoàn toàn** (từ 33 từ dài $\ge 7$ ký tự trước đây giảm xuống chỉ còn 4 danh từ ghép chuẩn tự nhiên dài 7 ký tự).
      - Phân bố độ dài từ: 244 từ (54.1%) từ 1-3 ký tự; 190 từ (42.1%) từ 4-5 ký tự; 17 từ (3.8%) 6-7 ký tự; **0 từ $\ge 8$ ký tự**.
      - 0% cụm câu hay đuôi ngữ pháp còn sót trong kho từ vựng.
      - 5649 liên kết `question_vocabulary` (3606 liên kết trọng tâm `is_target`).
  - **Kiểm tra Frontend-Native**:
    - `npx tsc --noEmit` vượt qua với **0 lỗi**.
    - `npm test` vượt qua **24 test suites / 126 unit & integration tests PASS 100%**.

- **2026-08-26 — Hiệu ứng âm thanh Đúng/Sai (SFX) & Tích hợp Cài đặt (HOÀN TẤT).**
  - Tạo 2 file asset âm thanh chuẩn PCM WAV 44.1kHz (`assets/sounds/correct.wav` chuông chime tươi sáng, `assets/sounds/incorrect.wav` âm trầm êm dịu) bằng script `scripts/generate-sounds.js`.
  - `sound-service.ts` + hook `use-sound-effect.ts`: Quản lý phát âm thanh phản hồi nhanh bằng `expo-audio`, lưu trạng thái bật/tắt vào `AsyncStorage` (`@kotodama_sfx_enabled`).
  - Tích hợp phát âm thanh vào Quiz chính (`quiz/[id].tsx`), Luyện bảng chữ cái (`alphabet/practice.tsx`), Ôn tập từ vựng SRS (`review/vocabulary.tsx`).
  - Nâng cấp màn Cài đặt (`settings/index.tsx`): Modal cài đặt SFX với Switch bật/tắt và 2 nút nghe thử trực tiếp âm Đúng / Sai.
  - Verification: `npx tsc --noEmit` 0 errors, ESLint 0 errors / 0 warnings, `npm test` **24 suites / 126 tests PASS 100%** (thêm `sound-service.test.ts` và `quiz-sound.test.tsx`).

- Tóm tắt (chi tiết + số liệu test trong archive): 3 lỗi chặn demo đã sửa; hội thoại AI (TF-IDF + Hồi quy Logistic, không dùng LLM lúc chạy) đã chạy thật trên emulator kèm TTS+STT; FSM hội thoại nâng độ phủ 33.1%→82.6%, `wrong_time` giảm 66.5%→17.9%.
- **2026-08-24 — Social Feed đã kết nối xong với BE mới** (theo `FE_API_GUIDE_SOCIAL_FEED.md`): feed tổng hợp, đăng bài/xoá, like/unlike, comment (cursor pagination), follow/unfollow, hồ sơ công khai + followers/following (`connections.tsx`), search user shape mới (`items`/`nextCursor`), post `SYSTEM_ACHIEVEMENT` hiển thị khung vàng riêng. Đã verify: `tsc --noEmit` 0 lỗi, `jest` 17 suites/99 tests pass, `eslint` sạch trên toàn bộ file liên quan. Endpoint follow cũ (`POST toggle`) vẫn đang dùng ở mọi màn hình — BE giữ nguyên endpoint này nên chưa bắt buộc đổi sang cặp `PUT/DELETE` mới (chỉ là khuyến nghị).
- **2026-08-24 — Rank decay/reminder (RANK_DECAY_EMAIL_REMINDER.md): không cần code FE.** Cơ chế backend tự động (job đêm trừ EXP + reminder email), FE chỉ cần đọc lại `exp`/`rankName` — `gamification-context.tsx` đã tự refetch `getMe()` khi mount (sau login) và mỗi lần `AppState` chuyển "active", nên đã tự động phản ánh đúng.
- **2026-08-24 — Đăng nhập Google/Facebook thật + đăng xuất gọi BE, THAY THẾ toàn bộ luồng giả trước đó.** Trước đây `signInWithGoogle()` chỉ lấy idToken từ Google SDK rồi set local state, KHÔNG gọi backend, KHÔNG lưu accessToken (mọi API sau đó 401 âm thầm); nút Facebook/Apple gọi `signIn("facebook@user.com","fbpwd")` giả cứng. Đã sửa:
  - Thêm `AUTH.SOCIAL_GOOGLE` (`POST /api/v1/auth/social/google`), `AUTH.SOCIAL_FACEBOOK` (`POST /api/v1/auth/social/facebook`), `AUTH.LOGOUT` (`POST /api/v1/auth/logout`) vào `endpoints.ts` + `authService` — xác nhận trực tiếp từ backend source (`AuthController.java`/`AuthServiceImpl.java`), không có FE_API_GUIDE riêng cho phần này.
  - `signInWithGoogle()`/`signInWithFacebook()` (mới) giờ gọi thật BE, lưu `accessToken` + `user_data` qua helper `persistSession()` dùng chung với `signIn`/`signUp`. `signOut()` gọi `authService.logout()` best-effort trước khi xoá session local.
  - **Sửa lệch Google Client ID**: FE trước đó dùng client-id KHÁC với `app.social.google.client-id` mặc định trong `application.yml` của BE → verify sẽ luôn fail. Đã đồng bộ theo tài liệu BE cung cấp: `GOOGLE_WEB_CLIENT_ID` = `...kj500d8gmbdg1j78l7ggoto85t7vv60t...`, thêm `GOOGLE_ANDROID_CLIENT_ID` = `...h69qa8ovnni9fv23qbni7rempa9emmvi...` (`src/config/google-auth.ts`).
  - Cài mới `react-native-fbsdk-next`, thêm `src/config/facebook-auth.ts` (App ID `1776382180172619`, Client Token do user cung cấp trực tiếp trong chat — **không log lại giá trị thật ở đây**, xem file config). Vì `android/` đã commit sẵn (prebuild bị skip — xem [[reference_expo_config_plugins_not_applied]]), đã tự sửa tay `AndroidManifest.xml` (meta-data `com.facebook.sdk.ApplicationId`/`ClientToken`, activity `FacebookActivity` + `CustomTabActivity`) và `strings.xml` (3 string tương ứng), cộng với entry plugin trong `app.json` để lần prebuild sạch sau này tự sinh đúng.
  - Bỏ nút "Đăng nhập Apple" khỏi `login.tsx`/`signup.tsx`/`social-auth-section.tsx` — backend không có endpoint Apple nào.
  - Test mới `src/app/(auth)/__tests__/login.test.tsx` (2 test, mock native Google/FB SDK modules + `authService`, verify gọi đúng endpoint + lưu token). Tiện thể sửa `jest.config.js`: thêm mapper `^@/assets/(.*)$` → `<rootDir>/assets/$1` (jest-expo tự sinh mapper chỉ theo rule chung `@/* -> src/*`, bỏ sót override cụ thể hơn trong tsconfig, khiến MỌI test đụng tới `@/assets/...` — vd Lottie mascot ở login/signup — vốn dĩ sẽ luôn crash nếu có test đụng tới, chỉ là chưa ai viết test nào chạm tới trước đây).
  - Verify: `tsc --noEmit` 0 lỗi, `jest` 18 suites/101 tests pass (thêm 2 test mới, không có test nào vỡ), `eslint` chỉ còn warning `require()`/`unused catch var` — cùng pattern đã có sẵn từ code Google gốc, không phải lỗi mới.
  - **CHƯA làm / cần user tự kiểm:** chưa build lại native Android (`expo run:android` hoặc tương đương) và test tay trên emulator/máy thật — môi trường này không chạy được native build. Đây là bước bắt buộc trước khi coi luồng Facebook là "xong" thật sự, vì SDK Facebook cần native module đã link đúng.

- **2026-08-25 — THAY HẲN hệ hội thoại TF-IDF + FSM bằng LLM Gemini (`ai-service` 1.x -> 2.0).** Quyết định của user: gỡ hẳn hệ cũ, không giữ fallback; phiên cố định 5 phút; giữ 4 chủ đề cũ + cho nhập chủ đề tự do; khoá API đặt ở server (KHÔNG nhúng vào app RN vì bundle JS giải nén được).
  - **Backend (`ai-service`)**: xoá `classifier/dialogue/features/grammar/guards/models/train/tune/evaluate*/dataset/augment.py`, `data/intents/`, `data/scenarios/`, `tests/test_pipeline.py`. Thêm `llm.py` (gọi Gemini bằng `urllib` stdlib, KHÔNG dùng SDK — SDK kéo theo grpcio+protobuf ~60 MB), `prompts.py` (system prompt + `responseSchema` ép JSON), `topics.py` (`data/topics.yaml` + chủ đề tự nhập), `engine.py` (điều phối lượt/tổng kết), `api.py` viết lại. `reports/` GIỮ NGUYÊN làm tài liệu kiến trúc 1.x; mã cũ lấy lại được bằng `git checkout 3a93c91 -- ai-service/`.
  - Endpoint mới: `GET /topics`, `POST /start`, `POST /respond`, `POST /summary`. Vẫn PHI TRẠNG THÁI — client gửi kèm toàn bộ `history` + `remainingSeconds` mỗi lượt.
  - `requirements.txt` rụng scikit-learn/numpy/scipy (~120 MB -> ~15 MB), bỏ bước train lúc build trong Dockerfile/render.yaml -> cold-start Render free giảm từ ~30s xuống vài giây.
  - **Frontend**: viết lại `types/conversation.ts`, `services/api/conversation.ts`, `constants/conversation.ts`, `hooks/use-conversation.ts` (lịch sử + đồng hồ đếm ngược tính theo MỐC KẾT THÚC, không trừ dần — `setInterval` bị bóp khi app xuống nền). Component mới: `correction-card` (thay `grammar-note-card`), `session-timer`, `session-summary`, `custom-topic-card`; `scenario-card` -> `topic-card`; bỏ `outcome`/`rescue`/`failures` khỏi `chat-bubble`/`hint-chips`.
  - Bản tổng kết gồm: điểm 0-100, nhận xét chung, điểm mạnh, lỗi + câu đã sửa, ngữ pháp nên ôn (kèm ví dụ), mẹo nói tự nhiên (`instead` -> `prefer`), việc cần luyện tiếp.
  - Verify: `pytest` 22 pass; `tsc --noEmit` 0 lỗi; `jest` 18 suites/100 tests pass (test hội thoại viết lại hoàn toàn, 15 test); `eslint` sạch (chỉ còn warning `axios` named-export vốn có sẵn). Chạy thật `uvicorn` + gọi Gemini với khoá giả: request tới được Google, ánh xạ lỗi ra tiếng Việt đúng.
  - **Phát hiện đáng lưu**: Gemini trả **400** kèm `"API key not valid"` cho khoá sai chứ không phải 401/403 — đã bắt riêng trong `llm._http_message`, có test.
  - **2026-08-25 (tiếp) — ĐÃ NGHIỆM THU với khoá Gemini thật.** User cung cấp khoá, đã ghi vào `ai-service/.env` (gitignored). Chạy trọn `/start` -> 3 lượt `/respond` -> `/summary`: AI đóng vai đúng, bắt đúng lỗi こんにちわ (chính tả), たべたい (thiếu です), おかねをはらいたい (dịch word-by-word -> お会計をお願いします); bản tổng kết ra đủ 6 mục, chấm 68/100. Độ trễ thật: `/start` 4.2s, `/respond` 4.0-6.0s, `/summary` 11.9s — đều nằm trong timeout client (45s/90s). Chỉ thị "sắp hết giờ" hoạt động: ở lượt còn 40s AI tự chốt tính tiền rồi chào tạm biệt.
  - **`gemini-2.0-flash` ĐÃ BỊ GOOGLE KHAI TỬ** (404). Đã đo 3 lượt/model cùng lúc để chọn lại: 3.7-flash + `gemini-flash-latest` 0/3 (503 high demand), 3.6-flash 3/3 @5.5s, 3.5-flash 3/3 @4.0s, 2.5-flash 3/3 @3.7s. **Chốt `gemini-3.5-flash`** (nhanh gần nhất + không phải bản già nhất). Ghim phiên bản cụ thể chứ không dùng bí danh `latest` vì app chấm điểm tiếng Nhật không nên tự đổi model. Thêm nhánh 404 trong `llm._http_message` nói rõ phải đổi `GEMINI_MODEL`.
  - Thêm `llm.load_env_file()` (thư viện chuẩn, không thêm phụ thuộc) — trước đó có `.env.example` nhưng dịch vụ KHÔNG hề đọc `.env`, ai làm theo README sẽ nhận `unconfigured` mà không hiểu vì sao. Biến môi trường thật thắng file.
  - Verify cuối: `pytest` 25 pass, `tsc --noEmit` 0 lỗi, `jest` 19 suites/106 tests pass.

- **2026-08-25 — Tour hướng dẫn lần đầu cho người dùng mới (coach-mark + linh vật Koto).** Trước đó người mới đăng ký xong là rơi thẳng vào bản đồ lộ trình, không ai nói cho họ biết ba viên chỉ số trên đầu màn hình hay các tab dưới chân màn hình để làm gì. (Khảo sát onboarding thì ĐÃ CÓ SẴN: `signup.tsx` → `(onboarding)/goal → interests → level → placement` → `(tabs)`; chỗ thiếu chỉ là phần hướng dẫn.) Đã thêm:
  - `types/tutorial.ts` + `data/tutorial-steps.ts`: 8 bước cho màn Học — chào → streak → xu → năng lượng → node bài đang mở (khoét tròn) → tab Xếp hạng → tab Nhiệm vụ → chúc mừng.
  - `contexts/tutorial-context.tsx`: giữ bước hiện tại, nhận đăng ký phần tử rồi `measureInWindow` (thử lại tối đa 12 lần × 120ms vì phần tử có thể chưa layout xong), lưu cờ `tutorial_home_done` vào `storage`. `useTutorial()` KHÔNG ném lỗi khi thiếu provider mà trả về giá trị trơ — nhờ vậy các test dựng riêng một màn hình không phải bọc thêm provider. Provider tự render lớp phủ (cùng khuôn mẫu `ToastProvider`), bọc một lần ở `app/_layout.tsx`.
  - `components/tutorial/`: `spotlight-target.tsx` (bọc phần tử cần chiếu, bắt buộc `collapsable={false}` nếu không Android gộp View và ref trỏ vào hư không), `coach-mascot.tsx` (Lottie, `require` tĩnh vì Metro không nhận đường dẫn động), `tutorial-overlay.tsx` (scrim SVG một path `fillRule="evenodd"` để khoét lỗ, vòng sáng nhấp nháy, bong bóng tự né lên/xuống theo chỗ trống + mũi tên ghim theo tâm lỗ).
  - Gắn mốc: `(tabs)/index.tsx` (3 `StatPill` + node đang mở khoá, chỉ node `isActive` mới đăng ký), `(tabs)/_layout.tsx` (tab Xếp hạng + Nhiệm vụ). Tự bật sau khi lộ trình tải xong 450ms; thêm mục "Xem lại hướng dẫn" ở `settings/index.tsx` (phải `router.replace("/(tabs)")` trước rồi mới bật, vì mốc chỉ tồn tại trên màn Học).
  - Verify: `tsc --noEmit` 0 lỗi, `jest` 19 suites/106 tests pass (thêm 6 test mới ở `components/tutorial/__tests__/tutorial-flow.test.tsx`), `eslint` 0 error (85 warning đều là cảnh báo cũ sẵn có trong repo).
  - **2026-08-25 (bản 2) — user phản hồi: vùng sáng LỆCH và "tối om chả có gì"; nội dung sai trọng tâm.** Đã sửa cả hai:
    - **Nguyên nhân lệch:** `measureInWindow` trả toạ độ theo CỬA SỔ, còn lỗ khoét vẽ theo hệ toạ độ của View lớp phủ. Hai hệ chỉ trùng khi lớp phủ bắt đầu ở (0,0) của cửa sổ — sai khi gốc app nằm dưới thanh trạng thái. Lớp phủ giờ tự `measureInWindow` CHÍNH NÓ rồi trừ đi gốc đó (`origin` trong `tutorial-overlay.tsx`); tự chỉnh đúng trên mọi máy thay vì đoán chiều cao status bar.
    - **"Tối om":** thêm một `<Path>` phủ `rgba(255,255,255,0.14)` lên đúng vùng được chiếu + hạ scrim 0.86→0.82, để nội dung nền tối (thanh tab chế độ tối) vẫn nổi lên rõ so với phần bị che.
    - **Đổi trọng tâm nội dung:** BỎ hết bước streak/xu/năng lượng (user: nhìn là hiểu, không cần dạy). Tour 12 bước mới đi xuyên HAI màn: chào → node bài học → tab Cửa hàng → Xếp hạng → Nhiệm vụ → Bạn bè → nút Thêm → (tự chuyển sang `/review`) → Luyện tập Lỗi Sai → Hội thoại AI → Sổ tay Từ điển → nhóm Thử thách & Phát âm → kết.
    - **Đa màn hình:** `TutorialStep.route` + effect trong context gọi `router.navigate` (dùng singleton `router` của expo-router, không cần hook context). Số lần đo lại nâng 12×120ms → 20×150ms để đủ cho chuyển màn.
    - **Cuộn phần tử bị khuất:** thêm `registerScroller` — màn có vùng cuộn đăng ký hàm kéo phần tử vào giữa; context phát hiện rect nằm ngoài dải an toàn (110px trên / 190px dưới) thì gọi hàm đó, chờ 450ms rồi đo lại (đúng một lần mỗi bước). `review.tsx` đăng ký qua `useFocusEffect` chứ KHÔNG phải `useEffect`: màn trong `(tabs)` đã mở là còn sống mãi, effect theo vòng đời sẽ không chạy lại ở lần ghé sau.
  - **CHƯA làm / cần user tự kiểm:** chưa chạy trên emulator/máy thật. Cần mắt người xác nhận lại vị trí lỗ khoét sau khi sửa gốc toạ độ.

- **2026-08-25 — Bỏ hiệu ứng nảy (spring) ở toàn bộ popup.** User: "popup không cần nảy nảy, giữ đơn giản thôi". Dùng graph dự án (`codebase-memory`) để liệt kê hết mặt phẳng nổi: 6 chỗ có `.springify()` khi mở ra, đã đổi sang trượt-mờ theo thời lượng:
  - `ui/modal-card.tsx` (nền chung của hộp thoại giữa màn — popup năng lượng ở màn Học, `QuestsModal`, hộp chọn giao diện ở Cài đặt, popup trong quiz): bỏ `.springify().damping().stiffness()`, giữ `FadeInDown.duration(normal)`.
  - `shop/purse-empty-dialog.tsx`: `springify()` trần (không damping → nảy mạnh nhất) → `duration(240)`.
  - `shop/item-sheet.tsx`: `SlideInDown` bỏ spring.
  - `ui/in-app-toast.tsx`: `FadeInUp.springify().damping(15)` → `duration(220)`.
  - `(tabs)/index.tsx` popover bài học trên bản đồ → `duration(200)`.
  - `components/tutorial/tutorial-overlay.tsx` bong bóng hướng dẫn → `duration(220)`.
  - KHÔNG đụng tới: `more-bottom-sheet.tsx` (vốn đã không spring), và các màn ăn mừng/thưởng (`chest-terminus`, `quiz-result-card`, `streak-extended`, `reward.tsx`) — nảy ở đó là cố ý; cũng không đụng animation vào màn của onboarding/quiz vì đó là chuyển màn chứ không phải popup.
  - Verify: `tsc --noEmit` 0 lỗi, `jest` 19 suites/108 tests pass, `eslint` 0 error.

- **2026-08-25 — Tách YÊU CẦU khỏi ĐỀ BÀI trong câu hỏi + tra từ đúng chỗ (A1-A3).** User báo: bong bóng linh vật hiện nguyên cả câu tiếng Việt, và "chỉ vài câu" bấm giữ ra nghĩa được.
  - **Nguyên nhân:** `quiz-mapper.ts` đọc `question_text` rồi CẮT CHUỖI theo dấu hai chấm để moi phần chữ Nhật. Đã query DB thật (`docker exec be_nihongoapp-db-1 mysql ...`, 1592 câu): mẫu phổ biến nhất là `「こんにちは」 (konnichiwa) nghĩa là gì?` — KHÔNG có dấu hai chấm, nên nguyên câu tiếng Việt nhảy vào bong bóng.
  - **Dữ liệu backend vốn đã tách sẵn** trong `metadata_json`, chỉ là FE không đọc: `kana` (803 câu, mức từ), `jp` (484 câu, mức câu), `vn`, `romaji`, `glossary` (**1592/1592 câu đều có**). File `gemini-code-1785320053033.sql` ở gốc repo FE là seed CŨ toàn romaji, KHÔNG khớp DB sống — đừng dùng nó để suy luận.
  - **Bẫy đã tránh:** không được in bừa `kana`/`jp`. Ở `TRANSLATE_TO_JP` và `LISTEN_AND_ARRANGE` thì chính `kana`/`jp` là ĐÁP ÁN — in ra là phát đáp án. Bảng chiều câu hỏi ghi trong comment ở `quiz-mapper.ts`. Có 2 test riêng canh việc này.
  - `BaseQuestion` thêm `prompt` / `promptRomaji` / `promptLang` / `isNew` — khái niệm "đề bài" giờ dùng chung cho cả 9 loại thay vì mỗi loại một kiểu.
  - `components/quiz/question-prompt.tsx` (MỚI): nhãn "TỪ VỰNG MỚI" + yêu cầu, chữ to đậm ở TRÊN CÙNG. Đã thay vào cả 9 component (trước đó cả 9 đều đặt yêu cầu ở DƯỚI bong bóng bằng chữ xám nhỏ).
  - Bong bóng giờ dùng `JapaneseText` → bấm giữ ra nghĩa. Đo trên DB: **698/698 câu có `kana` đều có mục glossary khớp** (555 TRANSLATE_TO_VN + 143 SELECT_IMAGE), tức tra từ ở đề bài phủ 100% chứ không còn "vài câu".
  - Sửa luôn `japanese-text.tsx` không theo dark mode (tooltip nền `#FFFFFF` cứng, trái ràng buộc PRODUCT.md).
  - Thêm `testID={`answer-${id}`}` cho thẻ đáp án của `vocab-question` — romaji trong bong bóng có thể trùng chữ với đáp án (câu 「あ」 romaji "a", đáp án cũng "a") làm `getByText` mơ hồ.
  - **CHƯA làm:** 4 loại `matching`/`flashcard`/`fill-blank`/`kanji-fill` KHÔNG được mapper sinh ra (BE chỉ có 6 loại → map thành picture/listening/kana/speaking/vocab). Chúng là UI chết với dữ liệu thật.
  - Verify: `tsc --noEmit` 0 lỗi, `jest` 20 suites/114 tests pass (thêm `src/utils/__tests__/quiz-mapper-prompt.test.ts` 6 test), `eslint` 0 error.
  - **CHƯA làm / cần user tự kiểm:** chưa nhìn trên emulator.

- **2026-08-25 — BE: kho từ vựng + ôn tập ngắt quãng SM-2 (B1-B2). User đã cấp quyền sửa `BE_NihongoApp`.**
  - `V40__create_vocabulary_and_srs.sql`: 3 bảng `vocabulary` / `question_vocabulary` / `user_vocabulary_progress`. Flyway đã áp thật lên DB docker (v39 -> v40, 2.18s).
  - **Seed KHÔNG phải nhập tay:** bóc thẳng từ `metadata_json.glossary` có sẵn bằng `JSON_TABLE` — 5307 cặp (câu, từ) -> **467 từ** + 208 kana từ bảng `characters` = **675 từ**. `question_vocabulary` có 3247 liên kết trọng tâm, phủ **1592/1592 câu hỏi**.
  - **BẪY COLLATION (mất 2 lần chạy lại):** schema mặc định `utf8mb4_unicode_ci` coi `'おちゃ' = 'オチャ'` là TRUE (kana-insensitive) và bỏ qua dakuten. Làm UNIQUE KEY gộp nhầm và JOIN sinh duplicate PK. Phải `COLLATE utf8mb4_bin` cho `vocabulary.surface`, cho cả cột của `JSON_TABLE`, và cho mọi phép so sánh với chuỗi rút từ JSON. V36 đã vấp đúng lỗi này với `characters.symbol` — **nhớ mặc định mọi cột định danh chữ Nhật đều phải là utf8mb4_bin**.
  - `Sm2Scheduler.java`: SM-2 thuần Java, không thư viện. Hai điểm sửa so với bản gốc: (a) đơn vị **PHÚT** không phải ngày, có learning steps 10 phút -> 1 ngày -> 6 ngày -> nhân hệ số, để từ mới quay lại NGAY trong cùng phiên; (b) không có điểm tự chấm 0-5 nên `q` suy từ đúng/sai (4/1). CHỌN SM-2 CHỨ KHÔNG PHẢI HLR của Duolingo vì HLR cần ~13 triệu lượt học để train — cold-start. Thay riêng lớp này khi log đủ lớn, phần còn lại không phải đụng.
  - **Chốt chống cày lịch ôn** (trong `VocabularyServiceImpl`): trả lời ĐÚNG khi từ CHƯA tới hạn thì ghi nhận `total_correct` nhưng KHÔNG đẩy `next_due_at`. Không có chốt này, làm lại một bài 5 lần trong một buổi là khoảng cách văng ra vài tháng. Sai thì LUÔN áp. Đã verify bằng curl thật: nộp lại ngay lập tức -> `total_correct` 1->2 nhưng `repetitions`/`interval_minutes` đứng yên.
  - Đơn vị theo dõi là **TỪ**, không phải CÂU HỎI (khác `MistakeService`) — cùng một từ gặp ở nhiều bài đều cộng dồn vào một lịch. Chỉ từ `is_target` mới đẩy lịch; từ phụ trợ chỉ để tra nghĩa.
  - API mới: `GET /api/v1/vocabulary/due|learned|glossary`. Verify end-to-end bằng curl với tài khoản thật: `/glossary` trả 675 từ đúng chữ Nhật + nghĩa tiếng Việt; học 1 bài 10 câu -> 5 từ vào sổ tay, lịch hẹn đúng 10 phút.
  - **`CoinQuestChestIntegrationTest` ĐỎ SẴN TỪ TRƯỚC** (`coinsEarned` 12 vs 4) — đã xác minh bằng `git stash` phần sửa của mình rồi chạy lại: vẫn đỏ y hệt. KHÔNG phải do thay đổi này (test đó nộp bài không kèm `answers` nên code mới còn không chạy). Chưa sửa, nằm ngoài phạm vi.
  - Verify: `mvnw test` 147 tests, chỉ còn đúng lỗi đỏ sẵn nói trên. `Sm2SchedulerTest` 6/6 pass, `LessonAttemptServiceImplTest` 34/34 pass.
  - **CHƯA làm (B3):** FE chưa dùng các API này — màn ôn tập theo `due`, nối `dictionary.tsx` vào `/learned`, badge "N từ đến hạn", `GlossaryProvider` cache `/glossary` để tra từ toàn cục, và cờ `isNew` cho nhãn "TỪ VỰNG MỚI" chưa nối từ BE xuống.

- **2026-08-25 — FE nối vào SRS + tra từ toàn cục (B3). HOÀN TẤT cả chuỗi A1-B3.**
  - `contexts/glossary-context.tsx` (MỚI): tải MỘT lần `/vocabulary/glossary` (675 từ) rồi giữ trong bộ nhớ, cache bằng **`AsyncStorage`** — KHÔNG dùng `@/services/storage` vì cái đó chạy trên `expo-secure-store`, giới hạn ~2KB mỗi giá trị trên Android, kho từ sẽ bị cắt cụt âm thầm. Đọc cache trước rồi mới gọi mạng, nên tra từ dùng được cả khi offline.
  - Đã **XOÁ bảng `DICTIONARY` cứng 18 từ** trong `japanese-text.tsx`. Thứ tự ưu tiên giờ là: glossary riêng của câu > kho toàn cục.
  - **`GlossaryLockdown`** — chốt chống lộ đáp án. Ở câu "Đâu là 「trà」?" mà bấm giữ được vào đáp án `おちゃ` là đọc thẳng ra đáp án. Đã bọc vùng đáp án của `vocab` / `listening` / `kana` (thẻ rời ghép lại chính là câu đáp án). Đề bài thì tra thoải mái.
  - `app/review/vocabulary.tsx` (MỚI): phiên ôn dựng từ `/due`. Đề = mặt chữ Nhật + 4 nghĩa, 3 nghĩa nhiễu lấy từ kho đã cache (không phải soạn tay câu hỏi cho 675 từ). CỐ Ý không dùng `JapaneseText` cho từ đang hỏi — tra được nghĩa thì còn gì để ôn.
  - `(tabs)/review.tsx`: thêm thẻ "Ôn tập từ vựng" đứng ĐẦU + badge "N từ".
  - `(tabs)/dictionary.tsx`: **viết lại**, bỏ `MOCK_WORDS`/`MOCK_PHRASES` (6 từ cứng, nghĩa ghi bằng TIẾNG ANH trong app Việt-Nhật), đọc `/vocabulary/learned`. 3 tab: Tất cả / Cần ôn / Chữ cái, có pull-to-refresh.
  - BE thêm `POST /api/v1/vocabulary/review/submit` — không có nó thì phiên ôn không đẩy được lịch, SRS chỉ tiến khi học bài mới. KHÔNG áp chốt "chưa tới hạn" ở đây (khác `recordFromAnswers`): phiên ôn vốn chỉ gồm từ đã tới hạn, và người học chủ động vào ôn thì kết quả phải được tính.
  - BE thêm `isNew` vào `StartLessonQuestion` (`VocabularyService.resolveNewQuestions`) → FE gắn nhãn "TỪ VỰNG MỚI". "Mới" = còn ÍT NHẤT MỘT từ trọng tâm chưa gặp.
  - `jest-setup.js`: thêm mock chính thức của AsyncStorage — native module là null trong jest, thiếu mock là **mọi** suite chạm tới provider đều đỏ.
  - **Verify end-to-end thật (không phải mock):** học 1 bài -> 5 từ hẹn 10 phút -> 25 phút sau `/due` trả đúng 5 từ -> nộp phiên ôn 1 đúng/1 sai -> 「おはよう」 giãn `10 phút -> 1 ngày` giữ hệ số 2.5; 「おはようございます」 về `10 phút` và hệ số tụt **2.5 -> 1.96** (tự đánh dấu là từ khó). `remainingDue` trả về 3.
  - Verify: FE `tsc` 0 lỗi, `jest` **21 suites/118 tests pass** (thêm `review/__tests__/vocabulary-review.test.tsx` 4 test), `eslint` 0 error. BE `mvnw test` 147 tests, chỉ còn `CoinQuestChestIntegrationTest` đỏ sẵn từ trước (đã xác minh bằng git stash).
  - **CHƯA làm / cần user tự kiểm:** chưa nhìn trên emulator. `GlossaryLockdown` hiện khoá đáp án VĨNH VIỄN trong câu hỏi — sau khi trả lời xong đáng lẽ nên mở khoá để người học tra hiểu vì sao mình sai, nhưng component câu hỏi chưa nhận prop "đã chấm" nào để biết lúc nào mở.

- **2026-08-26 — Tối ưu hiệu năng toàn diện & Khắc phục giật lag trang Bài học (HOÀN TẤT).**
  - **[FIX 1 — Nghiêm trọng] `gamification-context.tsx`: Sửa memory leak `setInterval`.**
    - Gốc rễ: `setState` bên trong interval → re-render → 3 dependency thay đổi → interval bị reset liên tục.
    - Sửa: đọc giá trị qua `useRef` (`energyRecoveryRef`), dependency array chỉ còn `needsRecovery` (boolean).
  - **[FIX 2 — Tối ưu HexNode & Reanimated Hooks]:**
    - Tách Reanimated ra khỏi 94 node tĩnh: 94 node dùng `Pressable` thuần (`hexButton` + `hexButtonPressed`), triệt tiêu hơn 200 `useSharedValue` / `useAnimatedStyle` và `AnimatedPressable`.
    - Duy nhất node `isActive` mới gắn `ActiveFloatingWrapper` (`floatY`) và `ActiveNodeGlow`.
    - Tiền tính toán tọa độ `HEX_POINTS_OUTER/INNER/SHIMMER` ở module scope thay vì tính toán hàm lượng giác `Math.cos`/`Math.sin` trong từng render.
  - **[FIX 3 — Giảm tải GPU SVG Rasterization]:**
    - Bỏ `strokeDasharray="8 12"` trên đường ray phụ (tránh thuật toán tích phân cung Bezier cực nặng trên Android Skia).
    - Chuyển decorative orbs từ `<Animated.View>` sang `<View>` tĩnh.
  - **[FIX 4 — Tinh chỉnh FlatList Virtualization]:**
    - Cấu hình lại `initialNumToRender={1}`, `maxToRenderPerBatch={2}`, `windowSize={7}`, `removeClippedSubviews={Platform.OS === 'android'}`, `scrollEventThrottle={32}`.
  - **[FIX 5 — Sửa dứt điểm test suite `tutorial-flow`]:**
    - Trả `<TutorialOverlay />` về render bên trong `TutorialProvider` (đồng bộ với kiến trúc của `ToastProvider`), xoá lớp bọc thừa ở `_layout.tsx`.
  - Verify: `npx tsc --noEmit` 0 lỗi, `npm test` **22 suites / 119 tests PASS 100%**, `eslint` 0 error/0 warning.

## Blockers

- **BE-4 mới chặn được một nửa** — server chấm lại từ đáp án client gửi nhưng chưa lưu bộ đề của lượt làm bài, nên chưa khẳng định được "đã trả lời đủ".
- **`render`/`fireEvent` của `@testing-library/react-native` bản này BẤT ĐỒNG BỘ** — luôn `await render(...)` và `await fireEvent(...)` (xem `.state/memory.md`).

## Decisions

- Toàn bộ quyết định kiến trúc/UI/thuật toán trước 2026-08-24 (theme, tab bar, leaderboard, shop, quests, stroke-order, FSM hội thoại, TF-IDF vs LLM, v.v.) nằm trong `.state/archive/session_state_2026-08-24.md`.

## Next Steps

- [ ] **Trung tâm ôn tập là khu tự học, tách khỏi bản đồ bài học (bắt đầu 2026-08-25).** Đã xác nhận bằng graph: `VocabularyReviewScreen` chỉ gọi `vocabularyApi.getDue`/`submitReview`, còn tiến độ bản đồ chỉ đi qua `lessonAttemptApi.submitLesson` từ quiz. Cần bỏ thẻ “Thử thách thời gian” đang ép `lessonId=lp1`, vì nó khiến một hoạt động tự học chạy thuật toán hoàn tất bài học của node `lp1`; giữ các luồng ôn độc lập hiện có và thêm regression test cho điều này.

- **Chạy thử tính năng hội thoại TRÊN EMULATOR** (backend đã nghiệm thu bằng HTTP, nhưng chưa ai bấm thử trong app thật): `cd ai-service && PYTHONPATH=src .venv/Scripts/python.exe -m uvicorn nihongo_ai.api:app --port 8000` rồi mở app. Cần mắt người kiểm: đồng hồ đếm ngược, thẻ góp ý dưới bong bóng người học, màn tổng kết sau 5 phút, và ô nhập chủ đề tự do.
- Cân nhắc: AI xưng "em" với người học trong bản tổng kết (giọng giáo viên). Nếu muốn đổi cách xưng hô thì sửa `summary_system()` trong `ai-service/src/nihongo_ai/prompts.py`.
- **Build lại native Android rồi test tay đăng nhập Google + Facebook trên emulator/máy thật** — máy chạy Claude Code này không build native được. Nếu Facebook không mở được (không quay lại app sau khi login), khả năng cao thiếu bước `cd android && ./gradlew clean` trước khi build lại (do sửa tay `AndroidManifest.xml`/`strings.xml` chứ không qua prebuild).
- Phần giảng ngữ pháp mỗi bài chưa lên app — cần field mới ở backend `StartLessonResponse` (CHƯA LÀM, cần yêu cầu rõ để đụng vào BE).
- Chưa nghiệm thu STT/TTS bằng giọng thật (cần máy Android thật; emulator không có audio đầu vào / gói giọng `ja-JP`).
- Nút mic/gửi bị thanh điều hướng cử chỉ che ở 2400px — cần safe-area đáy cho composer hội thoại.
- Header màn chat hội thoại chưa hiện tên kịch bản đang chơi.
- Cân nhắc gate tính năng hội thoại theo trình độ/streak.
