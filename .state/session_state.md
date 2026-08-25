# Session State – React Native

> Lịch sử đầy đủ trước 2026-08-24 (mọi Plan/Progress/Decisions cũ, ~360 dòng) đã chuyển sang `.state/archive/session_state_2026-08-24.md`. Đọc file đó khi cần tra cứu quyết định/bug cũ; file này chỉ giữ trạng thái ĐANG hoạt động.

## Mission

Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal

1. Impeccable Quiz & Lesson Flow Redesign — full theme-aware redesign of all quiz screens and question components.
2. Sửa 3 lỗi chặn buổi demo với giáo viên: (a) bài học hỏi ngay chữ chưa dạy, (b) bản đồ lộ trình giật trên emulator, (c) nút loa không ra tiếng.
3. Onboarding người dùng mới: tour hướng dẫn coach-mark có linh vật Lottie dẫn đường trên màn Học.
3. **Chuyển hệ AI hội thoại sang LLM (Gemini)**: trò chuyện theo chủ đề, phiên 5 phút, hết giờ tổng kết lỗi + cách sửa ngữ pháp + cách nói tự nhiên.

## Plan

- [x] Mọi mục trước 2026-08-24 đã hoàn tất — chi tiết trong file archive.
- [x] Kết nối module Social Feed (BE mới) — đã xác nhận HOÀN TẤT 2026-08-24 (xem Progress).
- [x] Kết nối đăng nhập Google/Facebook thật + đăng xuất gọi BE — HOÀN TẤT 2026-08-24 (xem Progress). Còn thiếu bước build lại native Android + test tay trên emulator/máy thật.
- [x] **Chuyển hệ AI hội thoại sang LLM Gemini — HOÀN TẤT 2026-08-25** (xem Progress). Còn thiếu: chạy thử với khoá Gemini thật trên emulator.
- [ ] Các file CHƯA COMMIT còn lại (Profile redesign, Quiz redesign) — chưa xác nhận mục tiêu/trạng thái với user:
  - Profile: `profile.tsx`, `achievement-medal`, `incomplete-profile-alert`, `profile-hero-card`, `profile-stat-capsule`, `rank-progress-bar`, `rank-tier.ts`, `profile.test.tsx`.
  - Quiz: `kana/listening/picture/speaking/vocab-question.tsx`, `audio-button.tsx`, `dual-text.tsx`, `japanese-text.tsx`, `quiz-mapper.ts`, `lesson-intro.ts`, `types/quiz.ts`.

- [x] Tour hướng dẫn lần đầu (coach-mark + linh vật) trên màn Học — HOÀN TẤT 2026-08-25 (xem Progress).

## Progress

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

## Blockers

- **BE-4 mới chặn được một nửa** — server chấm lại từ đáp án client gửi nhưng chưa lưu bộ đề của lượt làm bài, nên chưa khẳng định được "đã trả lời đủ".
- **`render`/`fireEvent` của `@testing-library/react-native` bản này BẤT ĐỒNG BỘ** — luôn `await render(...)` và `await fireEvent(...)` (xem `.state/memory.md`).

## Decisions

- Toàn bộ quyết định kiến trúc/UI/thuật toán trước 2026-08-24 (theme, tab bar, leaderboard, shop, quests, stroke-order, FSM hội thoại, TF-IDF vs LLM, v.v.) nằm trong `.state/archive/session_state_2026-08-24.md`.

## Next Steps

- **Chạy thử tính năng hội thoại TRÊN EMULATOR** (backend đã nghiệm thu bằng HTTP, nhưng chưa ai bấm thử trong app thật): `cd ai-service && PYTHONPATH=src .venv/Scripts/python.exe -m uvicorn nihongo_ai.api:app --port 8000` rồi mở app. Cần mắt người kiểm: đồng hồ đếm ngược, thẻ góp ý dưới bong bóng người học, màn tổng kết sau 5 phút, và ô nhập chủ đề tự do.
- Cân nhắc: AI xưng "em" với người học trong bản tổng kết (giọng giáo viên). Nếu muốn đổi cách xưng hô thì sửa `summary_system()` trong `ai-service/src/nihongo_ai/prompts.py`.
- **Build lại native Android rồi test tay đăng nhập Google + Facebook trên emulator/máy thật** — máy chạy Claude Code này không build native được. Nếu Facebook không mở được (không quay lại app sau khi login), khả năng cao thiếu bước `cd android && ./gradlew clean` trước khi build lại (do sửa tay `AndroidManifest.xml`/`strings.xml` chứ không qua prebuild).
- Phần giảng ngữ pháp mỗi bài chưa lên app — cần field mới ở backend `StartLessonResponse` (CHƯA LÀM, cần yêu cầu rõ để đụng vào BE).
- Chưa nghiệm thu STT/TTS bằng giọng thật (cần máy Android thật; emulator không có audio đầu vào / gói giọng `ja-JP`).
- Nút mic/gửi bị thanh điều hướng cử chỉ che ở 2400px — cần safe-area đáy cho composer hội thoại.
- Header màn chat hội thoại chưa hiện tên kịch bản đang chơi.
- Cân nhắc gate tính năng hội thoại theo trình độ/streak.
