# Session State – React Native

## Mission

Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal

1. Impeccable Quiz & Lesson Flow Redesign — full theme-aware redesign of all quiz screens and question components.

## Plan

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

## Progress

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

## Next Steps

- Await user feedback or next feature request.

## Blockers

- None.

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
- `adb exec-out screencap` của emulator này chết sau nhiều lần chụp (ImageReader hết buffer) và trả ảnh đen toàn màn; app vẫn chạy bình thường — kiểm bằng `maestro hierarchy` trước khi nghi app crash, và `adb reboot` để chụp lại được.
