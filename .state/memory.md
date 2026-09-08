# Memory

## What Works

- Follow established project structures (such as separating concerns into `src/components/`, `src/types/`, etc. as defined in workspace rules).
- Use path alias `@/` mapping to `./src/`.
- Use barrel exports (`index.ts`) for clean imports.
- **Biểu tượng Cúp & Huy hiệu Game (Duolingo Style)**: Sử dụng vector SVG thuần túy (`react-native-svg`) thay vì ảnh bitmap/raster hoặc sticker có viền trắng. SVG cho phép render 2-tone cel-shading chuẩn Duolingo, vệt sáng cong reflection, quai chữ C bo góc, đế nổi 3D (`borderBottom` chunky bevel) và nền trong suốt 100% không bị vỡ hạt hay dính khung viền trắng trên bất kỳ màu nền nào.

## What Doesn't

- Never dump everything into a single file.
- Avoid large refactors in a single step without user approval.

## Project-Specific Preferences

- React Native / Expo development target.
- TypeScript for type safety.
- **Backend Codebase Path**: `c:\Users\Endministrator\Documents\BE_NihongoApp` (Có thể đọc file từ đây để lấy thông tin API, tài liệu nhưng KHÔNG ĐƯỢC CHỈNH SỬA trừ khi có yêu cầu).

## Quality & Syntax Guards

- Always check for duplicate imports (e.g. duplicate identifiers like `Spacing, Spacing`) during chunk replacements.
- Always execute `npx tsc --noEmit` immediately after modifying `.ts` or `.tsx` files to guarantee 0 syntax/type errors before responding to the user.

## Jest / `npm test` Gotchas (fixed once, keep this working)

