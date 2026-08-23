# Session State – React Native

## Mission

Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal

1. Impeccable Quiz & Lesson Flow Redesign — full theme-aware redesign of all quiz screens and question components.
2. Sửa 3 lỗi chặn buổi demo với giáo viên: (a) bài học hỏi ngay chữ chưa dạy, (b) bản đồ lộ trình giật trên emulator, (c) nút loa không ra tiếng.

## Plan

- [x] **Lỗi demo #1 — Bài học phải dạy trước khi hỏi (kiểu Duolingo).**
  - [x] `src/types/lesson-intro.ts` + `src/utils/lesson-intro.ts` (`buildTeachCards`): suy thẻ dạy từ `metadataJson` của chính đề bài.
  - [x] `src/components/quiz/teach-card.tsx` (`TeachCardView`): mặt chữ + romaji + nghĩa + ảnh, tự phát âm thanh.
  - [x] Pha dạy trong `src/app/quiz/[id].tsx` (có nút bỏ qua).
  - [x] `src/app/quiz/ready.tsx` hết hiện lý thuyết mock không liên quan; nhận tên bài thật qua params.
- [x] **Lỗi demo #2 — Bản đồ lộ trình giật.** Tách `TopicSection` (memo) + `FlatList` windowing, memo `HexNode`, bỏ `TrackDot` chết.
- [x] **Lỗi demo #3 — Không có âm thanh.** `src/utils/media.ts` (`resolveMediaUrl`) + áp vào `use-audio`, `quiz-mapper`, avatar, icon cửa hàng, màn Bạn bè.
- [x] Test: `media.test.ts`, `lesson-intro.test.ts`, `quiz/__tests__/teaching-flow.test.tsx`. `npx jest` 12 suite / 69 test xanh, `tsc --noEmit` 0 lỗi.

- [x] Fix Lesson Map path connection bug.
- [x] Update Profile Avatar layout to match reference.
- [x] Change Lesson click behavior to use a small popover.
- [x] Fix energy requirement warning (energy < 1).
- [x] Add Streak Extended screen and trigger it appropriately.
- [x] Install & Sync `impeccable` skill into `.agents/skills/`.
- [x] Option 1: Accessibility (a11y) & Platform Conformance Polish.
  - [x] Add `accessibilityRole`, `accessibilityState`, and `accessibilityLabel` to `AnimatedPressable`, `GradientButton`, `SocialButton`, `AudioButton`, `OptionCard`, `TabSwitcher`.
  - [x] Implement dynamic `useSafeAreaInsets` on Floating Tab Bar in `_layout.tsx`.
  - [x] Optimize SVG Path computation with `useCallback` and add a11y labels to Home map nodes & stats headers.
- [x] Option 2: Custom Toast / In-App Feedback System.
  - [x] Create `src/types/toast.ts` & `src/components/ui/in-app-toast.tsx` with spring animations, haptics, and glassmorphism.
  - [x] Create `src/contexts/toast-context.tsx` and integrate into root `_layout.tsx`.
  - [x] Replace raw `Alert.alert` with `useToast()` in Shop (`search.tsx`), Profile (`qr.tsx`, `edit.tsx`), Auth (`login.tsx`, `signup.tsx`), Review (`mistakes.tsx`), Friends (`index.tsx`), and Settings (`index.tsx`).
- [x] Option 3: Dark Mode Harmonization & In-App Theme Selector.
  - [x] Define `ThemeMode` ("light" | "dark" | "system") in `src/types/theme.ts`.
  - [x] Create `ThemeProvider` & `useTheme()` hook in `src/contexts/theme-context.tsx` with persistent storage (`user_theme_mode`).
  - [x] Add Theme Mode Selector & Modal in `src/app/settings/index.tsx` (Light / Dark / System Default).
  - [x] Harmonize dynamic theming across all screens: `_layout.tsx`, `(tabs)/_layout.tsx`, `index.tsx`, `characters.tsx`, `quests.tsx`, `leaderboard.tsx`, `search.tsx`, `more.tsx`, `profile.tsx`.
- [x] Impeccable Tab Bar Redesign (pill-expand active tabs).
- [x] Impeccable Lesson Map Full Redesign.
- [x] Impeccable Leaderboard / Ranks Screen Redesign.
- [x] Impeccable Shop Screen Redesign (game-shop direction).
- [x] Impeccable Quests Screen Redesign ("chặng trong ngày" / mission-track direction).

- [x] **Hội thoại tự nhiên — gỡ nút thắt `wrong_time` của FSM.**
  - [x] Dựng `evaluate_dialogue.py`: bộ đo TẦNG HỘI THOẠI (độ phủ cấu trúc + phát lại toàn bộ câu train qua mọi trạng thái). `evaluate.py`/`evaluate_system.py` đều dừng trước FSM nên không nhìn thấy lớp lỗi này.
  - [x] `ALWAYS_ALLOWED` trong `dialogue.py`: `thanks`/`apologize`/`greeting`/`farewell`/`not_understand`/`meta_about_bot` đi vòng qua `expects`.
  - [x] Khối `anytime` cấp kịch bản (YAML + `Scenario.anytime`): ý định không có thứ tự, khai một lần thay vì chép cạnh vào từng state.
  - [x] `_decide` đổi thứ tự tra cứu: `state.expects` → `scenario.anytime` → `ALWAYS_ALLOWED` → `wrong_time`.
  - [x] `wrong_time` nêu thẳng câu đang chờ thay vì bỏ lửng.
  - [x] 12 test mới (quét toàn bộ state, không kiểm ca lẻ). `pytest` 53/53 xanh.


- [x] **Thanh chủ đề kiểu Duolingo trên bản đồ lộ trình.**
  - [x] `src/components/lessons/topic-header-bar.tsx`: MỘT thanh dính duy nhất dưới header, đổi tên/màu/tiến độ theo chủ đề đang cuộn tới.
  - [x] `src/components/lessons/topic-divider.tsx`: vạch ngăn giữa hai chủ đề, chỉ mang tên chủ đề SẮP TỚI (chiều cao cố định `TOPIC_DIVIDER_HEIGHT`).
  - [x] `src/app/(tabs)/index.tsx`: bỏ banner theo từng chủ đề; thêm `topicSectionHeight()` để tính sẵn offset → `getItemLayout` + `onScroll` xác định chủ đề đang xem.
  - [x] Mock `expo-av` toàn cục trong `jest-setup.js` (barrel `@/components/lessons` kéo theo `use-audio` → native module).
  - [x] Test `src/app/(tabs)/__tests__/roadmap-topic-bar.test.tsx` (4 ca). `npx jest` 13 suite / 73 test xanh, `tsc --noEmit` 0 lỗi.

- [x] **Sửa nhóm "bản đồ hiển thị sai trạng thái" (BE-1/2/3/5 + FE-1/2).**
  - [x] `LessonAttemptServiceImpl.startLesson`: replay không còn hạ COMPLETED → IN_PROGRESS (BE-1); luợt đang dở dang vào lại không bị trừ năng lượng lần nữa (BE-5); điều kiện trừ tiền đổi từ `!isReplay` sang `totalEnergy > 0`.
  - [x] `submitLesson`: `isReplay` suy ra từ trạng thái COMPLETED trong DB thay vì tin cờ client gửi (BE-3). `req.isReplay` vẫn nhận nhưng bị bỏ qua (tương thích ngược).
  - [x] `cancelLesson`: hạ progress xuống LOCKED sau khi hoàn năng lượng → gọi lặp không cộng thêm (BE-2).
  - [x] `src/app/(tabs)/index.tsx`: bỏ khối `processedTopics` ép COMPLETED (FE-1); `globalActiveLessonId` quét xuôi thay vì ngược (FE-2); memo hoá `allLessons`; thêm `accessibilityState={{ selected }}` cho node bài học.
  - [x] Test: 4 test backend mới (`LessonAttemptServiceImplTest` 32 ca) + 2 test FE mới; đã xác nhận 2 test FE FAIL trên mã cũ và PASS trên mã mới. `mvn test` 110 unit test xanh, `npx jest` 13 suite / 75 test xanh, `tsc --noEmit` 0 lỗi.