- `package.json` has an `overrides` block pinning `jest-mock` and `jest-environment-node` to `30.4.1` — without it, npm hoists `jest-environment-node@29.7.0` from `react-native`'s own deps, which pairs with a `jest-mock@29` `ModuleMocker` that lacks `clearMocksOnScope`, and jest-runtime@30 crashes on literally any test (`this._moduleMocker.clearMocksOnScope is not a function`) before it even runs. Don't remove the overrides.
- `test-renderer` (the standalone npm package, not `react-test-renderer`) is a required devDependency — `@testing-library/react-native@14.x` imports it directly. Its `render()` is now `async`; always `await render(...)` in tests.
- `jest.config.js` maps `\.css$` to `jest.style-mock.js` (needed because `src/constants/theme.ts` imports `@/global.css`) and aliases `expo-asset` to `node_modules/expo/node_modules/expo-asset` (Metro resolves `expo-asset` project-wide since Expo SDK packages don't declare it as a direct dependency; plain Node/Jest resolution does not, so anything that pulls in `expo-font` — e.g. `@expo/vector-icons`, which eagerly requires every icon family — fails to resolve without this alias).
- `jest-setup.js` mocks `react-native-reanimated` via its own `/mock` export, and sets `globalThis.IS_REACT_ACT_ENVIRONMENT = true` globally (React 19's act() flag is otherwise only true during the synchronous body of an `act()` call, causing spurious "not configured to support act()" console.error noise from async effects — harmless, tests still pass, but worth knowing so it isn't "fixed" again).

## React Native Testing Library (v14 + React 19) Gotchas

- `render()` là **async** -> luôn `await render(...)`. Với chuỗi sự kiện chạm liên tiếp (`touchStart`/`touchMove`/`touchEnd`) cũng nên `await fireEvent(...)`, nếu không act() bị chồng lấn và các test sau đó render ra cây rỗng.
- Sau `fireEvent.press`, state update KHÔNG flush đồng bộ: dùng `await findByText(...)` / `waitFor(...)` thay cho `getByText(...)` ngay sau đó, nếu không sẽ thấy cây cũ.
- Component đọc dữ liệu từ chuỗi sự kiện chạm phải tích luỹ vào `useRef` (state có thể chưa re-render kịp giữa các sự kiện).

## Font: không render chữ Hán/Kana bằng Text mặc định ở cỡ nhỏ

Trên emulator Android, `<Text>` mặc định render 円 / 市 ở cỡ nhỏ (≤12px) thành ô vuông hoặc vệt không đọc được, và ở cỡ rất lớn cũng cho ra hình khối lạ. Với ký hiệu trong UI (đồng xu, watermark), hãy **vẽ bằng View** thay vì dựa vào glyph. Ví dụ `src/components/shop/coin-mark.tsx`: hình tròn vàng + lỗ vuông ở giữa (đồng "mon"), đọc rõ từ 14px đến 240px và không phụ thuộc font.

Chữ Nhật _nội dung_ (bảng chữ cái, câu ví dụ) vẫn render bình thường ở cỡ lớn — chỉ tránh dùng làm ký hiệu nhỏ.

## Bottom sheet trong tab screen phải trừ chiều cao thanh tab nổi

`CustomTabBar` trong `src/app/(tabs)/_layout.tsx` vẽ **đè** lên nội dung màn hình. Sheet/footer neo đáy phải dùng `56 + Math.max(insets.bottom, 8)` (chiều cao thật của tab bar), không chỉ `insets.bottom`, nếu không nút cuối bị che. Xem `src/components/shop/item-sheet.tsx` và footer của `src/app/(tabs)/characters.tsx`.

## Mock `react-native-reanimated` thiếu vài hook

`react-native-reanimated/mock` KHÔNG export `useReducedMotion` (file mock ghi rõ "ADD ME IF NEEDED"). Gọi trực tiếp trong component sẽ làm test crash. `jest-setup.js` nay bọc lại mock và bổ sung hook này — thêm hook khác vào cùng chỗ nếu cần.

## RTL v14 + React 19: `render()` trả về thenable

`render(...)` của `@testing-library/react-native` trong repo này trả về một object kiểu Promise (act của React 19), nên phải `const { getByText } = await render(...)`. Không await thì `Object.keys(result)` rỗng và mọi query báo "getByText is not a function".

## `.agents/skills/` vs `.claude/skills/` (đa công cụ trên cùng repo)

- Antigravity đọc `.agents/skills/`, Gemini CLI đọc `.gemini/skills/`, Claude Code CHỈ đọc `.claude/skills/` (+ `~/.claude/skills/` + plugin). Không có công cụ nào đọc thư mục của công cụ khác.
- Muốn dùng chung một skill mà không nhân bản vào git: `New-Item -ItemType Junction -Path .claude\skills\<ten> -Target .agents\skills\<ten>` (junction trên Windows KHÔNG cần quyền admin), rồi thêm đường dẫn junction vào `.gitignore` — git đi xuyên junction và sẽ thấy toàn bộ file như untracked.
- **(2026-08-24) Đã dừng duy trì song song.** Ba skill quản trị (`state-keeper`, `goal-tracker`, `behavior-guard`) trong `.agents/skills/` giờ có banner "Antigravity only" ở đầu file, và mục "Project Skills Integration" trong `AGENTS.md` không còn chép lại nội dung của chúng nữa — chỉ còn một dòng trỏ tới các mục đã có sẵn trong AGENTS.md ("State Maintenance & Discipline", "Behavior Rules") + `tsc-gate` hook. Sửa 3 file SKILL.md đó giờ an toàn, không cần đồng bộ tay sang AGENTS.md nữa (vì AGENTS.md không còn bản sao nội dung của chúng).

## Stop hook chặn `tsc` (`.claude/hooks/tsc-gate.mjs`)

- Máy này KHÔNG có `jq`. Viết hook bằng Node (`node .claude/hooks/tsc-gate.mjs`) thay vì pipeline `jq` — Node chắc chắn có, và tự lo escape JSON.
- Hook Stop trả `{"decision":"block","reason":"..."}` để buộc agent sửa rồi mới được kết thúc turn; trả exit 0 im lặng để cho qua.
- Hai chi tiết bắt buộc: (1) chỉ chạy `tsc` khi `git status --porcelain -- '*.ts' '*.tsx'` có kết quả, nếu không mọi turn hỏi-đáp đều tốn ~7s; (2) đếm số lần chặn liên tiếp (file đếm trong `os.tmpdir()` theo `session_id`) và nhả sau 3 lần, nếu không một lỗi type không sửa được sẽ khoá vòng lặp vĩnh viễn.

## RNTL trong repo nay: `render()` tra ve Promise

`@testing-library/react-native` 14.0.1 o day tra ve Promise, khong phai object query.
Viet `const { getByText } = render(...)` la dinh "getByText is not a function", con dung
`screen` thi dinh "`render` function has not been called". Phai `await`:

```tsx
it("...", async () => {
  const { getByText } = await render(<Foo />);
});
```

Modal (vd o `JapaneseText`) chi xuat hien sau mot vong render nua -> dung `findByText` /
`findAllByText` chu khong phai `getByText` ngay sau `fireEvent`.

## `build.py` cua bo seed: sua noi dung o dau

`BE_NihongoApp/test-data/demo-seed/` — `data_topics_a/b/c.py` la noi dung, `build.py` la
cach sinh de tu noi dung do. Sua xong phai chay du 4 buoc, thieu buoc nao cung lech:
`python build.py` -> `python build_users.py` -> `python make_media.py` -> `bash load_all.sh`.
`build_users.py` import thang `S` cua `build.py` nen id bai/cau luon khop.

## `ai-service` (Python): chay & thu tren may nay

- Venv o `ai-service/.venv` — dung `.venv/Scripts/python.exe`, KHONG dung `python` he thong
  (he thong khong co fastapi/yaml). Chay: `PYTHONPATH=src .venv/Scripts/python.exe -m uvicorn nihongo_ai.api:app --port 8000`.
- Console Windows mac dinh cp1252 -> `print()` tieng Viet/Nhat se nem `UnicodeEncodeError`.
  Luon dat `PYTHONIOENCODING=utf-8` truoc lenh python/pytest.
- **`curl` trong Git Bash lam hong UTF-8 trong `-d`**: goi API kem tieng Viet co dau se toi
  server duoi dang chuoi rong (bao 400 gia). Thu bang script `urllib` cua Python thay vi curl.
- Ghi file `.py`/`.ts` bang `io.open(p,'w')` cua Python tren Windows se sinh CRLF -> prettier
  bao hang tram loi `Delete ␍`. Dung `newline=''` (giu nguyen) hoac chay `npx eslint --fix` sau.

## Gemini REST v1beta: khoa sai tra 400 chu khong phai 401

Endpoint `generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` tra
**400** kem `"API key not valid"` khi khoa sai — khong theo thong le REST (401/403). Da bat
rieng truong hop nay trong `llm._http_message`, co test o `tests/test_api.py`.

## Gemini: model bi khai tu, va model moi nhat chua chac dung duoc

- `gemini-2.0-flash` da chet (404: "no longer available"). Khi doi model, KHONG doan —
  liet ke bang: `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$KEY"`
  roi loc `supportedGenerationMethods` co `generateContent`.
- **Ban moi nhat thuong 503 "high demand"**: do 2026-08-25, `gemini-3.7-flash` va bi danh
  `gemini-flash-latest` deu 0/3 lan thanh cong, trong khi 3.6/3.5/2.5-flash deu 3/3.
  -> Ghim phien ban cu the, tranh bi danh `latest`. Mac dinh hien tai: `gemini-3.5-flash`
  (~4.0s/luot). Ly do day du trong `ai-service/src/nihongo_ai/llm.py`.
- Do tre thuc te qua HTTP: `/start` ~4s, `/respond` 4-6s, `/summary` ~12s.

## Coach-mark / spotlight: `measureInWindow` khong cung he toa do voi lop phu

`measureInWindow` tra toa do theo **CUA SO**, con lop phu tuyet doi (`StyleSheet.absoluteFill`)
ve theo he toa do cua chinh no. Hai he chi trung nhau khi lop phu bat dau dung o (0,0) cua
cua so — SAI khi goc app nam duoi thanh trang thai. Trieu chung: lo khoet lech xuong duoi
~status-bar-height, "chieu" vao vung trong.

Cach sua dung: lop phu tu `measureInWindow` CHINH NO mot lan moi buoc, roi tru goc do khoi
rect cua phan tu dich (`origin` trong `src/components/tutorial/tutorial-overlay.tsx`). Tu chinh
dung tren moi may/cau hinh edge-to-edge, khong phai doan chieu cao status bar.

Hai diem kem theo:

- View bao quanh phan tu dich PHAI co `collapsable={false}`, khong Android gop View vao cha
  va `measureInWindow` tra ve 0.
- Man trong `(tabs)` da mo la con song mai -> dang ky thu gi voi context toan cuc thi dung
  `useFocusEffect`, KHONG dung `useEffect` (effect theo vong doi khong chay lai o lan ghe sau).

## Metro KHONG thay file sua bang script (Windows)

Trieu chung: sua code xong, app tren emulator van hien y nguyen giao dien cu, ke ca khi
da reload. `grep` trong `src/` xac nhan chuoi cu da bien mat -> nguon dung, bundle sai.

Nguyen nhan: du an khong co watchman, Metro dua vao `fs.watch` cua Node. Ghi file tu
tien trinh NGOAI (script python/sed, khong phai editor) rat hay bi bo sot -> Metro giu
nguyen ban da transform tu truoc.

Cach xac minh dut diem (khong doan): tai thang bundle roi grep dinh danh ASCII chi co o
code moi.

```bash
curl -s "http://localhost:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true&transform.routerRoot=src/app" -o b.js
grep -c TenComponentMoi b.js   # 0 = Metro dang phuc vu cache cu
```

Bundle that ~15 MB. Neu chi ~6 MB va khong co dinh danh nao cua app thi chac chan la cache hong.

Cach sua:

```bash
# dung Metro (lay PID tu cong 8081), roi:
rm -rf "$LOCALAPPDATA/Temp/metro-cache" "$LOCALAPPDATA/Temp"/metro-file-map-*
npx expo start --clear
```

Ghi chu them khi lai emulator bang adb:

- Git Bash doi `/sdcard/ui.xml` thanh `C:/Program Files/Git/sdcard/...`. Dung `MSYS_NO_PATHCONV=1`.
- `uiautomator dump` bao "could not get idle state" tren man co Lottie chay lien tuc.
- Deep link vao thang man hinh nhanh hon mo toa do tap:
  `adb shell am start -a android.intent.action.VIEW -d "frontend://quiz/1?lessonId=1"`
- Ho `sleep` bi chan trong Bash tool -> dung `adb shell sleep 3` (chay tren may ao).

## Tối ưu hiệu năng bản đồ lộ trình (Roadmap FlatList + SVG + Reanimated)

- **Tránh tạo Reanimated hook đại trà trên danh sách dài:** Khi danh sách có gần 100 node bài học, KHÔNG khởi tạo `useSharedValue` / `useAnimatedStyle` / `AnimatedPressable` cho từng node. Chỉ duy nhất node đang mở (`isActive`) mới bọc Reanimated; các node tĩnh dùng `Pressable` thuần.
- **Tiền tính toán SVG Polygon Points:** Không gọi `Math.cos`/`Math.sin` và nối chuỗi polygon points ở mỗi lượt render của từng node — định nghĩa hằng số `HEX_POINTS_OUTER/INNER/SHIMMER` ở module scope.
- **SVG Bezier Dash Overhead trên Android:** Tuyệt đối tránh `strokeDasharray` trên các đường cong Bezier dài hàng nghìn pixel; Android Skia/Canvas phải tích phân cung đường liên tục gây drop frame nghiêm trọng. Thay bằng đường kẻ mờ thuần.
- **FlatList Full Pre-rendering cho Bản đồ Lộ trình (TopicSection):**
  - **Khắc phục lag khi vuốt nhanh (fling):** Không dùng virtualization hẹp kèm `removeClippedSubviews={true}` trên Android vì Android Skia liên tục unmount/mount lại native canvas của các thẻ `<Svg>` khổng lồ, gây nghẽn JS thread (`dt: 680-1008ms`).
  - **Cấu hình chuẩn tối ưu:** `initialNumToRender={14}`, `maxToRenderPerBatch={14}`, `windowSize={15}`, `removeClippedSubviews={false}`. Vì mỗi `TopicSection` đã hợp nhất vào 1 thẻ `<Svg>` duy nhất (<60KB), việc dựng sẵn toàn bộ 14 chủ đề nằm trong GPU texture giúp người dùng vuốt nhanh (fling) mượt mà 60-120fps mà không bị khựng hay drop frame.
  - `scrollEventThrottle={16}`: Giữ mượt mà 60fps khi cuộn.

## Context Re-render Cascade & Performance Anti-patterns

- **Bắt buộc memoize Context Value:** Mọi Provider (`Gamification`, `Auth`, `Toast`, `Tutorial`, `Onboarding`, `Quiz`) PHẢI bọc `useMemo` cho `value` và `useCallback` cho mọi method. Tránh truyền object literal `value={{ ...state, fn }}` trực tiếp vào Provider vì mỗi render của cha sẽ tạo object mới khiến toàn bộ cây con (tất cả các tab) re-render cascade.
- **Gộp nhiều async state updates thành 1 lần `setState` duy nhất:** Trong các hàm fetch tổng hợp (như `fetchGamificationData`), sử dụng `Promise.all` và gọi đúng 1 lần `setState` với dữ liệu gộp từ tất cả các nguồn thay vì gọi tuần tự 3-4 lần `setState`.
- **Countdown Hook Memory & Re-render Guard:** Tránh sinh timestamp `resetAt` mới trong thân function component mỗi lần render; dùng `useMemo(() => nextResetAt(), [])` để tránh re-render storm 1s. Trong hook `useCountdown`, luôn guard `setLabel((prev) => (prev === next ? prev : next))` để triệt tiêu re-render khi giá trị không đổi hoặc đã hết giờ.

## Cơ chế số sao (⭐) bài học (TIMED_REVIEW vs NORMAL/TOPIC_REVIEW)

- **Chỉ TIMED_REVIEW mới có sao:** `TIMED_REVIEW` (Ôn tập tính giờ, biểu tượng cú 🦉) là loại bài học duy nhất có hệ thống chấm 1-3 sao (dựa trên thời gian hoàn thành + phạt thời gian).
- **Màn hình kết quả (`QuizResultScreen` / `QuizResultCard`):**
  - `TIMED_REVIEW`: Nhận `starsEarned` từ backend (1-3 sao) và hiển thị tương ứng trong `starsRow`.
  - Các bài khác (`NORMAL`, `TOPIC_REVIEW`, `JUMP_TEST`): Luôn đặt `stars = 0` (chỉ hiển thị phần thưởng EXP & Coin), **không** dùng fallback gán 3 sao khi `expEarned > 0`.
- Roadmap (`HexNode` vs `TimedReviewBadge`):
  - `TimedReviewBadge`: Hiển thị 3 sao dưới mascot cú và trong popover.
  - `HexNode`: Không hiển thị sao trên node lẫn trong popover.

## QR Code & Camera Scanner (expo-camera & Deep Linking)

- **Mock native module `expo-camera` trong Jest:**
  `expo-camera` là native module, không có JS implementation khi chạy dưới Node/Jest. Cần mock `CameraView` và `useCameraPermissions` trong `jest-setup.js` trả về component View có `testID="mock-camera-view"` để các test suite có thể kích hoạt event `barcodeScanned` hoặc kiểm tra props `enableTorch`.
- **Animated.loop trong môi trường Jest:**
  Các animation lặp vô hạn (như laser scan beam trong Viewfinder) sẽ giữ open handle khiến Jest không thoát sau khi chạy xong test (`Jest did not exit one second after the test run has completed`). Luôn guard: `if (isScanning && process.env.NODE_ENV !== "test") { animation.start(); }`.
- **Dọn dẹp timeout (`scanTimeoutRef`):**
  Mọi `setTimeout` trì hoãn điều hướng hoặc kích hoạt lại quét mã phải được lưu vào `useRef` và dọn dẹp trong `return () => clearTimeout(...)` của `useEffect` unmount để tránh rò rỉ bộ nhớ hoặc gọi `setState` trên unmounted component.
- **Deep Linking Scheme & Path Sanitization:**
  Mã QR nên sử dụng scheme chính `nihongo://friends/profile/{username}`, nhưng bộ bóc tách (`parseUsernameFromQR`) cần linh hoạt hỗ trợ cả legacy scheme (`nihongoapp://`), Expo scheme (`frontend://`), URL web (`https://nihongoapp.com/...`) và username thuần. Đồng thời, luôn tự động strip ký tự `@` (`^@+`) trước khi truyền param vào API backend (`GET /api/v1/users/profile/{username}`).

## Duolingo Polish Patterns & Gotchas

- **Safe Context Fallback (`useToast`):**
  Khi viết hook context dùng rộng rãi trong app (`useToast`), thay vì ném lỗi `throw new Error(...)` làm crash các test suite đơn vị hoặc component render độc lập không bọc Provider, hãy fallback về một no-op object `NOOP_TOAST` an toàn.
- **Ghost Slot Word Bank State Isolation:**
  Để tạo hiệu ứng Word Bank giữ nguyên vị trí thẻ (Ghost Slot), không dùng mảng chuỗi đơn giản vì sẽ bị trùng từ và xáo trộn vị trí. Định danh mỗi thẻ bằng ID duy nhất kèm trạng thái `isPlaced: boolean`. Khi chọn thẻ, giữ nguyên thẻ trong bank với kiểu dashed ghost slot, và khi hoàn tác, khôi phục lại đúng vị trí ban đầu. Sử dụng functional state update `setArranged((prev) => ...)` để đảm bảo cập nhật nguyên tử (atomic) tránh race-conditions.
- **SafeAreaProvider initialMetrics trong Jest:**
  Trong Jest, `SafeAreaProvider` thiếu native insets từ OS nên sẽ render ra thẻ rỗng `<RNCSafeAreaProvider />`. Luôn truyền prop `initialMetrics={{ frame: { x: 0, y: 0, width: 400, height: 800 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } }` khi render màn hình trong test.

## Duolingo 3-tier Streak State Machine (`ACTIVE` / `UNLIT` / `FROZEN`)

- **Vấn đề Lazy Backend Streak:** Backend không có cron job reset streak 00:00 và chỉ cập nhật streak khi user nộp bài (`completeAttempt`). Nếu user nghỉ nhiều ngày không học, DB vẫn lưu số streak cũ (ví dụ `2`), khiến user mở app lên thấy số cũ rồi học xong lại bị tụt về `1` gây hụt hẫng.
- **Giải pháp Frontend State Machine (`evaluateStreak`):**
  - Tự động so sánh `lastStreakDate` với ngày hôm nay:
    - `lastStreakDate === today`: `ACTIVE` (🔥 cam sáng rực `#FF9600`, `studiedToday = true`).
    - `diffDays === 1`: `UNLIT` (🩶 xám mờ `#9CA3AF`, chuỗi giữ nguyên, nhắc nhở học bài để giữ chuỗi).
    - `diffDays === 2 && freezeCount > 0`: `FROZEN` (❄️ xanh băng `#00C8FF`, đang được khiên băng bảo vệ).
    - `diffDays >= 2 && freezeCount == 0`: Tự động reset hiển thị về `0` ngay khi mở app thay vì hiển thị con số cũ.
  - Trên màn hình ăn mừng (`StreakExtendedScreen`): Khi `streak === 1` hiển thị "Bắt đầu chuỗi mới!", khi `frozenToday` hiển thị "Khiên băng đã bảo vệ bạn!", khi `streak > 1` hiển thị "Streak đã tăng!".

## Android Native `elevation` & Translucent Background Gotcha ("Ô vuông đen")

- **Nguyên nhân cốt lõi:**
  Trên Android, `elevation` sinh ra bóng đổ native màu đen/xám đục từ hệ thống. Nếu một `View` có màu nền bán trong suốt (`rgba(...)` có alpha < 1) hoặc trong suốt, Android RenderNode vẽ bóng đổ bên dưới và màu nền trong suốt sẽ **để lộ xuyên thấu bóng đổ đen ra mặt trước**, tạo thành một mảng/ô vuông đen đục rất xấu ngay sau nội dung component. Nếu màu nền là đặc (`#FFFFFF` hoặc opaque hex), bóng đổ bị che khuất và chỉ tỏa viền mờ ra ngoài.
- **Giải pháp triệt để:**
  1. Đối với các thẻ / nút bấm tương tác (như `AlphabetCell`, `PracticeMultipleChoice`): Luôn giữ màu nền đặc (`colors.card` hoặc mã hex đặc) ở lớp gốc; nếu cần hiệu ứng tint màu (như độ thông thạo), dùng một lớp `View` phủ (`StyleSheet.absoluteFill`) lên trên nền đặc.
  2. Tắt `elevation` trên Android (`...(Platform.OS === 'ios' ? Shadows.sm : {})`) và chuyển sang phong cách viền nổi 3D đặc trưng của Duolingo (`borderWidth: 2`, `borderBottomWidth: 3.5` hoặc `4`). Phong cách này vừa đẹp, đồng bộ với toàn bộ quiz trong app, vừa triệt tiêu 100% các lỗi bóng đổ đen trên Android.

## Streak Calendar & Lịch Tuần Đồng Bộ Chuẩn Duolingo

- **Tránh dùng logic giả định quá khứ `isPast && streak > 0`:**
  Nếu một modal hay widget hiển thị lịch tuần (T2 đến CN) chỉ kiểm tra `isPast && streak > 0`, tất cả các ngày trong tuần trước ngày hôm nay sẽ luôn bị ngộ nhận là đã học (`✓`), ngay cả khi người dùng chỉ mới học ngày hôm nay (streak = 1).
- **Giải pháp chuẩn:**
  1. Đưa `studyDates: string[]` vào `GamificationState` lấy trực tiếp từ API backend `GET /api/v1/users/me/streak/calendar` (`streakApi.getStreakCalendar(30)`).
  2. Tính toán ngày Thứ 2 đầu tuần bằng công thức: `diffToMonday = (now.getDay() + 6) % 7; monday.setDate(now.getDate() - diffToMonday)`.
  3. Duyệt 7 ngày trong tuần, sinh chuỗi ISO `YYYY-MM-DD` cho từng ngày và đối chiếu `studyDates.includes(isoDate)`: chỉ ngày thực sự có trong danh sách mới hiển thị chấm cam dấu tích `✓`, các ngày quá khứ không học giữ nguyên chấm xám rỗng, đảm bảo khớp 100% với trang Hồ sơ (Profile).

## Onboarding & Placement Test Gotchas & Patterns

- **Kanji Fill Question Delimiter Bug (`\uFF3F`)**:
  `KanjiFillQuestionCard` thực hiện bóc tách câu qua `question.sentence.split("＿")` với ký tự gạch dưới full-width tiếng Nhật `＿` (`\uFF3F`), KHÔNG phải ký tự ASCII gạch dưới `_` thông thường. Nếu dữ liệu seed truyền `_` ASCII, hàm `split` trả về mảng 1 phần tử và không bao giờ render thẻ ô trống `[ ? ]` cho người học điền. Luôn đảm bảo dùng `＿` full-width trong câu hỏi Kanji Fill.
- **Vocab Question Card bắt buộc trường `prompt`**:
  `VocabQuestionCard` render mặt chữ Nhật to ở trung tâm thẻ từ `question.prompt` (và furigana/romaji từ `question.promptRomaji`), không đọc trường `word`. Nếu thiếu `prompt`, thẻ câu hỏi sẽ bị trống trơn không thấy chữ để trả lời.
- **Static vs Dynamic Import cho `expo-haptics`**:
  Tuyệt đối không dùng dynamic import `import("expo-haptics")` bên trong event handler. Dưới môi trường Jest / Node runtime (thiếu cờ `--experimental-vm-modules`), dynamic import sẽ lập tức văng ngoại lệ `A dynamic import callback was invoked without --experimental-vm-modules`. Luôn sử dụng static import `import * as Haptics from "expo-haptics"` ở đầu file.
- **Tránh gọi callback setState của cha bên trong functional update của con**:
  Trong `KanaQuestionCard`, không gọi `onAnswer(validate(...))` hay bất kỳ callback cập nhật state cha bên trong `setArranged((prev) => ...)`. Điều này sẽ kích hoạt cảnh báo nghiêm trọng của React: *"Cannot update a component (`PlacementScreen`) while rendering a different component (`KanaQuestionCard`)"*. Hãy tính toán mảng mới trước hoặc gọi `validate` ngoài phạm vi dispatch của React.

## Friends Hub Routing & Discovery Gotchas

- **Friends Hub Route (`/friends`)**: Màn hình trung tâm quản lý bạn bè tại `src/app/friends/index.tsx` (Route `/friends`) chứa đủ 4 tính năng: Tìm bạn bè (`/friends/search`), Quét QR (`/friends/scan`), Mã QR cá nhân (`/profile/qr`), và Đồng bộ danh bạ (`expo-contacts` gọi `POST /api/v1/users/sync-contacts`).
- **Nút "THÊM BẠN BÈ" ở Profile**: Phải luôn trỏ tới `/friends` thay vì nhảy thẳng vào `/friends/search` để người dùng có thể lựa chọn đồng bộ danh bạ hoặc quét QR.
- **Route xem hồ sơ kết bạn**: Luôn là `/friends/view-search-profile`, không phải `/profile/view-search-profile` (không tồn tại).

## Android Emulator DNS Failure & Google Sign-In `NETWORK_ERROR` Gotcha (Windows Hyper-V/WSL)

- **Triệu chứng**:
  - Khởi chạy app trên máy ảo Android báo lỗi mất mạng (Network Error) ngay màn hình đầu tiên khi gọi API backend.
  - Đăng nhập bằng Google trên máy ảo văng lỗi `Google Sign-In error: NETWORK_ERROR` (code 7).
  - Logcat báo lỗi: `Caused by: m1.kv: Exception in CronetUrlRequest: net::ERR_NAME_NOT_RESOLVED, ErrorCode=1, InternalErrorCode=-105`.
  - Kiểm tra `adb shell ping 8.8.8.8` thành công nhưng `adb shell ping google.com` báo `unknown host`.
- **Nguyên nhân gốc rễ**:
  - Trên Windows có cài WSL2 hoặc Hyper-V, hệ thống sinh ra adapter ảo `vEthernet (WSL)`.
  - Khi QEMU (Android Emulator) khởi động không có cờ `-dns-server`, nó tự dò danh sách adapter của Windows và hay bắt nhầm adapter `vEthernet` (không có DNS server). Do đó, máy chủ DNS ảo nội bộ `10.0.2.3` của emulator bị "điếc" (không thể phân giải bất kỳ hostname nào ra IP).
- **Cách khắc phục**:
  - *Cách 1 (Trực tiếp trong máy ảo đang chạy)*: Vào `Settings` -> `Network & internet` -> `Internet` -> Chạm biểu tượng bút chì/bánh răng ở mạng `AndroidWifi` -> Mở `Advanced options` -> Chuyển `IP settings` từ `DHCP` sang `Static`:
    - IP address: `10.0.2.16`
    - Gateway: `10.0.2.2`
    - Network prefix length: `24`
    - DNS 1: `8.8.8.8`
    - DNS 2: `8.8.4.4`
    -> Bấm `Save`. Emulator sẽ lập tức phân giải được DNS và vào mạng mượt mà.
  - *Cách 2 (Khởi động emulator qua terminal)*: Luôn truyền cờ DNS:
    `emulator -avd Medium_Phone -dns-server 8.8.8.8,1.1.1.1`

## Expo Linking URI Scheme Warning

- Trong `app.json`, trường `"scheme"` nếu truyền mảng (ví dụ `["nihongo", "nihongoapp", "frontend"]`) sẽ kích hoạt cảnh báo:
  `WARN Linking found multiple possible URI schemes in your Expo config. Using 'nihongo'. Ignoring: ... Provide the preferred URI scheme to the Linking API.`

## Gemini 503 High Demand & Model Fallback Gotcha

- **Triệu chứng**:
  - Gọi `/api/v1/conversation/respond` (hoặc `/start`, `/summary`) bị HTTP 502 Bad Gateway.
  - UI frontend hiện banner: *"Gemini đang quá tải hoặc đã hết lượt miễn phí trong phút này. Chờ khoảng một phút rồi thử lại nhé."* hoặc *"Gemini đang gặp sự cố. Bạn thử lại sau ít phút nhé."*
- **Nguyên nhân**:
  1. *Lỗi 503*: Mô hình bị spike demand trên toàn cầu.
  2. *Lỗi 429 ("GenerateRequestsPerDayPerProjectPerModel-FreeTier")*: Các model preview thử nghiệm (như `gemini-3.6-flash`, `gemini-3.7-flash`) bị Google giới hạn cứng chỉ **20 requests/ngày** trên tài khoản miễn phí. Khi gọi tới lượt 21, Google khóa toàn bộ model đó trong 24h.
- **Giải pháp chuẩn**:
  - Sử dụng model GA sản xuất ổn định: `DEFAULT_MODEL = "gemini-2.5-flash"` (hạn mức chuẩn **1,500 requests/ngày** và 15 RPM trên Free Tier).
  - Đặt `FALLBACK_MODEL = "gemini-3.5-flash-lite"`.
  - Cấu hình trong `ai-service/.env`: `GEMINI_MODEL=gemini-2.5-flash`.
  - Triển khai cơ chế **Automatic Fallback** trong `llm.py` cho cả 2 mã lỗi: `if exc.code in (429, 503) and primary_model != FALLBACK_MODEL: raw = _execute(FALLBACK_MODEL)`.

## Impeccable Design, Typography & Motion Accessibility Patterns (Goal 30)

- **Trợ năng Giảm chuyển động (`useReducedMotion`) với Reanimated:**
  - Với các animation chạy lặp vô hạn (vòng breathing glow `ActiveNodeGlow`, nhún nhảy `ActiveFloatingWrapper`, xoay ngọn lửa `StreakModal`), bắt buộc kiểm tra hook `useReducedMotion()`.
  - Khi `reducedMotion === true`, đưa giá trị về trạng thái cân bằng tĩnh (ví dụ `translateY: 0`, `rotation: 0`, `opacity: 0.35`) thay vì chạy `withRepeat(withSequence(...))`. Điều này vừa tôn trọng tiêu chuẩn tiếp cận tiếp nhận thị giác của người dùng, vừa tiết kiệm xung nhịp CPU/GPU khi chạy trên thiết bị cấu hình thấp.
- **Quy hoạch mã màu về Design Tokens ngữ nghĩa:**
  - Không hardcode các mã màu thô như `#FF9600` hay `#00C8FF` rải rác trong component.
  - Luôn sử dụng token từ `@/constants/theme`: `Colors.streakActive` (`#D9762E` - cam đất nung ấm áp của Washi) và `Colors.streakFrozen` (`#7C93C4` - lam băng tuyết Ai-zome), đảm bảo đồng bộ hoàn hảo với Dark/Light theme.
- **Thống nhất hệ icon đơn nhất (`Ionicons`):**
  - Tránh nhập khẩu nhiều họ icon khác nhau (`FontAwesome5`, `MaterialCommunityIcons`) trên cùng một màn hình hoặc luồng chức năng. Chuẩn hóa về họ `Ionicons` mang lại sự đồng nhất về nét vẽ, độ dày (stroke weight) và tối ưu dung lượng bundle.
- **Onboarding Visual Assets (Bespoke vs Generic Stock):**
  - Không dựa vào các URL Unsplash stock photo bên ngoài cho các màn hình trải nghiệm cốt lõi (như Onboarding Interests: Du lịch, Nghệ thuật, Ẩm thực, Manga).
  - Tích hợp asset hình ảnh nghệ thuật vector phẳng đặc trưng văn hóa Nhật Bản trực tiếp trong `assets/images/onboarding/`, nạp qua `imageSource: require(...)` để ứng dụng hoạt động mượt mà offline 100% ngay lần đầu mở app mà không phụ thuộc vào kết nối mạng.

## Pyright / Python Language Server in Multi-Project Root
- **Triệu chứng**: IDE báo lỗi "Cannot find module `pytest`", "`fastapi`", "`nihongo_ai`" trong `ai-service/tests/test_api.py` mỗi khi mở lại IDE.
- **Nguyên nhân**: Root workspace mở ở `Frontend-Native`, trong khi môi trường Python nằm ở `ai-service/.venv`. Khi IDE khởi động, VS Code Python Extension / Language Server ghi đè `venvPath`/`venv` của `pyrightconfig.json` bằng Python toàn cục của hệ thống (`Python312`). Do Python hệ thống không có `pytest`/`fastapi`, Pyright báo thiếu module.
- **Khắc phục triệt để**:
  1. Thêm trực tiếp `ai-service/.venv/Lib/site-packages` vào `extraPaths` trong `pyrightconfig.json` và `.vscode/settings.json` (Pyright luôn nạp `extraPaths` bất kể dùng interpreter nào).
  2. Guard kiểu dữ liệu `yaml.safe_load(...)` trong `topics.py`.
  3. Khi cần, ghim interpreter trong VS Code: `Ctrl+Shift+P` -> `Python: Select Interpreter` -> chọn `ai-service/.venv/Scripts/python.exe`. Chạy `npx pyright` đạt 0 errors.