- [x] **Sửa nốt BE-4 + FE-3 → FE-8.**
  - [x] BE-4 (một nửa): `submitLesson` chấm lại đáp án từ DB TRƯỚC khi tính thưởng; `perfectLesson`/`goodLesson` dùng kết quả chấm nếu có, chỉ khi không có mới quay về con số client khai. Chưa chặn triệt để vì server vẫn chưa lưu bộ đề của lượt làm bài.
  - [x] `LessonUnlockPolicy.computeEntryCost` (static, dùng chung) + `RoadmapLessonResponse.entryCostEnergy` → bản đồ báo đúng chi phí năng lượng thật.
  - [x] `recordAnswers` giữ chính entity vừa dựng thay vì giá trị trả về của `save()`.
  - [x] FE-3: `checkAnswer` chỉ ghi nhận đáp án khi người học thật sự bấm một lựa chọn có id.
  - [x] FE-4: nộp bài thất bại → `useToast().showError`, state bài làm giữ nguyên để bấm lại.
  - [x] FE-5: hook `use-image-fallback.ts` + áp vào `avatar-display`, `leaderboard-avatar`, `item-glyph`, `teach-card`.
  - [x] FE-6: `lineHeight` của emoji dự phòng co theo `size`.
  - [x] FE-7: popup năng lượng dùng `maxEnergy` thật; popover chỉ vẽ sao cho `TIMED_REVIEW` và theo `starsEarned`; chi phí năng lượng lấy từ API.
  - [x] FE-8: `npx eslint --fix` phạm vi `src/` → `npm run lint` 0 error (còn 86 warning).
  - [x] Test: 3 test backend mới, `avatar-display.test.tsx` (4 ca), test FE-4 trong `teaching-flow.test.tsx` (đã xác nhận fail khi gỡ `showError`). `mvn test` 112 unit test xanh, `npx jest` 14 suite / 80 test xanh, `tsc --noEmit` 0 lỗi.

- [x] **Rà soát toàn dự án (FE + BE)** — báo cáo lỗi logic/hình ảnh/UX kèm phương án sửa (xem Blockers).

## Progress

- Done: **Sửa 3 lỗi chặn demo (bài học / hiệu năng / âm thanh)** — xem Plan và Decisions.
  - Nguyên nhân gốc của "không có âm thanh": backend lưu media dạng tương đối (`/uploads/...`, 2790 tham chiếu trong seed) còn RN không có origin để ghép, nên `Audio.Sound.createAsync` và `<Image uri>` fail im lặng. Lỗi này đồng thời làm mất avatar và icon cửa hàng.
  - Nguyên nhân gốc của "giật": `(tabs)/index.tsx` mount đồng thời toàn bộ 95 node trong một `ScrollView`, mỗi node là SVG + animation lặp vô hạn.
  - Nguyên nhân gốc của "hỏi chữ chưa dạy": dữ liệu seed đúng như thiết kế (bài 1 câu 1 = "Chữ 「あ」 đọc là gì?") nhưng app không có bước GIỚI THIỆU nào trước phần hỏi.

- Done: Fixed React list unique key warning in Quests tab (`quests.tsx`).
- Done: **Full impeccable redesign of Lesson Map** (`src/app/(tabs)/index.tsx`).
  - World: "Game World Traversal" — dark background (#0F0F1A), violet–magenta palette.
  - Hexagon nodes (SVG polygon) replacing circle-progress widgets.
  - Three distinct node states: COMPLETED (gradient fill + checkmark), ACTIVE (pulsing glow ring + float), LOCKED (desaturated, lock icon).
  - Dual-rail SVG track: outer translucent rail + active gradient inner fill + white center highlight + halo glow.
  - Dark topic banners with colored left accent bar per topic, lesson count meta.
  - Rich popover: lesson type badge + difficulty stars + gradient CTA button.
  - Header: BlurView + language pill + stat pills (streak/coins/energy).
  - Dot-texture background + floating ambient orbs.
  - TypeScript: 0 errors. `"light"` / `"dark"`.
- Done: Redesigned bottom navigation bar (impeccable).
  - New `TabItem` component: pill-expand active pattern (icon → icon + label).
  - New `_layout.tsx`: edge-to-edge, BlurView on iOS, solid on Android, thin brand-tint top border.
  - Uses React Navigation `BottomTabBarProps` for reliable focus state.

- Done: Added "Incomplete Profile" banner on Profile screen.
  - Checks if user's display name is missing, matches their email, or is a default placeholder.
  - Displays a prominent banner directing the user to `/profile/edit`.
  - Used `Ionicons` and `AnimatedPressable` for interaction.

- Done: Added Shop Core enhancements.
  - Implemented real-time Countdown Timer for active Power-ups (Double XP, etc.) based on `expiresAt`.
  - Replaced native toast with full-screen "Chưa đủ xu!" Dialog (ModalCard) with smart routing to go learn and earn coins when buying fails.
  - TypeScript checks passed successfully.

- Done: **Impeccable redesign of Leaderboard / Ranks screen** (`src/app/(tabs)/leaderboard.tsx`).
  - Extracted feature components into `src/components/leaderboard/`: `leaderboard-podium.tsx` (elevated top-3 podium with tiered gold/silver/bronze platforms), `leaderboard-row.tsx` (rank 4+ rows), `leaderboard-status-banner.tsx` (rank header card with Ionicons trophy badge), `rank-tabs.tsx`, `leaderboard-avatar.tsx`.
  - Replaced random per-index animal emoji avatars with `LeaderboardAvatar`: real `avatarUrl` image when present, else a deterministic initials badge (color keyed off `userId`) — the DTO's `avatarUrl` field was previously fetched but unused.
  - Screen is now fully theme-aware (`colors.*` from `useTheme()` everywhere) instead of hardcoded light-mode colors.
  - Wrote an integration test (`src/app/(tabs)/__tests__/leaderboard.test.tsx`) covering initial rank load/podium render and tab-switch interaction (`fireEvent.press`) with mocked `rankApi`.
  - Fixed pre-existing broken Jest infra to make `npm test` runnable at all (see Decisions).

- Done: **Set up real on-device E2E testing with Maestro** (`.maestro/`).
  - `flows/leaderboard.yaml` (+ `subflows/login.yaml`), `npm run e2e`, `.maestro/README.md`.
  - While verifying it, found and **fixed a real app bug**: the session was never restored after the app's process was killed and relaunched. Root cause in `src/contexts/auth-context.tsx` — `isLoading` started `false` instead of `true`, so `src/app/index.tsx`'s redirect-based-on-auth-state logic ran (and redirected to `/welcome`) before the async `storage.get()` session check had finished. Fixed by starting `isLoading` at `true` and clearing it in a `finally` after `loadSession()` completes. Verified with two consecutive force-stop+relaunch cycles on the emulator, and confirmed `flows/leaderboard.yaml` runs fully green end-to-end via `maestro test` now that `launchApp` correctly resumes the session.
  - One remaining known issue (not fixed, documented): Maestro's `inputText` hangs/times out in this Windows+emulator+Gboard environment, so flows can't drive the login *form* itself unattended — a manual login is needed once per device session. See `.maestro/README.md` Known Issues.

- Done: **Kết nối tính năng Bảng chữ cái (Alphabet / "chữ viết") của backend vào app**.
  - Types: `src/types/alphabet.ts` (AlphabetType, AlphabetGroup/Character, PracticeQuestion/Start/Submit, CreateAlphabetRequest, StrokeDefinition) + barrel.
  - API: `API_ENDPOINTS.ALPHABETS` + `src/services/api/alphabets.ts` (`alphabetApi.getAlphabets/startPractice/submitPractice`, `alphabetAdminApi.create/bulkCreate`). `mistakesApi` cũng được thêm vào barrel `services/api/index.ts` (trước đó bị bỏ sót).
  - Grid: `src/app/(tabs)/characters.tsx` giờ lấy dữ liệu thật theo `type`, gom nhóm `groupName`, tô màu theo `masteryLevel` (0-3), phát audio khi chạm, reload khi focus (cập nhật tiến độ sau luyện tập).
  - Components mới `src/components/alphabet/`: `alphabet-cell`, `alphabet-grid`, `character-preview-panel`, `mastery` (bảng màu), `practice-multiple-choice`, `practice-drawing`, `practice-result-card`, `stroke-order-canvas`.
  - Vòng lặp luyện tập: `src/hooks/use-alphabet-practice.ts` — nhận trọn đề từ `/practice/start`, sai thì đẩy câu xuống cuối hàng đợi, chỉ nộp kết quả LẦN ĐẦU của mỗi `characterId`.
  - Màn hình: `src/app/alphabet/practice.tsx` (+ `_layout.tsx`), có màn chúc mừng (expEarned / isPromoted / newRankName) và `addExp()` vào gamification context.
  - Tập viết: `src/utils/stroke-order.ts` tự parse & lấy mẫu path SVG (KanjiVG 109 hoặc lưới 1024), chấm từng nét (bám nét / đúng chiều / đủ dài); fallback viết tự do khi backend chưa có `strokeOrderData`.
  - Tests: 25/25 xanh — `src/utils/__tests__/stroke-order.test.ts`, `src/components/alphabet/__tests__/stroke-order-canvas.test.tsx`, `src/app/(tabs)/__tests__/characters.test.tsx`, `src/app/alphabet/__tests__/practice.test.tsx`. `npx tsc --noEmit` 0 lỗi, ESLint 0 error trên các file mới.

- Done: **Bộ seed dữ liệu bảng chữ cái đầy đủ để test** (`scripts/seed/`).
  - `scripts/alphabet-table.js` (bảng Hiragana/Katakana: 46 gojūon + 25 dakuten/handakuten + 33 âm ghép, mỗi bảng 104 chữ) + `scripts/generate-alphabet-seed.js` (`npm run seed:alphabets`).
  - Nét viết tải từ KanjiVG (raw.githubusercontent), cache ở `scripts/.cache/kanjivg/` (đã gitignore). Kết quả: **208 chữ, 142 chữ có `strokeOrderData` thật, 0 lỗi**; 66 âm ghép để null (KanjiVG chỉ có dữ liệu theo từng ký tự đơn) -> app tự fallback viết tự do.
  - Output: `scripts/seed/alphabet-{hiragana,katakana,all}.json`, đúng payload của `POST /api/v1/admin/alphabets/bulk`. `scripts/seed/README.md` có lệnh curl + ghi công KanjiVG (CC BY-SA 3.0, bắt buộc attribution khi phát hành).
  - `audioUrl` mặc định null (không bịa URL); có cờ `--audio-base=` cho CDN riêng và `--audio=wikimedia` (chỉ để test, .oga không chạy trên iOS).
  - Test `src/utils/__tests__/stroke-order.seed.test.ts` (tự skip nếu chưa sinh seed): toàn bộ 419 nét parse đúng lưới 109, nằm trong khung, tô trùng khít -> PASS, và tô lệch ±8 đơn vị (~7% lưới) vẫn PASS.
  - Đo thêm (không commit): sai số ±10 vẫn đúng 100%; tỉ lệ chấm nhầm khi vẽ nhầm sang nét khác *của cùng chữ* là 7.6% và không giảm khi siết ngưỡng -> đó là các nét gần trùng nhau (ví dụ 2 dấu dakuten), nên giữ nguyên ngưỡng 0.16 cho dễ thở với người dùng.

- Done: **Sửa 2 lỗi HTTP 500 của backend + nạp dữ liệu bảng chữ cái vào DB** (được user cho phép sửa BE).
  - `/api/v1/topics` 500: DB có lesson id=10 `lesson_type='CONVERSATION'` (migration V33 của nhánh khác đã chạy vào DB dev) nhưng enum `Lesson.LessonType` trong code không có giá trị này -> Hibernate ném lỗi khi map. User chọn **bỏ hẳn conversation**: thêm `V35__remove_conversation_feature.sql` (drop 2 bảng conversation, xoá lesson + topic rỗng, thu enum `lesson_type` về NORMAL/TIMED_REVIEW/JUMP_TEST).
  - `/api/v1/alphabets` 500: `V33__create_alphabet_practice_tables.sql` chưa từng chạy vì version 33 đã bị migration conversation chiếm, `validate-on-migrate: false` nên Flyway im lặng bỏ qua. Đổi tên file thành `V34__...` -> bảng `characters` / `user_character_progress` được tạo.
  - **Bug collation (BE)**: cột `characters.symbol` dùng `utf8mb4_0900_ai_ci` (accent-insensitive) nên MySQL coi `か = が`, `は = ぱ` -> 74/208 chữ có dakuten bị 409 "Character already exists". Sửa bằng `V36__fix_character_symbol_collation.sql` (đổi sang `utf8mb4_bin`).
  - **Bug thứ tự nhóm (BE)**: `CharacterRepository.findMatrixByTypeAndUserId` `ORDER BY c.group_name` -> sắp nhóm theo alphabet Latin ("Âm ghép B" đứng trước "Hàng A"). Đổi sang `ORDER BY MIN(c.order_index) OVER (PARTITION BY c.group_name), c.order_index, c.id`.
  - Backend chạy `mvnw spring-boot:run` + devtools nên tự restart và Flyway tự áp V34/V35/V36 ngay khi tạo file (không cần restart tay).
  - Đã nạp đủ **208 chữ** qua API admin thật (`admin@nihongo.app` / `admin123`, ghi trong `test-data/README.md`). Verify: `/topics` 200, `/alphabets` 200 với 26 nhóm đúng thứ tự, `/practice/start` trả 10 câu (8 MC + 2 DRAWING có nét), `/practice/submit` 200 (+5 EXP).
  - **Lệch tài liệu BE**: `/practice/submit` trả `promoted` chứ KHÔNG phải `isPromoted` (Jackson cắt tiền tố "is"), kèm `currentExp` không có trong tài liệu, và `newRankName` có giá trị cả khi không thăng hạng. Đã sửa FE: type khai báo cả hai + helper `isPracticePromoted()`, test dùng shape API thật. `options[].isCorrect` thì đúng tài liệu.

- Done: **Sửa layout màn Bảng chữ cái sau phản hồi thực tế trên máy**.
  - Nút "Bắt đầu luyện tập" bị thanh tab nổi đè: footer giờ đặt `bottom = 56 + max(insets.bottom, 8)` (đúng công thức chiều cao của `CustomTabBar` trong `(tabs)/_layout.tsx`), `paddingBottom` của ScrollView cộng thêm chiều cao footer.
  - Lưới chỉ hiện 4 ô/hàng thay vì 5: bỏ cách tính bề rộng ô từ `Dimensions`, thay bằng đo thật qua `onLayout` của ScrollView + `Math.floor` (chạy đúng trên mọi bề rộng: web, tablet, chia đôi màn hình). `AlphabetGrid` nhận thêm prop `gap` để công thức và style luôn khớp nhau.
  - Dòng tổng kết đổi thành "Đã học X/N · Thành thạo Y/N" — trước đó chỉ đếm mức 3 nên hiện "0/104" trong khi vài chữ đã sáng viền, gây hiểu nhầm.

- Done: **Thiết kế lại toàn bộ màn Cửa hàng theo hướng game shop** (`src/app/(tabs)/search.tsx`).
  - Hướng thiết kế "quầy sơn mài": quầy hàng (`ShopCounter`) giữ nền sơn mài tím-đen + vàng lá ở CẢ light lẫn dark mode, để cửa hàng đọc ra như một *nơi chốn* chứ không phải thêm một panel cài đặt. Dấu hiệu nhận diện: vành đồng tiền mon (đồng xu lỗ vuông) phóng to mờ sau quầy, lặp lại ở mọi chỗ hiện giá.
  - **Hệ độ hiếm là điểm nhấn chính**: `getItemRarity()` suy ra tier từ `priceCoins` (<200 Thường / <400 Hiếm / <800 Sử thi / ≥800 Huyền thoại; item `limitedTime` được nâng 1 bậc). Tier quyết định màu khung, viền vát, quầng nền và tem. Chỉ tier Huyền thoại có hiệu ứng quét vàng (`RarityFrame` + `FoilSweep`), tôn trọng `useReducedMotion`.
  - Kệ hàng sắp theo giá tăng dần nên cuộn xuống là thấy nấc thang độ hiếm xanh → tím → vàng.
  - Bố cục mới: quầy (giá tiền + `FeaturedCase` món nổi bật + `BuffTicker` đếm ngược buff đang chạy) → 4 kệ cố định (`ShelfTabs`: Vật phẩm / Tăng lực / Trang trí / Túi đồ, có badge số lượng) → lưới 2 cột (`ItemTile`) → `ItemSheet` để mua/dùng/trang bị.
  - Bỏ banner "Super Kotodama" (nút `onPress={() => {}}` không làm gì) — thay bằng `FeaturedCase` lấy dữ liệu thật: ưu tiên item `limitedTime`, không có thì lấy item đắt nhất.
  - Sửa bug cũ: `iconUrl` từ BE là đường dẫn tương đối (`/icons/...`) không host được; code cũ thấy có `iconUrl` là hiện emoji 🎁 và không bao giờ render ảnh. Nay `resolveItemArtwork()` chỉ nhận URL tuyệt đối, còn lại fallback về icon Ionicons theo `effectType`.
  - Túi đồ tách thành kệ riêng thay vì nhồi nút "Dùng"/"Mặc" vào từng dòng hàng.
  - Hết xu: nút không bị disable mà đổi thành "Kiếm thêm N xu" → mở `PurseEmptyDialog` chỉ đường đi học.
  - Kiến trúc: `src/types/shop.ts`, `src/constants/shop.ts` (ShopPalette / RARITY_STYLES / EFFECT_META / SHELVES), `src/utils/shop.ts` (thuần), `src/hooks/use-shop.ts` + `use-countdown.ts`, 12 component trong `src/components/shop/`. Màn hình chỉ còn ~190 dòng ghép layout.
  - Kiểm chứng: `npx tsc --noEmit` 0 lỗi, `npm test` 35/35 xanh (thêm `src/app/(tabs)/__tests__/shop.test.tsx` — 4 test tích hợp: nạp kệ + món nổi bật, mua, thiếu xu, dùng đồ trong túi), ESLint sạch trên toàn bộ file mới. Đã chạy thật trên emulator và chỉnh lại theo ảnh chụp (xem Decisions).

- Done: **Thiết kế lại toàn bộ màn Nhiệm vụ theo hướng game** (`src/app/(tabs)/quests.tsx`).
  - Hướng thiết kế "chặng đường trong ngày": MỘT đường ray dọc màn hình, mỗi nhiệm vụ là một trạm trên ray, đoạn đã đi vẽ liền nét còn đoạn phía trước vẽ nét đứt, và ray kết thúc ở rương. Trang đọc ra như một hành trình có phần thưởng ở cuối, thay vì ba thẻ rời chồng lên nhau. Khác hẳn cấu trúc "quầy sơn mài" của Cửa hàng (không dùng slab tối ở đầu trang) nên 2 tab vẫn là 2 "căn phòng" riêng, dù chung ngôn ngữ chế tác (mặt vát có gờ, con dấu, vàng đồng xu).
  - **Điểm nhấn duy nhất = con dấu son (`QuestSeal`)**: xong nhiệm vụ thì một con dấu đỏ chu sa đóng xuống thẻ (spring 1.85→1 + xoay -9°, có bóng mực), so le theo từng thẻ. Mọi thứ còn lại giữ yên để con dấu còn nghĩa. Vẽ bằng `react-native-svg` chứ KHÔNG dùng ký tự Hán (xem Decisions của phần Cửa hàng).
  - **Bảng màu 4 vai trò**: tím `#7C5CFF` = đường đi / đang làm; vàng lá = đã kiếm được (thẻ xong + hạt trên ray + rương); đỏ chu sa = CHỈ con dấu; xám mauve = chưa tới. Thẻ xong chuyển vàng làm trang "ấm dần" lên và trỏ về rương vàng ở cuối ray.
  - Sắp xếp trạm theo `buildQuestNodes()`: xong → đang làm → chưa động tới, vì ray chỉ đọc ra "tiến độ" khi việc đã làm nằm phía sau (API trả theo thứ tự catalogue).
  - Header đổi hẳn cách viết: dòng H1 là TÌNH TRẠNG THẬT ("Xong 1/3 nhiệm vụ") chứ không lặp lại chữ "Nhiệm vụ" đã có sẵn ở thanh tab; dòng dưới nói ý nghĩa với rương; pill đếm ngược tới nửa đêm dùng `fontVariant: tabular-nums` nên tick không xô layout.
  - **Bỏ hẳn mục "NHIỆM VỤ BẠN BÈ"**: dữ liệu hoàn toàn bịa (tên "Lê Lan", "10/15" hard-code), 2 nút CHIA SẺ/NHẮC NHỞ không làm gì. Chờ BE có endpoint thật rồi dựng lại.
  - Sửa bug cũ: `quests.map((q: any))` dùng `q.id` (không tồn tại — DTO là `questId`) làm React key; giờ dùng type `Quest` thật. Cờ `completed` của BE trước đây không được dùng. Thêm pull-to-refresh + reload khi focus tab (tiến độ kiếm ở màn khác).
  - `openChest()` trong `gamification-context` giờ trả `OpenChestResponse` để màn hình khoe được "+120 xu" sau khi mở, thay vì mở xong không thấy gì.
  - Kiến trúc: `src/types/quest.ts`, `src/constants/quests.ts` (QuestPalette / RailMetrics / QUEST_META / `goldInk`), `src/utils/quests.ts` (thuần), `src/hooks/use-quests.ts`, 8 component trong `src/components/quests/`. Màn hình còn ~120 dòng ghép layout.
  - Kiểm chứng: `npx tsc --noEmit` 0 lỗi, `npm test` 40/40 xanh (thêm `src/app/(tabs)/__tests__/quests.test.tsx` — 5 test tích hợp), ESLint sạch trên toàn bộ file mới. Chạy thật trên emulator ở CẢ dark lẫn light mode và sửa lại theo ảnh chụp (xem Decisions).

- Done: **Tính năng Luyện hội thoại AI (không dùng LLM)** — dịch vụ Python riêng + màn hình RN.
  - **Dịch vụ AI** (`ai-service/`, tách hẳn khỏi backend Java, KHÔNG đụng `BE_NihongoApp`):
    - Dataset **tự soạn 730 câu / 30 ý định / 4 kịch bản** (nhà hàng, hỏi đường, mua sắm, tự giới thiệu) ở `data/intents/*.yaml`. Soạn theo 4 trục biến thể: mức lịch sự, kanji↔kana, độ dài câu, và **lỗi thật của người học** (`こんにちわ`, `ありがとうごさいます`).
    - Nhãn từ chối `out_of_scope` 132 câu chia 4 nhóm nhiễu có chủ ý (tiếng Nhật đúng nhưng lạc đề / đập bàn phím / trêu bot / ký hiệu-emoji).
    - Mô hình chọn: **TF-IDF n-gram KÝ TỰ (2,5) + Hồi quy Logistic**, C=30, class_weight balanced. 930 KB, train ~2s CPU, suy luận 0.42 ms.
    - **4 tầng phòng thủ**: luật chặn tất định → ngưỡng tin cậy 0.30 → thu hẹp nhãn theo kịch bản (+chuẩn hoá lại xác suất) → FSM kịch bản.
    - 41 test pytest xanh; FastAPI phi trạng thái; `Dockerfile` + `render.yaml` (Render free tier, train lúc build).
  - **Frontend RN**: `src/types/conversation.ts`, `src/constants/conversation.ts`, `src/services/api/conversation.ts` (axios instance riêng, timeout 30s cho cold start), `src/hooks/use-conversation.ts`, 5 component ở `src/components/conversation/`, màn `src/app/conversation/{_layout,index,[id]}.tsx`. Lối vào đặt ở Practice Hub (`(tabs)/review.tsx`), KHÔNG nhét vào luồng bài học chính.
  - Kiểm chứng: `npx tsc --noEmit` 0 lỗi, `npm test` **51/51 xanh** (thêm 11 test tích hợp), ESLint 0 error trên toàn bộ file mới, và đã smoke-test server uvicorn thật bằng curl.
  - Tài liệu đầy đủ: `ai-service/README.md`, `reports/DATASET.md`, `reports/EVALUATION.md` + số liệu thô `reports/*.json`.

- Done: **Chạy thật tính năng hội thoại trên emulator Android 16 (SDK 37)** — xác nhận FE ↔ service Python hoạt động đầu-cuối.
  - Nạp được 4 kịch bản từ service, mở hội thoại, chạm chip gợi ý (điền vào ô nhập, KHÔNG tự gửi — đúng thiết kế), gửi 「Tシャツはありますか。」 → bot hiểu đúng `shopping_ask_item`, dải màu xanh lá, FSM chuyển bước và đổi bộ gợi ý.
  - Tầng chặn xác nhận hoạt động trên máy: gõ "toi muon mua ao" → viền đỏ + nhãn "CHƯA ĐỌC ĐƯỢC" + hướng dẫn gõ tiếng Nhật, trạng thái hội thoại giữ nguyên.
  - **Tìm & sửa được 1 bug thật**: bàn phím che hoàn toàn ô nhập trên Android. Nguyên nhân: từ Android 15, chế độ edge-to-edge (Expo SDK 54 bật mặc định) làm `android:windowSoftInputMode="adjustResize"` trong manifest BỊ BỎ QUA, nên `KeyboardAvoidingView behavior={undefined}` (mặc định RN cho Android) không làm gì. Sửa: dùng `behavior="padding"` cho cả hai nền tảng. Đã verify lại trên máy.

- Done: **Thêm giọng nói cho tính năng hội thoại (TTS + STT), nói và gõ SONG SONG không ép chọn**.
  - `expo-speech@~14.0.8` (đọc, offline) + `expo-speech-recognition@3.1.3` (nghe). **Ghim 3.1.3 vì bản 56.x build cho Expo SDK 56, còn 3.1.3 build cho ~54.0.32** đúng SDK dự án.
  - `src/hooks/use-japanese-speech.ts` (đọc `ja-JP`, rate 0.85 cho người mới) + `src/hooks/use-speech-input.ts` (STT, có ngưỡng `confidence < 0.6` cảnh báo, map từng mã lỗi sang câu tiếng Việt dùng được ngay).
  - **STT KHÔNG tự gửi**: transcript rơi vào ô nhập để người học đọc lại/sửa — chặn chuỗi lỗi mic kém → nghe sai → phân loại sai → bot trả lời lạc lõng.
  - UI: nút mic cạnh nút gửi (cùng tồn tại), nút loa trên từng bong bóng bot, nút bật/tắt tự-đọc ở header. Lỗi mic hiện ở banner nhưng KHÔNG chặn gõ chữ.
  - **Bug thật #2 tìm được**: `RECORD_AUDIO` không vào APK. Dự án commit sẵn `android/` nên `expo run:android` KHÔNG chạy prebuild → config plugin không bao giờ áp dụng. Sửa bằng cách thêm tay `RECORD_AUDIO` + `<queries>` (`com.google.android.googlequicksearchbox` và intent `android.speech.RecognitionService`) vào `android/app/src/main/AndroidManifest.xml`.
  - Verify trên emulator: module nạp OK, quyền cấp OK, `start()` OK, UI vào trạng thái "Đang nghe…" với nút dừng đỏ, chuỗi sự kiện `nomatch → error(no-speech) → end` chạy đúng (emulator không có audio đầu vào nên dừng ở đó — đúng như dự kiến).
  - `jest-setup.js` mock 2 module native (không có JS fallback, không mock thì mọi màn có giọng nói đều crash khi load). `npm test` 56/56 xanh, tsc 0 lỗi, ESLint 0 error.

- Done: **Hội thoại tự nhiên (tầng FSM)** — người dùng báo: hỏi `レストランはどうやって行きますか` ở lượt đầu kịch bản `directions` bị trả "chưa hợp bước này".
  - Nguyên nhân gốc KHÔNG phải mô hình: bộ phân loại nhận đúng `directions_ask_how_to_get` với độ tin cậy 0.816. Lỗi ở FSM — state `approach` chỉ khai 4 ý định trong `expects`.
  - Quét toàn bộ mới thấy quy mô thật: 18 state, mỗi state chỉ nhận 2-5 trong 12-14 ý định hợp lệ. Độ phủ cấu trúc 33.1%, và **66.5% số lượt phát lại rơi vào `wrong_time`**.
  - Tệ nhất: câu xã giao bị chặn **69.2%** — nói "ありがとう" giữa chừng thì bot bảo chưa hợp bước này.
  - Sau sửa: độ phủ 33.1% → **82.6%**, `wrong_time` 66.5% → **17.9%**, xã giao 69.2% → **0.0%**.
  - `advanced` (528) và `completed` (262) KHÔNG đổi một lượt nào — bằng chứng các luồng kịch bản soạn tay không bị đụng tới.
  - `evaluate_system.py` giữ nguyên 12.9% harmful / 84.1% chặn lạc đề: thay đổi này thuần tầng hội thoại, không chạm bộ phân loại.


- Done: **Lỗ hổng dataset 「〜に行きたいです」** — người dùng gõ `コンビニに行きたい。` bị trả "lạc chủ đề".
  - Nguyên nhân: `out_of_scope.yaml` có sẵn `日本に行きたいです`. Với n-gram KÝ TỰ thì `に行きたいです` trùng khít, nên thứ DUY NHẤT phân biệt được là DANH TỪ.
  - Thêm 12 ví dụ vào `directions_ask_how_to_get`, toàn dùng địa điểm đi bộ tới được (駅・コンビニ・トイレ・銀行…) vốn đã xuất hiện dày trong các ý định hỏi đường khác.
  - Lần train đầu LÀM VỠ ranh giới: `ハワイに行きたいです` / `ディズニーランドに行きたいです` bị kéo sang hợp lệ ở mức 0.99. Phải thêm 8 câu ĐỐI CHỨNG (đích xa / đi chơi) vào `out_of_scope` mới cân lại.
  - Kết quả dò ranh giới: 13/15 đúng. Hai ca hỏng còn lại là danh từ chưa từng thấy ở CẢ HAI phía: `タイ` (katakana ngắn) và `北海道` (chứa 道 — n-gram rất mạnh của hỏi đường).
  - Đánh đổi ĐO ĐƯỢC: tỉ lệ lỗi gây hại đứng yên 12.9%, nhưng cơ cấu dịch — trả lời sai giảm 1.0 điểm, lạc đề lọt tăng 2.0 điểm. Kiểm riêng 132 câu OOS CŨ cũng giảm (84.1% → 82.2%), tức đánh đổi thật chứ không phải do 8 câu mới làm khó bài đo.
  - 750 câu / 30 ý định, fingerprint `f90ac95ecc929c15`, CV acc 0.6699 → 0.6640, macro-F1 0.6612 → 0.6628, mô hình 930 → 959 KB. `pytest` 62/62.
  - Đã restart uvicorn: mô hình `.joblib` nạp MỘT LẦN trong `lifespan`, và `--reload` của uvicorn (StatReload, chưa cài `watchfiles`) chỉ theo dõi `.py` — sửa YAML hay train lại đều KHÔNG tự nạp.


- Done: **Tăng cường dữ liệu bằng LLM (offline, không đụng runtime)** — người dùng hỏi có nên đổi sang LLM không.
  - Chốt: KHÔNG thay runtime. Dùng LLM ở khâu SINH DỮ LIỆU TRAIN. Mô hình xuất xưởng vẫn là TF-IDF + Hồi quy Logistic, vẫn giải thích được, vẫn 0 đồng lúc chạy.
  - `dataset.py`: dữ liệu sinh nằm TÁCH BIỆT ở `data/intents/generated/`, gộp vào ý định hạt giống lúc nạp. `include_generated=False` cho ra đúng dataset hạt giống — nhờ vậy đo được phần đóng góp.
  - `augment.py`: công cụ sinh (Gemini mặc định, đặt `AI_AUGMENT_BASE_URL` để dùng endpoint kiểu OpenAI). Dùng `urllib` thuần nên `requirements.txt` KHÔNG đổi, ảnh triển khai vẫn ~120 MB.
  - `augment.py --check [--strip]`: cổng kiểm duyệt chạy ĐỘC LẬP với khâu sinh, vì dữ liệu sinh có thể đến từ bất kỳ đâu.
  - `evaluate_augmentation.py`: đo riêng đóng góp, tập TEST luôn chỉ gồm câu viết tay.
  - Mẻ đầu do claude-opus-5 sinh: 864 câu thô → cổng loại 226 (222 trùng, 4 lẫn hệ chữ lạ) → 646 câu giữ lại. Dataset 750 → 1396.
  - Đo sạch (test chỉ câu viết tay): trả lời đúng 68.7→76.2, chặn lạc đề 82.0→86.8, lạc đề lọt 17.5→13.0, **lỗi gây hại 12.9→10.4**, macro-F1 74.3→81.8. Tất cả 8 chỉ số đều tốt lên.
  - Dò ranh giới 「〜に行きたいです」: 13/15 → **15/15**. `タイ` và `北海道` (hai ca hỏng cũ) nay đúng.
  - `pytest` 62/62. Mô hình 959 KB → 1829 KB.


## Next Steps

- **Phần giảng ngữ pháp của mỗi bài vẫn chưa lên được app**: nó nằm trong `lessons.config_json.description`, mà `GET /api/v1/topics` lẫn `POST /lessons/{id}/start` đều không trả về. Muốn hiện cần thêm field vào `StartLessonResponse` phía backend — CHƯA LÀM vì AGENTS.md cấm sửa backend khi chưa được yêu cầu.
- Chưa chạy lại app trên emulator để nghiệm thu 3 sửa đổi (backend chưa bật lúc làm). Cần: `docker compose up -d` + `./mvnw spring-boot:run` ở BE, rồi mở lại bài 1.

- **Chưa nghiệm thu được STT với giọng thật** — emulator không có audio đầu vào. Cần chạy trên máy Android thật.
- **Chưa nghiệm thu được TTS có phát ra tiếng hay không** — `tts_default_locale` trên emulator trả `null`, nhiều khả năng chưa cài gói giọng `ja-JP`. Máy thật hoặc cài gói giọng Nhật sẽ rõ.
- Nút mic/gửi có đáy chạm mép 2400px, tức nằm dưới vùng thanh điều hướng cử chỉ — chạm vào nửa dưới nút bị hệ thống nuốt. Nên thêm safe-area đáy cho composer.
- Header màn chat hiện chỉ ghi "Hội thoại", chưa hiện tên kịch bản đang chơi — nên thêm để người dùng biết mình đang ở tình huống nào.
- Chưa test được câu lạc đề bằng tiếng Nhật TRÊN MÁY (`adb shell input text` không gõ được ký tự non-ASCII); đã verify qua curl + pytest thay thế.
- Cân nhắc gate tính năng theo trình độ/streak — hiện đang mở cho mọi người dùng.
- Thu thập câu bị đoán sai khi dùng thật rồi gán nhãn lại: đây là hướng cải thiện hiệu quả nhất (xem Decisions).

## Blockers

Rà soát ngày 2026-08-23 — toàn bộ 13 mục đã xử lý. Hai điểm còn nợ:

- **BE-4 mới chặn được một nửa.** Server chấm lại từ đáp án client gửi, nhưng chưa biết bộ đề của lượt làm bài gồm những câu nào, nên chưa khẳng định được "đã trả lời đủ". Muốn triệt để: lưu bộ đề lúc `/start` rồi đối chiếu lúc `/submit`.
- **`render`/`fireEvent` của @testing-library/react-native bản này là BẤT ĐỒNG BỘ.** Thiếu `await` thì query trả về undefined và thao tác không được flush — đây là thứ đã làm mất cả buổi khi viết test quiz. Mọi test mới phải `await render(...)` và `await fireEvent...`.

Danh sách gốc:

- ✅ ĐÃ SỬA — **[BE-1] Bỏ dở bài đã hoàn thành làm khoá lại toàn bộ lộ trình phía sau.**
  `LessonAttemptServiceImpl.startLesson` gọi `upsertProgress(..., IN_PROGRESS, ...)` kể cả khi bài đang COMPLETED. Nếu user thoát giữa chừng, `LessonUnlockPolicy.computeStatuses` thấy bài đó không còn COMPLETED → cờ `previousNormalCompleted` thành false → mọi bài sau đều LOCKED. `cancelLesson` cũng không khôi phục (chỉ hoàn năng lượng rồi trả `status: "LOCKED"`).
- ✅ ĐÃ SỬA — **[BE-2] Lỗ hổng năng lượng vô hạn.** Replay tốn 0 năng lượng (`totalEnergy = isReplay ? 0 : ...`) nhưng `cancelLesson` hoàn `resolveEntryCost(lesson)` cho mọi progress IN_PROGRESS → start + cancel liên tục một bài đã xong = cộng năng lượng miễn phí.
- ✅ ĐÃ SỬA — **[BE-3] Client tự khai `isReplay`.** `submitLesson` lấy thẳng `req.getIsReplay()`; gửi `false` là ăn full EXP/coin mỗi lần làm lại. Phải suy ra từ server.
- ✅ ĐÃ SỬA — **[BE-4] NORMAL / TIMED_REVIEW luôn `passed = true`.** Mức độ nhẹ hơn đánh giá ban đầu: FE đẩy câu sai xuống cuối hàng đợi (`isRedo`) nên qua UI bình thường user buộc phải trả lời đúng hết mới kết thúc được. Đây là lỗ hổng "tin client" (gọi thẳng API là qua bài), không phải lỗi cho phép bỏ qua việc học.
- ✅ ĐÃ SỬA — **[BE-5] `/start` không idempotent** — gọi lại là trừ năng lượng lần nữa (StrictMode dev, hoặc user quay lại màn quiz).
- ✅ ĐÃ SỬA — **[FE-1] `processedTopics` ghi đè trạng thái backend** (`(tabs)/index.tsx`): mọi bài trước bài COMPLETED xa nhất bị vẽ thành COMPLETED. Vì JUMP_TEST luôn UNLOCKED ở bất kỳ đâu, một lần nhảy cóc là cả trăm bài LOCKED hiện dấu tích; bấm vào thì backend ném `LessonLockedException`.
- ✅ ĐÃ SỬA — **[FE-2] `globalActiveLessonId` chọn nhầm node "đang học"** — `[...allLessons].reverse().find(l => l.status === "UNLOCKED")` lấy bài UNLOCKED CUỐI cùng thay vì đầu tiên.
- ✅ ĐÃ SỬA — **[FE-3] `checkAnswer` bịa `selectedOptionId`** (`quiz/[id].tsx`): câu kana/fill-blank/speaking không có option nào được chọn nên code lấy đại một option sai → Mistake Bank ghi nhận đáp án user chưa từng chọn.
- ✅ ĐÃ SỬA — **[FE-4] Submit thất bại là im lặng** — `moveToNextQuestion` chỉ `console.error` rồi `setIsSubmitting(false)`; user kẹt ở câu cuối và mất hết kết quả.
- ✅ ĐÃ SỬA — **[FE-5] Không có `onError` cho ảnh mạng ở bất kỳ đâu** — URL 404 cho ra ô trống thay vì fallback.
- ✅ ĐÃ SỬA — **[FE-6] `avatar-display.tsx`**: `styles.fallback.lineHeight` cố định 60 trong khi `fontSize` co theo `size` → emoji panda lệch/bị cắt ở avatar nhỏ.
- ✅ ĐÃ SỬA — **[FE-7] Text sai dữ liệu** — popup năng lượng ghi "Năng lượng tối đa là 5" nhưng `MAX_ENERGY = 25`; popover bài học luôn vẽ 3 sao vàng dù `computeStars` chỉ cấp sao cho TIMED_REVIEW.
- ✅ ĐÃ SỬA — **[FE-8] `npm run lint`: 73 lỗi**, toàn bộ là `prettier/prettier` (`npx eslint --fix .` là xong) + 89 warning.

## Decisions

- Stored theme preference in persistent local storage (`user_theme_mode`).
- Effective theme resolves to system scheme when mode is `"system"`, or directly to `"light"` / `"dark"`.
- Tab bar: edge-to-edge instead of floating pill — less Duolingo-clone look.
- Active indicator: pill capsule (icon + label) instead of dot indicator — more informative, less cluttered.
- Leaderboard podium pattern (top 3 elevated, list for 4+) chosen over a flat list for all ranks — reads as a real leaderboard rather than a generic settings-style list.
- Jest was fully broken project-wide before this change (even a trivial `1+1` test crashed) due to `jest-mock`/`jest-environment-node` being stuck on 29.x while `jest`/`jest-runtime` are 30.x, plus a missing `test-renderer` peer dep, no CSS transform for `@/global.css`, and `expo-asset` only being nested under `expo`'s own `node_modules` (Metro resolves it project-wide; Jest/Node do not). Fixed via `package.json` `overrides` (pinning `jest-mock`/`jest-environment-node` to `30.4.1`), adding `test-renderer` devDependency, a `jest.style-mock.js` CSS stub, and a `moduleNameMapper` alias for `expo-asset` in `jest.config.js`. This unblocks all future RN tests, not just the leaderboard one.
- **Không dùng `hanzi-writer` cho phần tập viết**: thư viện đó thao tác DOM/SVG của trình duyệt nên không chạy được trên React Native. Thay bằng `react-native-svg` (đã có sẵn) + bộ chấm nét tự viết trong `src/utils/stroke-order.ts`.
- Ngưỡng chấm nét đặt theo tỉ lệ viewBox (mean 16%, điểm đầu/cuối 26%) nên hoạt động với cả dữ liệu lưới 109 (KanjiVG) lẫn 1024; kích thước viewBox được suy ra từ toạ độ lớn nhất trong path thay vì hard-code.
- Vẽ sai quá `maxMistakes` (mặc định 2) thì câu vẫn cho qua nhưng gửi lên server là `isCorrect: false` — đúng tinh thần tài liệu BE.
- Trạng thái nét đang vẽ giữ trong `useRef` (không phải state) vì sự kiện chạm bắn nhanh hơn nhịp re-render.
- Cửa hàng giữ nền sơn mài cố định cho quầy ở cả 2 theme (phần duyệt hàng vẫn theo theme) — đó là thứ làm nó ra dáng "một nơi" thay vì một panel nữa.
- Độ hiếm suy ra từ giá thay vì gán cứng theo `itemType`, để BE thêm/đổi giá item là UI tự khớp.
- Đồng xu (`CoinMark`) và biển hiệu quầy vẽ bằng View (đồng mon lỗ vuông), KHÔNG dùng ký tự 円/市: font mặc định render chữ Hán ở cỡ nhỏ thành ô vuông/khó đọc — đã thấy trên emulator.
- `ShelfTabs` là 4 ô chia đều, không cuộn ngang: bản cuộn khiến kệ "Túi đồ" nằm ngoài màn hình.
- `ItemSheet` phải trừ chiều cao thanh tab nổi (56 + safe-area) chứ không chỉ safe-area, nếu không nút "Đóng" bị thanh tab che.
- Không thử luồng mua thật trên máy (sẽ tiêu xu của tài khoản test) — luồng mua/dùng/trang bị được phủ bằng test tích hợp với API mock.
- Mock `react-native-reanimated` trong `jest-setup.js` được bổ sung `useReducedMotion` (mock có sẵn của thư viện thiếu hook này).
- **Nhiệm vụ dùng ray dọc, KHÔNG dùng slab tối ở đầu trang như Cửa hàng** — nếu 2 tab cùng mở đầu bằng một tấm tối thì chúng đọc ra như một, dù màu khác nhau.
- **Đỏ chu sa chỉ dành cho con dấu.** Bản dựng đầu tô cả thẻ "đã xong" bằng đỏ (viền + nền + thanh + chữ); chụp trên máy thì nó đọc ra LỖI chứ không phải thành tựu. Đổi thẻ xong sang vàng ("đã kiếm được"), giữ đỏ đúng một chỗ.
- **Bỏ eyebrow "BÀI HỌC"/"TRẢ LỜI" trên thẻ**: nó không mã hoá thông tin gì mới (icon + tiêu đề đã nói rồi). Bỏ đi thì cả trang vừa đúng một màn hình, không phải cuộn.
- Vàng lá `#F5C451` làm CHỮ trên thẻ sáng chỉ đạt ~1.7:1 → thêm helper `goldInk(isDark)` đổi sang `#A97516` ở light mode (~4.9:1, đạt AA).
- Gờ vát dưới thẻ (`lip`) không được dùng `colors.border`: trên nền kem nó tàng hình và thẻ mất cảm giác "có độ dày". Dùng `QuestPalette.dormant + "59"` cho cả 2 theme.
- Nút rương bị khoá không được dùng `colors.backgroundElement` (kem ở light mode) — nó trông như nút vàng đang bật được. Dùng `borderSubtle` ở light.
- Thanh tiến độ 0% dùng track pha màu (`accent + "26"`) thay vì xám trung tính: ở bảng chưa làm gì thì track là màu duy nhất trên thẻ, để xám chết trông như hỏng.
- Nét đứt trên ray xếp bằng nhiều `View` nhỏ chứ không dùng `borderStyle: "dashed"` — RN đổ về nét liền trên vài bản Android.
- Đồng hồ đếm ngược đặt mốc là nửa đêm local (`nextResetAt()`) vì BE chưa trả timestamp reset; nếu sau này BE có thì thay chỗ đó.
- RNTL 14 trả kết quả `render()` BẤT ĐỒNG BỘ — phải `await render(...)` mới có query (`getByText`...); spread kết quả ra sẽ mất hết query.
- **Luyện hội thoại KHÔNG nhét vào luồng bài học chính** (`lesson/[id].tsx`): engine chấm điểm/XP hiện tại giả định đúng-sai tất định, còn hội thoại mở có kết quả bất định (lạc đề, tin cậy thấp). Chèn vào giữa bài học đang giữ streak sẽ gây ức chế. Đặt ở Practice Hub (`(tabs)/review.tsx`) — nơi đã có sẵn pattern hub và không cần thêm tab thứ 7.
- **KHÔNG dùng LLM cho tính năng hội thoại**: vi phạm cả 3 ràng buộc của đồ án (tự train được / không tốn phí / deploy được). LLM API tốn tiền theo lượt gọi; LLM tự host cần 2-6 GB, không lọt free tier 512 MB; cả hai đều là hộp đen khó giải thích với hội đồng.
- **n-gram KÝ TỰ chứ không phải n-gram TỪ**: tiếng Nhật không có dấu cách, không có MeCab thì cả câu thành 1 token. Đo được: 0.765 so với 0.271 — chênh 2.8 lần. Đây cũng là lý do KHÔNG cần cài MeCab/Sudachi (từ điển 50-100 MB + biên dịch native trên Windows).
- **Hồi quy Logistic thay vì LinearSVC/MLP dù điểm sát nhau**: LinearSVC không cho xác suất nên không đặt ngưỡng tin cậy được — mà ngưỡng chính là nền móng của cơ chế chống lạc đề. MLP hơn đúng +0.003 nhưng nặng gấp **81 lần** (75.5 MB so với 0.93 MB).
- **Mô hình Transformer (MiniLM đa ngữ) THUA TF-IDF trên chính bài toán này**: kém hơn về accuracy theo kịch bản (0.751 so với 0.765) và kém hẳn ở phát hiện lạc đề (OOS-F1 0.578 so với 0.697), trong khi lớn hơn 456 lần và chậm hơn 33 lần. Lý do: bài toán phân biệt bằng mẫu mặt chữ ở đuôi câu, không phải ngữ nghĩa sâu; và lớp `out_of_scope` quá đa dạng về nghĩa để gom lại trong không gian nhúng.
- **Siêu tham số không phải nút thắt**: grid search 280 tổ hợp × 5 fold chỉ cho +0.005 macro-F1, trong khi MỘT lần sửa nhãn (`大丈夫です`/`けっこうです` từ `affirm` sang `deny`) giảm lỗi gây hại 13.3% → 12.2%. Muốn tốt hơn thì thêm/làm sạch dữ liệu.
- **Ngưỡng tin cậy 0.30** là điểm gãy của đường cong đánh đổi: từ 0.25 lên 0.30 đổi 1.1 điểm "trả lời đúng" lấy 4.4 điểm "chặn lạc đề" (lãi); từ 0.30 lên 0.35 chỉ được 2.5 điểm mà mất 4.0 điểm (lỗ).
- **Đỏ báo lỗi CHỈ dùng cho `invalid_input`**, không dùng cho `off_topic` / `wrong_time`: trong hai trường hợp đó câu tiếng Nhật của người học thường ĐÚNG, tô đỏ sẽ dạy họ điều sai. Dùng xanh dương ("thông tin") và vàng ("cần nói rõ hơn").
- **Dịch vụ AI phi trạng thái, client giữ `state` + `consecutiveFailures`**: free tier ngủ đông và restart container, phiên lưu RAM server sẽ bốc hơi giữa cuộc hội thoại. Đổi lại không cần Redis/DB.
- **Không commit file `.joblib`**, train lúc build (Dockerfile/render.yaml): tránh cảnh mô hình cũ chạy trên dataset mới. Train chỉ 2 giây nên nằm gọn trong build.
- **torch/sentence-transformers KHÔNG nằm trong `requirements.txt`** — chỉ ở `requirements-dev.txt` để chạy đối chứng. Đây là thứ giữ ảnh triển khai ~120 MB thay vì ~2.5 GB.
- Công cụ Edit làm file bị đổi sang **CRLF** khiến prettier báo hàng trăm lỗi `Delete ␍`; file tạo mới bằng Write thì vẫn LF. Sau khi sửa file có sẵn, chạy `npx prettier --write` đúng phạm vi file đã động vào.
- `adb exec-out screencap` của emulator này chết sau nhiều lần chụp (ImageReader hết buffer) và trả ảnh đen toàn màn; app vẫn chạy bình thường — kiểm bằng `maestro hierarchy` trước khi nghi app crash, và `adb reboot` để chụp lại được.
- **Thẻ dạy được suy ra ở CLIENT từ `metadataJson` của đề bài, không thêm API mới**: mỗi câu hỏi đã mang sẵn `symbol`/`kana`/`jp` + `romaji` + `vn` + ảnh + âm thanh, gộp lại là đủ dạy. Cách này khiến thẻ luôn khớp đúng 10 câu được random cho phiên đó — không dạy thừa thứ không hỏi, không hỏi thứ chưa dạy — và không phải đụng vào backend.
- **Pha dạy có nút "TÔI ĐÃ BIẾT — BỎ QUA" thay vì tự tắt khi `isReplay`**: Duolingo bỏ qua phần giới thiệu khi học lại, nhưng buổi demo cần cho giáo viên xem lại được nhiều lần. Nút bỏ qua thoả cả hai.
- **Kana không lặp romaji xuống dòng nghĩa**: với câu "Chữ 「あ」 đọc là gì?" thì đáp án đúng CHÍNH LÀ romaji, để nguyên thì thẻ hiện "a" hai lần. Test tích hợp bắt được lỗi này ("Found multiple elements with text: a").
- **`resolveMediaUrl` đặt bên trong `useAudio`, không rải ở từng nơi gọi**: hook đó là cửa duy nhất của mọi audio trong app, nên sửa một chỗ là toàn bộ nút loa (quiz, bảng chữ cái, luyện nghe) hết câm cùng lúc.
- **`FlatList` cho bản đồ lộ trình với `windowSize={3}`, `initialNumToRender={1}`**: mỗi chủ đề là một đoạn bản đồ rất cao, giữ 1-3 chủ đề quanh khung nhìn là đủ và kéo số node SVG sống cùng lúc từ ~95 xuống ~một tá.
- **Handler của bản đồ phải ổn định (`useCallback` + đọc `energy` qua ref)**: closure tạo mới mỗi lần render sẽ vô hiệu hoá `React.memo` của `TopicSection`, coi như không tối ưu gì.
- **`StartLessonOption.content` đổi thành `string | null`**: backend trả `null` ở câu `SELECT_IMAGE` (nhãn nằm trong `metadataJson.label`), type cũ khai `string` là sai so với dữ liệu thật.
- Comment `// ...` bê nguyên từ mảng JS vào JSX sẽ RENDER RA MÀN HÌNH thành chữ; phải đổi sang `{/* ... */}`. Lint rule `react/jsx-no-comment-textnodes` bắt được — đáng chạy `eslint` sau mỗi lần bê khối JSX sang chỗ khác.
- **KHÔNG chạy `git stash` để đo baseline lint**: `core.autocrlf=true` khiến `stash pop` trả file về dạng CRLF và làm hỏng cả lint lẫn diff. Muốn so với HEAD thì dùng `git show HEAD:path | npx eslint --stdin --stdin-filename path`.
- **Script chuẩn hoá CRLF→LF phải loại trừ `.venv`, `node_modules`, `artifacts`**: chạy đè lên `ai-service/.venv` làm hỏng toàn bộ `.exe` và file `.joblib` (venv phải dựng lại + train lại mô hình). Chỉ quét đúng danh sách file mình đã sửa.
- **Ba tầng tra cứu trong `_decide`, `state.expects` LUÔN xét trước**: hai lưới đỡ (`anytime`, `ALWAYS_ALLOWED`) chỉ đỡ những state không viết gì. Nhờ vậy các cạnh soạn tay mang ý đồ dạy học vẫn thắng — ví dụ `thanks` ở `paying` (nhà hàng) vẫn kết thúc bài, `restaurant_ask_menu` ở `seated` vẫn dùng câu đáp riêng có "一番人気" chứ không rơi xuống bản dùng chung.
- **`wrong_time` được GIỮ LẠI, chỉ thu hẹp về đúng chỗ của nó**: đòi hoá đơn khi chưa ngồi vào bàn, đòi trả tiền khi chưa chọn đồ. Ở đó nó dạy TRÌNH TỰ. Bỏ hẳn thì mất luôn giá trị sư phạm; để nguyên thì nó phạt CÁCH DIỄN ĐẠT, mà cách diễn đạt thì không có gì sai.
- **`anytime` khai ở cấp KỊCH BẢN chứ không chép cạnh vào từng state**: `self_intro` có 6 state × 6 ý định nội dung = 36 cạnh phải chép tay, và mỗi lần thêm state là phải nhớ chép lại. Khai một lần thì không thể quên.
- **Câu xã giao không tính vào chuỗi hỏng** (cùng lý lẽ với `meta_about_bot`): nếu tính, người học càng lịch sự càng nhanh bị đẩy tới trạng thái "cần cứu".
- **`affirm`/`deny` CỐ Ý không nằm trong `ALWAYS_ALLOWED`**: はい/いいえ chỉ có nghĩa khi vừa được hỏi câu có-không, nên `wrong_time` ở đó là phản hồi đúng. Đây là phần còn lại của 17.9%.
- **Cần bộ đo riêng cho tầng FSM**: `evaluate.py` đo bộ phân loại, `evaluate_system.py` đo phân loại + luật quyết định — cả hai DỪNG TRƯỚC máy trạng thái. Mô hình hoàn hảo vẫn cho trải nghiệm tệ nếu FSM từ chối câu nó hiểu đúng, và không có bộ đo nào bắt được điều đó cho tới khi người dùng báo lỗi.
- **Gộp 「〜に行きたいです」 vào `directions_ask_how_to_get` thay vì tạo lớp mới**: câu đáp đúng vẫn là chỉ đường y hệt, nên thêm một lớp chỉ làm bộ phân loại phải phân biệt hai mẫu mặt chữ mà kết quả cuối cùng không khác gì. Ít lớp hơn cũng giúp lớp `out_of_scope` dễ thở hơn.
- **Mỗi lần thêm mẫu câu có đuôi trùng với `out_of_scope` thì PHẢI thêm cặp đối chứng**: đây là lần thứ hai trong dự án chuyện nhãn quan trọng hơn siêu tham số. Một chiều dữ liệu không đủ — mô hình học đuôi câu trước, danh từ sau.
- **Ranh giới `〜に行きたいです` được khoá bằng test hai chiều** (`test_stating_a_nearby_destination_asks_for_directions` + `test_stating_a_far_destination_stays_out_of_scope`): ai thêm một địa danh xa vào `directions` hoặc bỏ nhóm đối chứng khỏi `out_of_scope` sẽ làm đổ ranh giới, và test bắt được ngay.
- **Server AI phải restart bằng tay sau khi train lại**: `--reload` không đủ. Muốn hết thì `pip install watchfiles`, nhưng `artifacts/*.joblib` vẫn nằm ngoài `--reload-dir` nên train lại luôn cần restart.
- **LLM dùng ở khâu SINH DỮ LIỆU, không dùng lúc phục vụ**: quyết định [KHÔNG dùng LLM cho hội thoại] vẫn giữ nguyên cho runtime, nhưng lý do "tốn tiền theo lượt gọi" không áp dụng cho việc gọi một lần lúc build. Được toàn bộ cái lợi của LLM (đẻ ra cách diễn đạt) mà không mất gì (vẫn 0 đồng, vẫn giải thích được, vẫn lọt free tier 512 MB).
- **Dữ liệu sinh để RIÊNG thư mục `generated/`, không trộn vào file hạt giống**: (1) kiểm toán được — luôn trả lời được "câu này người viết hay máy sinh"; (2) revert bằng cách xoá thư mục; (3) train được hai lần có/không để đo đóng góp. Đây là con số hội đồng sẽ hỏi.
- **Cổng kiểm duyệt phải chạy ĐỘC LẬP với cổng sinh** (`--check`): dữ liệu sinh có thể do người dán vào, do nhà cung cấp khác, hoặc do một phiên trợ lý viết thẳng. Cổng chỉ canh đúng con đường mình đẻ ra thì vô dụng.
- **Tỉ lệ ký tự tiếng Nhật KHÔNG tách được rác khỏi từ mượn hợp lệ**: 「Wi-Fiはありますか」 0.55 và 「AIですか」 0.67 là hợp lệ, còn 「friendly になれたら…」 0.58 và 「窓side の席は…」 0.69 là rác — hai nhóm chồng lên nhau. Thứ tách được là ĐỘ DÀI chuỗi Latin liên tiếp (từ mượn thật đều rất ngắn), cộng một allowlist nhỏ cho ATM/PayPay/Suica.
- **Cần luật riêng cho hệ chữ lạ**: 「값段を教えてください」 có đúng một ký tự Hangul trên mười, tỉ lệ 0.90 — lọt mọi ngưỡng hợp lý. Mô hình sinh văn bản hay trượt ngôn ngữ giữa chừng kiểu này, và nó đầu độc dataset âm thầm vì không test nào đỏ.
- **Đo trên dataset đã trộn là SAI ý nghĩa**: câu máy sinh nằm cả trong tập test thì một phần điểm là đo khả năng đọc chính văn máy sinh. `evaluate_augmentation.py` giữ tập test thuần câu viết tay. Chênh lệch rất thật: cùng thay đổi đó, đo trộn cho lỗi gây hại TĂNG 0.2 điểm, đo sạch cho GIẢM 2.5 điểm.
- **KHÔNG đưa câu test vào dữ liệu sinh**: khi 「レストランに行きたいです」 hỏng, cách sửa là thêm các địa điểm katakana dài KHÁC (ファミレス・マクドナルド・ショッピングモール) rồi để mô hình tự tổng quát hoá. Thêm thẳng câu test vào train là biến test thành phép thử trí nhớ.
