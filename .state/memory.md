# Memory

## What Works

- Follow established project structures (such as separating concerns into `src/components/`, `src/types/`, etc. as defined in workspace rules).
- Use path alias `@/` mapping to `./src/`.
- Use barrel exports (`index.ts`) for clean imports.
- **Biểu tượng Cúp & Huy hiệu Game (Duolingo Style)**: Sử dụng vector SVG thuần túy (`react-native-svg`) thay vì ảnh bitmap/raster hoặc sticker có viền trắng. SVG cho phép render 2-tone cel-shading chuẩn Duolingo, vệt sáng cong reflection, quai chữ C bo góc, đế nổi 3D (`borderBottom` chunky bevel) và nền trong suốt 100% không bị vỡ hạt hay dính khung viền trắng trên bất kỳ màu nền nào.
- **Tầng Chuyển Ngữ Frontend (Localization Presentation Layer)**: Khi backend trả về dữ liệu thô từ database/enum (`BRONZE`, `Streak Freeze`, `Energy Refill`, `bob`):
  - Tuyệt đối không ghép chuỗi thô nửa Anh nửa Việt (`Hạng ${rankName}`, `Đã mua Streak Freeze`).
  - Tập trung hàm chuyển ngữ trong `src/utils/`: `translateRank` (`rank-tier.ts`), `formatItemName` & `formatItemDescription` (`shop.ts`), và từ điển Việt hoá trong `avatar-picker-modal.tsx`.
  - Giúp Frontend hiển thị thuần Việt 100% tự nhiên mà không phá vỡ logic API hay phải chạy migration đổi schema DB.

## What Doesn't

- Never dump everything into a single file.
- Avoid large refactors in a single step without user approval.

## Project-Specific Preferences

- React Native / Expo development target.
- TypeScript for type safety.
- **Backend Codebase Path**: `c:\Users\Endministrator\Documents\BE_NihongoApp` (Có thể đọc file từ đây để lấy thông tin API, tài liệu nhưng KHÔNG ĐƯỢC CHỈNH SỬA trừ khi có yêu cầu).
- **Quy chuẩn Bài thi vượt cấp (JUMP_TEST)**:
  - Chỉ được tính là ĐỖ (`passed = true`) khi thoả mãn đồng thời 3 điều kiện:
    1. Hoàn thành 100% số câu trong bài thi (`attempted >= sessionQuestions`). Bỏ dở hoặc thua giữa chừng tuyệt đối không được pass.
    2. Còn ít nhất 1 tim (`heartsRemaining > 0`). Nếu `heartsRemaining <= 0` là TRƯỢT ngay lập tức.
    3. Số lỗi thực tế $\le 2$ (`JUMP_TEST_MAX_MISTAKES = 2`, tương ứng với 3 tim).
  - Phía UI: Popover trước khi vào bài phải hiển thị minh bạch cả số tim và số năng lượng tiêu tốn: `(3 ❤️ • ${cost} ⚡)`.

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

**CANH BAO: `build.py`/`data_topics_a.py` KHONG PHAI nguon that cua topic 1 & 2 dang
chay tren app.** Tieu de/tu vung trong `data_topics_a.py` (vd "Chao hoi, cam on, xin loi")
khac hoan toan voi topic 1&2 that ("Loi chao, tam biet" / "Goi do an, do uong") — day la
2 bo du lieu WIP rieng biet, khong lien quan. `build.py` con XOA SACH (`DELETE FROM
lessons/topics...`) roi dung lai tu ID=1 -- chay nham vao DB dev se pha het du lieu that.

## Nguon that cua Topic 1 & 2 + cach mo rong THEM (khong xoa/sua cau cu)

- Nguon goc: `src/main/resources/db/migration/V44__replace_topic1_topic2_content.sql`
  (viet SQL tay, KHONG qua build.py). Quy uoc: `SELECT_IMAGE` / `TRANSLATE_TO_VN` (de bai
  tieng Nhat) / `LISTEN_AND_SELECT` / `LISTEN_AND_ARRANGE` / `SPEAKING` co `audio_url` that
  (mp3 `edge-tts` giong `ja-JP-NanamiNeural` rate `-10%`, ten file `q_<id>.mp3` dat THEO ID
  THAT SAU KHI INSERT — khac voi quy uoc slug-theo-tu cua `build.py`). `TRANSLATE_TO_JP`
  (de bai tieng Viet) KHONG audio o cau hoi, nhung dap an JP co `romaji` trong
  `metadata_json` de FE tu doc bang TTS may khi cham vao. `SELECT_IMAGE` dung icon ve tay
  rieng (`/uploads/images/vocab_<slug>.png`, phang, KHONG nam trong thu muc con `vocab/`
  nhu `build.py`) — chi co 9 tu co icon (ohayou/konnichiwa/konbanwa/sayounara/ocha/gohan/
  mizu/pan/koohii), khong tu sinh icon moi vi se lech phong cach voi bo ve tay nay.
- FE (`picture-question.tsx`, `vocab-question.tsx`) **da co san** hanh vi cham-dap-an-tu-
  doc (`speakOption`/`speakAnswer`, TTS may dua tren `metadata.label`/`.romaji`) va nut loa
  tu hien khi `audioUrl` khac null — muon "bam dap an co am/cau hoi co nut nghe" chi can
  DIEN DUNG DU LIEU, khong can sua code FE.
- Script mo rong THEM (khong doi `questionsPerSession`, chi lam kho de phong phu hon de
  bot sung lai trung khi random): `test-data/demo-seed/add_topic1_topic2_pool.py` (viet
  2026-09-08). Ket noi truc tiep MySQL qua Docker port map (`127.0.0.1:3307`, KHONG can
  vao container), tu cache audio theo NOI DUNG trung (doc DB truoc, tai su dung file cu
  thay vi sinh trung lap edge-tts), INSERT xong moi lay ID that de dat ten file audio con
  thieu. Chay lai duoc an toan (khong xoa gi, chi INSERT them) — muon lam topic khac thi
  copy khuon nay, KHONG dung `build.py`.
- **Bay: field `audioUrl` co trong type/mapper nhung KHONG co nghia la FE da dung no.**
  `QuizAnswer.audioUrl` da duoc `quiz-mapper.ts` dien tu `opt.audioUrl` tu lau, nhung
  `picture-question.tsx`/`vocab-question.tsx` khi bam dap an lai LUON goi
  `useJapaneseSpeech().speak()` (TTS may) bat ke `audioUrl` co hay khong — nghia la du DB
  co day du audio that, nguoi dung van chi nghe giong TTS may cai san (co the sai/im lang
  neu may thieu goi giong `ja-JP`). Kiem tra "tinh nang co san chua" phai doc THANG handler
  `onPress` trong component, khong duoc suy dien tu type field ton tai. Da sua
  (2026-09-08): them 1 instance `useAudio()` rieng (`playAnswerAudio`, tach khoi player cua
  cau hoi de 2 icon loa khong nhay cheo trang thai) trong ca 2 component, uu tien phat
  `audioUrl` that, chi lui ve TTS khi rong. Script gan audio that cho dap an:
  `test-data/demo-seed/add_option_audio.py` — dat ten `a_<option_id>.mp3` (tien to "a_"
  phan biet voi "q_<question_id>.mp3" cua cau hoi), CHI gan cho dap an la CHU NHAT
  (`TRANSLATE_TO_JP`/`LISTEN_AND_SELECT`/`LISTEN_AND_ARRANGE` block/`SELECT_IMAGE` qua
  `metadata.label`) — dap an tieng Viet (`TRANSLATE_TO_VN`) co tinh KHONG gan vi khong co
  gi de doc bang tieng Nhat.

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
- **`windowSize` FlatList: to hơn KHÔNG đồng nghĩa mượt hơn — có điểm đảo chiều.** Trực giác "buffer rộng hơn = ít mount churn hơn khi fling" chỉ đúng tới một ngưỡng. Đo thực tế trên máy 120Hz (`FAJ7AM8DH6HAU8EQ`, ngân sách GPU 127.53MB): `windowSize={7}` giữ ~102MB texture resident khi fling (80% ngân sách) → **`windowSize={9}` làm TỆ HƠN** (3.01% → 3.81% khung giật, missed vsync 77→93, Slow bitmap uploads 83→101) vì đẩy bộ nhớ resident gần/qua ngưỡng gây cache thrashing (texture đã cache bị evict rồi phải upload lại). Ngược lại **giảm xuống `windowSize={5}` cải thiện triệt để** (giật 3.0%→0.24-0.88%, missed vsync →0-2) vì giữ ít section trong bộ nhớ hơn, tránh chạm ngưỡng cache. `windowSize={3}` cho kết quả ngang `{5}` nên không cần giảm sâu hơn (rủi ro ô trống khi vuốt cực nhanh tăng mà không lợi thêm về fps).
  - **Cách đo đúng**: `adb shell dumpsys gfxinfo <pkg> reset` → thực hiện N lần `adb shell input swipe x1 y1 x2 y2 <duration_ms>` (vuốt chậm ~900ms để đo baseline, vuốt nhanh 50-80ms để đo fling) → `adb shell dumpsys gfxinfo <pkg>` đọc `Janky frames %`, `Number Missed Vsync`, `Number Slow bitmap uploads`, và mục `GPU Caches: Image: Texture` (MB resident) so với `Max resource usage` (ngân sách). Tương quan gần 1:1 giữa "Slow bitmap uploads" và "Janky frames" trên fling xác nhận đúng nguyên nhân trước khi sửa — đừng đoán.
  - Sau khi đổi `windowSize`, luôn kiểm tra hình ảnh (screenshot ngay sau 1 loạt fling cực đoan, vd 50ms/full-screen 10 lần liên tục) để chắc không có ô trống/texture thiếu — buffer quá mỏng có thể thắng về số liệu jank nhưng thua về nội dung chưa kịp mount hiển thị.

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

## Chuẩn Hóa Bóc Tách Lỗi API (Spring Boot RFC 7807, Axios & Triệt Tiêu Mã HTTP Thô) (Goal 34)

- **Nguyên nhân cốt lõi gây hiển thị "Request failed with status code 409/403"**:
  - Spring Boot 3+ sử dụng chuẩn RFC 7807 `ProblemDetail` (trả về `{"title": "Conflict", "status": 409, "detail": "Email already registered"}`), không có trường `message`.
  - Nếu Axios interceptor chỉ đọc `error.response?.data?.message`, nó sẽ bị `undefined` và fallback sang `error.message` của Axios (`"Request failed with status code 409"`).
  - Tương tự, nếu Axios interceptor reject `new Error(message)` thuần, các caller cấp cao (như `use-shop.ts`) cố đọc `error?.response?.data?.message` sẽ nhận `undefined` và fallback sang thông báo vô nghĩa `"Thử lại sau ít phút"`.
- **Giải pháp mẫu (`src/utils/error-handler.ts`)**:
  - Xây dựng class `ApiError extends Error` lưu trữ `status`, `code`, `response`, và `data`.
  - Hàm `extractApiErrorMessage`:
    1. Ưu tiên đọc RFC 7807 `data.detail` (Spring Boot 3 default).
    2. Đọc `data.message`, `data.errors` (Spring validation), `data.detail` array (FastAPI).
    3. Chặn triệt để chuỗi `/status code \d+/i` và fallback sang mô tả trạng thái tiếng Việt thân thiện (400, 401, 403, 404, 409, 422, 500..504).
    4. Sử dụng bộ từ điển dịch Anh - Việt thông minh cho các thông điệp phổ biến từ backend/OAuth (`"Email already registered"`, `"Bad credentials"`, `"Insufficient coins"`, v.v.).
    5. Phân định rõ 401 (hết hạn phiên -> xóa token và chuyển login kèm Toast) vs 403 (từ chối quyền -> giữ phiên và chỉ báo Toast).
  - Triệt tiêu hoàn toàn `Alert.alert` native: chuyển lỗi API/Auth sang Toast (`useToast().showError`), chuyển các hộp thoại xác nhận hủy/rời màn hình sang `ModalCard` theme-aware phong cách 3D.

## Mất Tiếng Bài Nghe/Đáp Án Trên Máy Bạn Bè (Bản Release APK) — Gói Giọng Đọc TTS Thiếu Trên Máy Lạ

- **Triệu chứng báo cáo (2026-09-08)**: Cài `Nihongo-Release.apk` cho đồng đội test, mọi chức năng khác bình thường (kể cả các API khác qua cùng tunnel ngrok), nhưng bấm loa nghe bài nghe (`ListeningQuestionCard`) hoặc bấm nghe phát âm đáp án thì im lặng hoàn toàn — không lỗi, không crash. Hiệu ứng đúng/sai (`soundService.playCorrect/Incorrect`) vẫn kêu bình thường.
- **Đã loại trừ bằng kiểm chứng thực tế**: `curl` trực tiếp file `.../uploads/audios/kana/kana-a.mp3` qua đúng domain ngrok, kể cả giả lập User-Agent `ExoPlayerLib`/`okhttp` (giống native player Android) và KHÔNG kèm header `ngrok-skip-browser-warning` — vẫn trả về đúng `200 audio/mpeg` đủ byte. Vậy tunnel + Spring Boot `WebConfig` (`/uploads/**` permitAll, phục vụ từ `uploads/`) hoạt động đúng, không phải lỗi mạng/gateway.
- **Nguyên nhân tầng client**: `src/hooks/use-audio.ts` (`useAudio`) — điểm vào audio DUY NHẤT của app — khi `question.audioUrl` rỗng thì fallback đọc bằng `expo-speech` (`Speech.speak(text, { language: "ja-JP" })`, TTS **trên máy**). Máy nào chưa có gói giọng `ja-JP` thì `Speech.speak` chạy xong `onDone` nhưng **không phát ra âm thanh nào, cũng không báo lỗi**.
- **QUAN TRỌNG — người dùng phản biện đúng ("app bình thường đâu cần cài gì") và kiểm chứng lộ ra nguyên nhân gốc thật sự**: Đây KHÔNG phải edge-case hiếm gặp. Query trực tiếp MySQL thật (`docker compose exec db mysql -u root -p"rootchangeme" nihongo_db`, DB chạy trong container `be_nihongoapp-db-1` cổng `3307`) cho thấy **100% câu hỏi ở MỌI chủ đề đều có `lesson_questions.audio_url IS NULL`** (topic 1: 87/87, topic 2: 87/87, các topic khác 60-100%). Nghĩa là app hiện tại **chưa từng gắn audio thật cho câu hỏi bài học** — khác hẳn app kiểu Duolingo luôn dùng audio thu/sinh sẵn server-side, không bao giờ bắt máy người dùng tự lo TTS. TTS-trên-máy chỉ là "tệ hơn không có gì còn hơn không" (fallback), không phải giải pháp chính — lỗi này lộ ra vì gần như không có bài nào có audio thật.
- **4 loại câu hỏi có nút loa hiển thị VÔ ĐIỀU KIỆN (im lặng khi thiếu voice)**: `LISTEN_AND_SELECT` (`listening-question.tsx`, tự auto-play khi mount), `LISTEN_AND_ARRANGE` (`kana-question.tsx`, tự auto-play khi mount), `SELECT_IMAGE` (`picture-question.tsx`, guard `question.audioUrl || question.word` — luôn true vì word luôn có), `SPEAKING` (`speaking-question.tsx`, guard tương tự). Riêng `TRANSLATE_TO_VN/TRANSLATE_TO_JP` (`vocab-question.tsx`) nút loa CHỈ vẽ khi `question.audioUrl` có sẵn (`{question.audioUrl ? <AudioButton.../> : null}`) — không có nút để bấm nên KHÔNG nằm trong báo cáo lỗi này, dù code có tính `promptFallback` (dead path khi chưa có audioUrl).
- **Đã sinh audio thật cho Topic 1 & 2 (theo yêu cầu người dùng, đã xin phép trước khi đụng DB)**: Dùng lại đúng công cụ đã có sẵn trong dự án — `edge-tts` (giọng `ja-JP-NanamiNeural`, `rate="-10%"`, y hệt `BE_NihongoApp/test-data/demo-seed/make_media.py`) — sinh 58 file mp3 mới (khớp đúng 58 câu `LISTEN_AND_SELECT`/`LISTEN_AND_ARRANGE`/`SELECT_IMAGE`/`SPEAKING` đang null ở 2 topic) vào `BE_NihongoApp/uploads/audios/questions/q_<question_id>.mp3`, rồi `UPDATE lesson_questions SET audio_url=...` qua `docker compose exec db mysql`. Văn bản đọc trích đúng logic FE đã dùng cho TTS fallback để không lệch nội dung:
  - `LISTEN_AND_SELECT`: `option_text` của option có `is_correct=1`.
  - `LISTEN_AND_ARRANGE`: `GROUP_CONCAT(option_text ORDER BY order_index)` của các option `is_correct=1`, loại các token chỉ toàn dấu câu (regex `^[。、！？!?.,ー]+$`) — khớp với `cleanArrangementToken`/`correctOrder` trong `quiz-mapper.ts`.
  - `SELECT_IMAGE` / `SPEAKING`: `JSON_UNQUOTE(JSON_EXTRACT(metadata_json,'$.kana'))` (fallback `.jp`, rồi fallback option đầu tiên cho `SPEAKING`) — khớp `readPrompt()` trong `quiz-mapper.ts`.
  - Xác minh xong bằng chính API+domain ngrok app dùng: login test account → `POST /api/v1/lessons/150/start` → `audioUrl` không còn null cho câu LISTEN_* → tải thử file qua tunnel trả `200 audio/mpeg`.
  - **12 topic còn lại (3-14) CHƯA làm** (chỉ làm 1-2 theo phạm vi người dùng yêu cầu) — cùng cách trên (script `gen_question_audio.py` + `extract_audio_targets.sql`, đã lưu ở thư mục scratchpad phiên làm việc, chưa commit vào repo) dùng lại được ngay nếu cần mở rộng.
  - **Điều kiện để chạy lại**: Docker phải đang chạy (`be_nihongoapp-db-1` cổng `3307`, root pass `rootchangeme`, xem `application.yml`); `edge_tts` cần cài vào Python đang dùng (`pip install edge-tts`, máy này đã có sẵn ở `C:\Users\Endministrator\AppData\Local\Programs\Python\Python312\python.exe`, KHÔNG có trong `ai-service/.venv` hay bất kỳ venv nào của `test-data/demo-seed`).
- **Bản vá đã áp dụng (`src/hooks/use-audio.ts`)**:
  1. Thêm `checkJapaneseVoiceAvailable()` dùng `Speech.getAvailableVoicesAsync()` lọc `language` bắt đầu bằng `"ja"`, cache kết quả ở module-level (dò 1 lần/phiên app).
  2. Nếu không có giọng `ja-*`, hiện `Toast` cảnh báo 1 lần duy nhất (`hasWarnedMissingVoice` flag) hướng dẫn vào Settings tải giọng — vẫn cứ gọi `Speech.speak` (best-effort, một số máy vẫn phát được bằng giọng thay thế).
  3. Nhánh phát file audio thật (`createAudioPlayer`) khi `catch` lỗi mạng: gọi thêm `showError` (Toast) thay vì chỉ `console.warn` — trên bản release không ai xem được console, lỗi trước đây hoàn toàn vô hình.
  4. `useToast()` an toàn gọi trong hook thường (không phải component) vì `ToastProvider` bọc toàn app ở `_layout.tsx` và có `NOOP_TOAST` fallback (xem mục "Safe Context Fallback").
  5. Thêm mock `getAvailableVoicesAsync` vào `jest.mock("expo-speech", ...)` trong `jest-setup.js` (trả về có giọng `ja-JP` mặc định) để không phá test hiện có.
- **Cách xác minh trên máy đồng đội (không cần adb)**: mở Google Dịch, gõ 1 từ tiếng Nhật, bấm loa — im lặng nghĩa là máy đó chưa có gói TTS tiếng Nhật, xác nhận đúng giả thuyết.
- **Bài học Windows/Edit tool**: `Edit` tool trên máy này đôi khi ghi lại TOÀN BỘ file bằng CRLF dù nội dung gốc là LF thuần (xảy ra với `src/hooks/use-audio.ts` lần sửa này dù chỉ thêm vài dòng) — luôn chạy `npx eslint <file> --fix` ngay sau khi sửa file `.ts`/`.tsx`/`.js` để tự dọn `␍` thay vì đợi `npm run lint` báo hàng trăm lỗi giả.

## `release/Nihongo-Release.apk` là ẢNH CHỤP tĩnh — sửa code KHÔNG tự cập nhật APK đã cài

- **Triệu chứng (2026-09-08, ngay sau khi vá audio-on-tap ở mục trên)**: Người dùng báo "bạn tôi test vẫn không nghe âm thanh khi bấm câu hình ảnh" dù DB + code FE đã xác nhận đúng 100% (test pass, tsc sạch, DB có `audio_url` đầy đủ). Nguyên nhân KHÔNG phải bug mới — file `release/Nihongo-Release.apk` bạn của người dùng đang cài là bản build TRƯỚC thời điểm sửa code (build lúc 13:04, code sửa lúc 17:04). JS bundle bị đóng gói cứng vào APK lúc build; sửa `src/` sau đó không lan tới máy đã cài APK cũ, khác hẳn dev qua Metro (auto reload).
- **Cách xác minh nhanh không cần đoán**: so `git log -1 --format="%ci" -- <file .tsx vừa sửa>` với mtime của `release/*.apk` (`ls -la` hoặc PowerShell `Get-Item`). APK cũ hơn file sửa → chắc chắn APK đó không chứa bản vá, không cần nghi ngờ lại code/DB.
- **Cách xác minh bundle mới đã vào APK**: so mtime `android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle` với thời điểm sửa code — bundle phải MỚI HƠN.
- **Quy trình đúng sau MỌI lần sửa code FE mà đã có người test bằng APK cài sẵn**: `cd android && ./gradlew.bat assembleRelease` (có thể fail transient ở `packageRelease` lần đầu do khoá file tạm — chạy lại lần 2 thường qua, tận dụng cache incremental của lần 1 nên nhanh hơn nhiều, ~30s thay vì ~1m40s), rồi copy `android/app/build/outputs/apk/release/app-release.apk` đè lên `release/Nihongo-Release.apk` để gửi lại. KHÔNG báo "đã sửa xong" cho người dùng nếu APK họ đang cầm chưa được build lại.

## Chuẩn Hóa Dấu Tiếng Việt Cho Đề Bài Luyện Tập Bảng Chữ Cái (Goal 36)

- **Nguyên nhân**:
  - Backend `AlphabetServiceImpl.java` (hàm `toQuestion`) hardcode đề bài dạng chuỗi không dấu: `"Nghe va chon chu cai dung"` và `"Viet chu: " + romaji`.
  - Trong khi đó, Frontend unit test (`practice.test.tsx`) lại viết sẵn mock mong đợi chuỗi có dấu chuẩn: `"Nghe và chọn chữ cái đúng"` và `"Viết chữ: "`.
- **Giải pháp đồng bộ 2 đầu (Defense-in-depth)**:
  1. **Backend**: Cập nhật trực tiếp `AlphabetServiceImpl.java` trả về `"Nghe và chọn chữ cái đúng"` và `"Viết chữ: " + character.getRomaji()`.
  2. **Frontend**: Bổ sung hàm tiện ích `normalizeAlphabetPrompt` trong `src/utils/helpers.ts` và gắn vào mapper của hook `useAlphabetPractice` (`src/hooks/use-alphabet-practice.ts`). Điều này đảm bảo ngay cả khi backend chưa restart hoặc người dùng dùng cache cũ, đề bài luôn hiển thị đúng chính tả tiếng Việt có dấu.

## Race Condition Khi Đóng Overlay/Modal Trước Khi Hoàn Tất Tác Vụ Bất Đồng Bộ (Goal 39)
- **Triệu chứng**: Bấm đăng xuất ở màn Cài đặt (từ Hồ sơ) thì thành công (gọi được API `POST /api/v1/auth/logout`, backend ghi nhận, FE xóa token), nhưng bấm đăng xuất ở menu "Thêm" (`MoreBottomSheet`) thì không đăng xuất được (API không được gọi hoặc bị hủy giữa chừng).
- **Nguyên nhân**:
  - `MoreBottomSheet` được điều khiển bằng cờ `visible` ở layout cha (`_layout.tsx`) và có guard `if (!visible) return null;`.
  - Khi xác nhận đăng xuất, nếu gọi `onClose()` TRƯỚC `await signOut()`, layout cha lập tức set `visible = false` khiến `MoreBottomSheet` unmount ngay lập tức khỏi React tree.
  - Việc component bị tiêu hủy đột ngột làm ngắt quãng hoặc hủy bỏ (abort) request Axios bất đồng bộ đang chuẩn bị phát đi, khiến request logout không bao giờ tới được Spring Boot backend.
- **Giải pháp chuẩn**:
  - Luôn `await` hoàn tất tác vụ mạng/async (`await signOut()`) trong khối `try/catch/finally` TRƯỚC KHI gọi `onClose()`.
  - Bổ sung cờ `loading` (như `isSigningOut`) và khóa khả năng người dùng chạm ra ngoài đóng modal trong lúc đang gọi API.
  - Trong unit test (`more-bottom-sheet.test.tsx`), luôn kiểm tra thứ tự thực thi `callOrder: ["signOut", "close"]` để ngăn ngừa lỗi tái phát.

## Kiến Trúc Popup Lộ Trình Đóng Ra Ngoài & Năng Lượng Ôn Tập Miễn Phí (Goal 42)
- **Vấn đề đóng popup khi ấn ra ngoài (Duolingo Style)**:
  - Nếu render popup cục bộ bên trong từng node của `FlatList`:
    - Android native layout engine sẽ không dispatch sự kiện chạm ra ngoài phạm vi layout bounds của view cha (kể cả có đặt `overflow: visible` hay toạ độ âm). Do đó không thể đóng popup khi chạm ra ngoài bằng backdrop bên trong node.
  - **Giải pháp chuẩn**:
    - Tách popup thành component cấp cao `LessonPopoverModal` sử dụng `<Modal transparent visible={...} onRequestClose={...}>`.
    - Đặt một `<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />` làm lớp nền trong suốt: bắt trọn mọi cú chạm bên ngoài popup (trên bản đồ, header, mép màn hình) để đóng popup ngay lập tức.
    - Hỗ trợ phím Back vật lý trên Android qua `onRequestClose`.
    - Gắn `onScrollBeginDrag={() => setSelectedLesson(null)}` trên `FlatList` để đóng popup khi người dùng bắt đầu vuốt.
    - Dùng `measureInWindow` trên node (kèm thuộc tính `collapsable={false}` trên Android) để đo toạ độ neo `anchor` (`x, y, width, height`) và căn giữa popup theo tâm node, tự động đảo chiều hiển thị mũi tên lên trên nếu sát đáy màn hình.
    - Lợi ích hiệu năng lớn: `TopicSection` không cần nhận `selectedLessonId` hay `isPopupVisible`, loại bỏ hoàn toàn việc re-render của FlatList khi mở/đóng popup.
- **Quy tắc Năng lượng & Nhãn Ôn tập bài đã hoàn thành (`COMPLETED`)**:
  - Backend Java (`LessonAttemptServiceImpl.java`): bài đã `COMPLETED` được tính là `isReplay = true`, trả về `totalEnergy = 0` và trừ 0 năng lượng.
  - Phía Frontend:
    - Khi `lesson.status === "COMPLETED"`, cho phép người dùng mở và bắt đầu học lại kể cả khi đang có `0 ⚡` (bỏ chặn `energy < 1`).
    - Dòng năng lượng hiển thị nhãn: `"Miễn phí ⚡"` thay vì số năng lượng tốn phí.
    - Nút hành động đổi thành: `"ÔN TẬP LẠI →"` thay vì `"BẮT ĐẦU →"`.

## Chuẩn Hóa Hệ Thống Biểu Tượng Toàn Ứng Dụng (Icon Consistency - Goal 43)
- **Chuẩn Hóa Đóng Băng Chuỗi (Streak Freeze)**:
  - Thống nhất 100% hình tượng **Bông tuyết ❄️ (Snowflake)** trên toàn app: Header `StatPill` (khi streak `FROZEN`), `StreakModal`, `ProfileStatCapsule`, `achievement-icon.ts`, và ảnh vật phẩm Cửa hàng (`streak_freeze.png`).
  - Triệt tiêu hoàn toàn sự bất nhất giữa ảnh khối băng 3D cũ và icon bông tuyết.
- **Chuẩn Hóa Năng Lượng (Energy)**:
  - Khai báo token tập trung `Colors.energy = "#4ADE80"` (xanh lá tươi sáng của sự hồi phục / vitality).
  - Đồng bộ `ProfileStatCapsule` từ màu xanh dương `#38BDF8` sang `Colors.energy`.
  - Cập nhật ảnh vật phẩm Cửa hàng `energy_refill.png` sang tia sét xanh lá tươi sáng thay thế tia sét cam cũ.
- **Chuẩn Hóa Tiền Tệ (Coin) & EXP**:
  - Tiền tệ toàn bộ app sử dụng đồng xu Mon Nhật Bản có lỗ vuông (`CoinMark`). Ảnh vật phẩm `double_coin.png` được vẽ lại thành 2 đồng xu Mon vàng óng x2 thay vì ảnh đền thờ Hy Lạp.
  - Fallback `DOUBLE_COIN` trong `ItemGlyph` tự động render component `<CoinMark />`.
  - `DOUBLE_XP` chuẩn hóa fallback icon `Ionicons "star"`.
- **Thống Nhất Thư Viện Icon Về `Ionicons`**:
  - Loại bỏ hoàn toàn `FontAwesome5` khỏi toàn bộ codebase (`streak-modal.tsx`, `quiz-header.tsx`, `speaking-question.tsx`, `animated-tab-icon.tsx`).
  - Đảm bảo tính nhất quán về độ dày nét vẽ (stroke weight), bo góc và tối ưu kích thước bundle của Expo/React Native.

## Ngôn Ngữ Chuyển Động 墨と印 & Bộ Âm 和音 (Goal 45)

### Vì sao animation/âm thanh "trông rất AI" — và cách nhận diện
- **Âm thanh**: `Math.sin(f*t) * Math.exp(-k*t)` KHÔNG BAO GIỜ nghe ra nhạc cụ. Tai người nhận dạng nhạc cụ qua 3 thứ mà công thức đó thiếu sạch: (1) **transient nhiễu ở đầu** (tiếng va chạm của búa/móng gảy), (2) **bồi âm LỆCH số nguyên** (harmonic đúng bội số thì hoà thành một tiếng bíp; lệch bội số thì đập vào nhau tạo ngân rung), (3) **đuôi vang phòng**. Thiếu (3) chính là triệu chứng người dùng mô tả là "kêu cái là hết".
- **Animation**: cú lắc `-10, +10, -10, +10, 0` với duration cố định là dấu hiệu kinh điển. Vật thể thật khi bị đập thì **biên độ tắt dần VÀ chu kỳ giãn ra**. Xem `struckShake` trong `constants/motion.ts`.
- **Dùng chung một nhúm spring preset cho mọi thứ** → mọi thành phần nảy như cao su, không phân biệt được sự kiện nào là gì. Đặt tên token theo *hành động vật lý* (ink / press / snap / paper) thay vì theo độ nảy sẽ ép mình phải chọn đúng.

### Công thức tổng hợp nhạc cụ (đều ở `scripts/generate-sounds.js`, thuần Node, 0 dependency)
- **Karplus-Strong** = dây gảy (koto). Nạp burst nhiễu vào delay line dài đúng 1 chu kỳ, cho hồi lưu qua lowpass 1 cực. `loopGain = exp(ln(0.001) / (decayTime * freq))` để dây tắt đúng sau `decayTime` giây.
- **Modal synthesis** = vật bị gõ (chuông rin). Tổng các sin ở tỉ lệ tần số lệch số nguyên `[1, 2.74, 5.36, 8.93, 13.34]`, mode càng cao thì `tau` càng ngắn.
- **Noise burst + biquad bandpass** = gỗ/da trống (hyoshigi, tiếng vỗ mặt trống taiko).
- **Pitch-drop** = trống (taiko): tần số rơi 190→62Hz theo `exp(-t*26)`. Sin cố định tần số nghe ra synth tom chứ không ra trống.
- **Schroeder reverb**: 4 comb song song → 2 allpass nối tiếp, mix ≤ 0.2.

### Bẫy khi chuẩn hoá độ to SFX (mất khá nhiều lượt đo mới ra)
- **Đừng peak-normalize.** Một tiếng gảy = 1 đỉnh rất nhọn trên nền âm nhỏ; một tiếng trống thì đầy đặn. Chuẩn cùng peak sẽ khiến tiếng gảy nghe nhỏ hơn hẳn. Dùng **RMS cửa sổ ngắn (300ms) lớn nhất**.
- **Áp fade TRƯỚC khi đo.** Tiếng gõ có đỉnh nằm trong vài ms đầu; đo trước rồi fade sau sẽ chuẩn hoá vào đúng mẫu mà fade sắp nhân xuống 0 (đây là lý do `tap.wav` từng ra peak 0.25 thay vì 0.45).
- **Chặn trần bằng limiter tanh (`ceiling * tanh(x/ceiling)`), đừng trim phẳng.** Trim phẳng kéo tụt cả phần thân nghe được chỉ để nhét vừa cái đỉnh nhọn → bậc combo càng cao càng nhỏ tiếng.
- **Kiểm chứng file WAV bằng script đo, đừng đoán**: peak / short-term RMS / DC offset / số mẫu clip / RMS đoạn đuôi / cao độ bằng autocorrelation. Lưu ý autocorrelation hay khoá nhầm vào **quãng tám dưới** khi có bồi âm octave — cứ so TỈ LỆ giữa các file thay vì con số tuyệt đối.

### Bẫy React Native đã dính
- **`zIndex` âm trên Android đẩy view xuống dưới cả nền đặc của View cha** → hiệu ứng biến mất hoàn toàn. Muốn cho một lớp nằm dưới anh em của nó thì đặt nó làm **con đầu tiên**, đừng dùng zIndex âm.
- Jest gộp mọi `require("*.wav")` về **cùng một giá trị** → không thể assert "mỗi bậc dùng file khác nhau" bằng cách so nguồn. Kiểm gián tiếp qua **số player được tạo** (key không đụng nhau) + tái dùng player khi lặp lại cùng bậc.
- `jest.useFakeTimers()` bật giữa chừng trong một suite RNTL sẽ **làm hỏng các test SAU nó** trong cùng file (act warning + mock không được gọi). Dùng `waitFor` với timer thật.
- Layout animation của Reanimated nhận `Easing.bezier(...)` qua `.easing()` bình thường; nhưng kiểu `easing` trong config tự viết phải khai báo là `WithTimingConfig["easing"]` (không phải `(v: number) => number`) vì `Easing.bezier` trả `EasingFunctionFactory`.

### Nguyên tắc dàn nhịp (orchestration)
- Neo MỌI nhịp của một màn ăn mừng vào **một khoảnh khắc va chạm duy nhất**, và **phát âm thanh đúng tại khoảnh khắc đó**. Màn Kết quả trước đây nổ fanfare ở t=0 trong khi con dấu mãi t=640ms mới chạm giấy — âm và hình rời nhau là phần lớn lý do thấy nhạt. Nay `RESULT_IMPACT_MS = 400ms`, mọi thứ khác cách nhau 90ms sau đó. Export hằng số điểm va chạm ra ngoài (`HANKO_LANDING_MS`) để màn hình khỏi đoán delay.
- Khoảng stagger 50ms khiến cả nhóm nhoè thành một sự kiện; **90ms** thì mắt theo kịp thứ tự.

## Vì Sao UI "Trông Như AI Làm" — Chẩn Đoán Ở Tầng Hình Khối (Goal 46)

### Sai lầm phổ biến khi đi tìm nguyên nhân
Sửa **màu, icon, câu chữ** thì không bao giờ trị được cảm giác "AI làm", vì thứ tố cáo nằm ở **hình khối và bề mặt**. Dự án này có bảng màu Nhật rất cụ thể (ai-zome / shu / kogane / washi) và font Zen Maru Gothic — tức là tầng màu & chữ ĐÃ có chủ đề thật. Nhưng đổi hết hex sang bảng màu khác thì app vẫn trông y hệt về tính cách → đó là **lớp da, không phải bản sắc**.

### Bốn dấu hiệu cụ thể, kiểm được bằng grep
1. **Nhiều hiệu ứng "sang" chồng lên một control thường.** `GradientButton` từng có 5 thứ: gradient chéo, vệt sáng giả (`topHighlight`), `Shadows.glow` opacity 0.5, `textShadow`, `pressScale` — chỉ cái cuối mang thông tin. Khi mọi control đều được đối xử như đặc biệt thì không cái nào đặc biệt thật.
2. **Không có phân cấp hình khối.** `BorderRadius` nhỏ nhất là 16 → không vẽ nổi góc nhỏ bằng token → badge 20px và modal toàn màn hình cùng một hình. Kiểm nhanh: `grep -rho "BorderRadius\.[a-z]*" src/ | sort | uniq -c`.
3. **Design system tự mâu thuẫn.** Comment trong `theme.ts` ghi gradient "reserved for genuine celebration moments... rather than repeated on every surface", nhưng nút mặc định lại đắp gradient lên mọi surface. Luôn đối chiếu **ý định đã ghi** với **code thực thi**.
4. **Thang shadow tích tụ chứ không phải hệ thống.** 9 preset với hai hệ tên chồng nhau (`soft/medium/float` VÀ `sm/md/lg/xl`).

### Điều KHÔNG phải nguyên nhân
**Bo tròn không phải thủ phạm.** Nút Duolingo bo tròn hoàn toàn, và không ai bảo Duolingo trông như AI vẽ. Thủ phạm là *gradient + gloss + glow + textShadow đắp chồng*, cộng với chuyện **mọi thứ bo tròn giống hệt nhau**. Đừng vội kết luận "bỏ bo tròn đi cho bớt AI".

### Cách sửa đã dùng (rủi ro thấp, hiệu quả cao)
- Nút = **mực phẳng trên gờ đáy vật lý**. Một chi tiết duy nhất, và nó có chức năng: gờ là cạnh bên của một cái phím, bấm thì mặt nút **lún xuống** đè lên gờ. Suy màu gờ bằng `darken(mặt, 0.28)` (`src/utils/color.ts`) để quan hệ vật lý không đổi với mọi màu.
- **Lún hoặc scale, chọn một.** Dùng cả hai là hai câu trả lời cho cùng một câu hỏi.
- Thang bo góc dựng theo *vật thể là gì*, không theo *muốn mềm cỡ nào*: 2 (ô nhập) · 6 (chip) · 12 (card) · 20 (nút) · 28 (modal) · 36 (hero) · 999 (**chỉ** pill thật: counter, avatar). Thay đổi lớn dồn vào `sm`/`md`, các bậc lớn chỉnh nhẹ → 138/189 lượt dùng gần như không đổi, rủi ro thấp.
- Quầng sáng màu chỉ được tồn tại ở khoảnh khắc ăn mừng thật (`streak-extended`, `achievement-unlocked`). Trạng thái "đang chọn" đã có màu viền + màu chữ báo rồi.
- **Đừng thêm `useTheme()` vào component dùng chung rộng** — hook này `throw` khi thiếu ThemeProvider, sẽ làm vỡ test của mọi màn import nó. Muốn nút outline hoạt động ở cả 2 theme thì để mặt nút **trong suốt**, đừng sơn nền.

### Nguyên tắc thiết kế âm thanh rút ra (sửa lỗi của Goal 45)
**Có cao độ + ngân dài + có vang = khoảnh khắc đến đích. Khô + ngắn + sát tai = tương tác trong bài.** Trộn hai thứ là hỏng. Tiếng "đúng" ban đầu dài 0,9s trong khi người học bấm KIỂM TRA → TIẾP TỤC chỉ trong ~1s, nên nốt đàn vẫn ngân sang câu sau — nghe ra "có ai đó đang chơi nhạc" chứ không phải "app xác nhận đáp án". Cách giữ được bản sắc mà vẫn sửa: **cùng nhạc cụ, khác lối chơi** (同じ楽器、違う奏法) — trong bài dùng gảy chặn dây 0,17s, màn kết quả dùng gảy mở ngân dài. Bậc thang combo vẫn đọc tốt ở 0,17s vì tai định cao độ trong dưới 50ms.

### Thêm 2 bẫy DSP (nối tiếp mục Goal 45)
- **Cửa sổ đo độ to phải NGẮN HƠN tiếng động.** Rút tiếng xuống 0,30s mà vẫn đo trên cửa sổ 300ms thì phép đo gộp cả phần im lặng, gain tự nhân đôi và đẩy thẳng vào limiter. Dùng ~130ms (thời gian tích hợp của tai với âm chuyển tiếp) cho các tiếng ngắn.
- **Tiếng gảy có tỉ số đỉnh/hiệu dụng rất cao.** Nếu limiter phải ép hơn ~4dB thì nó đang bóp chính cái đầu tiếng — thứ khiến tai nhận ra "đây là tiếng gảy". Hạ tỉ số đó **tại nguồn** (kéo dài attack, nới decay), đừng hạ ở khâu chuẩn hoá cuối.

### Bẫy test
RNTL trong dự án này trả `render` **bất đồng bộ** — phải `await render(...)` mới có `getByText`/`getByTestId`, nếu không sẽ báo `TypeError: getByText is not a function`.

## Bẫy Đã Dính Khi Vá UI (Goal 47)

### QUY TẮC AN TOÀN KHI SỬA FILE BẰNG SCRIPT PYTHON
**Đã tự phá hỏng `hanko-stamp.tsx` từ 164 → 279.023 dòng.** Nguyên nhân: dùng
```python
old = s[s.index(A) : s.index(B)]
s = s.replace(old, new)
```
nhưng A nằm **sau** B trong file → lát cắt rỗng `""` → `str.replace("", new)` chèn `new` vào **giữa mọi ký tự**.

Bắt buộc từ nay:
- `a = s.index(A); b = s.index(B); assert a < b and b - a > 20, "lát cắt sai"` TRƯỚC khi replace.
- Không bao giờ `replace` một chuỗi có thể rỗng.
- `str.replace` thay **mọi** lần xuất hiện — khớp theo thụt lề là cực kỳ nguy hiểm (đã suýt đổi nhầm 2 nút "XEM QUẢNG CÁO" thành `ghost` vì chúng cùng mức thụt lề với nút cần đổi). Dùng `assert s.count(old) == 1` hoặc regex có ngữ cảnh (kèm `title=`).
- Khôi phục: `git show HEAD:<path>` lấy bản gốc rồi **viết lại nguyên file** bằng Write, áp lại thay đổi của phiên từ context.

### Hai View chồng nhau KHÔNG dùng chung được một góc bo
Kiểu "nút có gờ đáy" làm bằng View ngoài (màu gờ, `paddingBottom: 4`) bọc View trong (mặt nút), cả hai `borderRadius: 20` → cung của View dưới **phình ra ngoài** cung của View trên suốt cả chiều cao bán kính. Trên nút cao 58px, vệt tối chạy gần hết hai cạnh bên và người dùng đọc ra là "cái khung bao ngoài nút".
→ Dùng **một View + `borderBottomWidth`**. Viền vẽ bên trong hộp và bám đúng đường bo. Đây cũng là kiểu `option-card`/`alphabet-cell` đang dùng.

### Mặt trong suốt + lớp màu phía sau = màu tràn ra toàn bộ
Đặt `backgroundColor: "transparent"` cho mặt nút trong khi lớp sau tô `Colors.primary` thì màu đó lộ qua **cả nút**, không chỉ ở đáy. Nhãn cũng `Colors.primary` → chàm trên chàm, nút trống trơn không chữ. Luôn tự hỏi: "nếu lớp này trong suốt thì thấy gì phía sau?"

### Bézier: điểm điều khiển KHÔNG được trùng điểm neo
`buildSealRing` cũ đặt control point của mỗi cung quadratic tại đúng vị trí trục chính — tức chồng lên chính điểm neo bắt đầu → mọi cung sập thành đoạn thẳng → "vòng tròn" ra hình thoi, bán kính 35-40 thay vì 50.
Công thức đúng cho cung 1/4 đường tròn bằng **cubic**: `KAPPA = 0.5522847498`, control point đẩy dọc **tiếp tuyến** `(-sin θ, cos θ)` một đoạn `KAPPA · r`.
**Cách kiểm không cần mắt**: lấy mẫu đường cong bằng công thức Bézier trong Node rồi in min/max khoảng cách tới tâm. Vòng tròn thật thì min≈max≈r; hình thoi thì min tụt còn ~0,7r.

### Màu sáng của dark mode KHÔNG dùng lại được trên nền kem
`#4ADE80` trên `#EFE2C4` chỉ đạt **1,36:1**, `#F87171` đạt **2,15:1** — ngưỡng AA cho chữ lớn là 3,0:1. Đã thêm `Colors.successInk`/`Colors.errorInk` (4,83:1 và 4,61:1). Khi thấy màu hardcode trong component theme-aware, luôn tính tương phản cho CẢ hai nền trước khi kết luận nó ổn.

### Hiệu chỉnh độ ngân của tiếng phản hồi — mất 3 lần mới đúng
| | decay | ngân thật | phản hồi |
|---|---|---|---|
| lần 1 | 1.1 | ~0,70s | tràn sang câu sau |
| lần 2 | 0.22 | ~0,13s | "cụt lủn, như đồ vật đập nhau" |
| **lần 3** | **0.55** | **~0,30-0,35s** | đúng |
Bài học: một nốt gảy phải **nghe được lúc nó đang tắt dần** mới đăng ký vào tai là "tiếng gảy". Damp quá tay thì nó thôi là dây đàn. Bồi âm **quãng tám** (gain nhỏ ~0,18) là thứ tạo ra độ lấp lánh phân biệt koto với tiếng sin thuần — giữ lại; nhưng **quãng năm** thì bỏ, vì chồng quãng biến tín hiệu thành hợp âm.

### Đo đuôi âm bằng ĐƯỜNG BAO, đừng dùng một ngưỡng cắt
Chỉ số "audible = thời điểm mẫu cuối vượt −45 dBFS" từng báo 0,70s và khiến tưởng nốt còn ngân dài. In RMS theo từng 100ms mới thấy sự thật: tắt dốc trong 300ms đầu rồi **nằm phẳng ở đáy −45 dB** (đáy vang, vô thanh trên loa điện thoại) tới hết file. Cắt buffer là xong.

### Reverb Schroeder có độ trễ comb cố định
Nốt rơi trúng tần số cộng hưởng của comb sẽ ngân lâu hơn hẳn các nốt khác (bậc 5 của thang combo ngân 0,77s trong khi các bậc khác 0,34-0,40s). Trị bằng **damping một cực trong vòng hồi tiếp** (kiểu Freeverb): cao tần tắt trước, đuôi đều hơn giữa các cao độ. Để `damping: 0` làm mặc định để không đụng các tiếng đã được duyệt.

## Rà Soát Bề Mặt Theo Theme (Goal 48)

### Dấu hiệu số 1 của "bề mặt chỉ đúng ở một theme": lớp trắng-alpha tĩnh
`backgroundColor: "rgba(255,255,255,0.06)"` viết cứng trong `StyleSheet.create` **không thể** theo theme. Trên nền tối nó là lớp sáng tinh tế; trộn lên nền kem `#F7EFDE` nó cho ra `#F7F0E0` — lệch **1.008:1** so với nền, tức là mắt không phân biệt được. Cách tìm:
```bash
grep -rn 'backgroundColor: "rgba(255, *255, *255' src/ --include=*.tsx
grep -rn 'borderColor: "rgba(255, *255, *255' src/ --include=*.tsx
```
Chuỗi **literal** = tĩnh = không gated. Nhưng phải phân loại tiếp: nằm trên gradient / camera / thanh màu đặc / nền sơn mài cố định thì HỢP LỆ. Trong lần rà 22 chỗ chỉ có 2 chỗ là lỗi thật.

### Thay lớp trắng bằng sắc dẫn xuất từ chính màu của phần tử
Thay vì `rgba(255,255,255,α)` + `${color}40`, dùng `backgroundColor: \`${color}16\`` + `borderColor: \`${color}59\``. Nền và viền dẫn xuất từ màu nội dung nên tự đúng ở cả hai theme, không cần rẽ nhánh `isDark`.

### Màu thương hiệu chọn cho nền tối luôn tụt chuẩn trên nền sáng
Đo thực tế trên nền header gần trắng: chuỗi `#D9762E` **3.19:1**, xu `#C4922E` **2.80:1**, năng lượng `#4ADE80` **1.74:1** — đều dưới AA 4.5:1.
Giải pháp đã dùng: `readableOn(color, background, minRatio)` trong `src/utils/color.ts` — tối dần 8% mỗi bước rồi **dừng ngay** ở bước đầu tiên đạt ngưỡng, nên giữ được sắc. Tốt hơn hẳn việc chọn tay một mã hex thứ hai cho mỗi accent (sẽ lệch ngay khi ai đó sửa mã đầu). Kèm `contrastRatio(a, b)` để kiểm được bằng test thay vì bằng mắt.

### Tính tương phản trên BỀ MẶT THỰC, không phải `colors.background`
Header tự tô `rgba(255,255,255,0.98)` chứ không dùng nền trang `#F7EFDE`. Đo nhầm nền sẽ ra số đẹp hơn thực tế. Luôn tra xem component **tự tô nền gì**.

### Header màn Học có HAI nhánh
`src/app/(tabs)/index.tsx` render header hai lần: một nhánh nền đặc và một nhánh `BlurView`. Sửa một nhánh là sót. `assert s.count(old) == n` bắt được chuyện này.

### Vùng tối trong Cửa hàng là CÓ CHỦ Ý
`constants/shop.ts` ghi rõ quầy hàng giữ mặt sơn mài cố định ở cả hai theme để cửa hàng "đọc ra là một nơi chốn trong app chứ không phải thêm một danh sách cài đặt". `ShopCounter` là `LinearGradient` lacquer→lacquerDeep có bo góc đáy. **Đừng "sửa" nó thành theo theme.** Điểm đáng phê bình thật là bảng màu: `#241748`/`#120B26` và accent epic `#A855F7` đều là tím, nằm ngoài bảng ai-zome.

### Màu Tailwind còn sót (chưa dọn)
`#38BDF8` ở `profile-stat-capsule.tsx` và `streak-modal.tsx` (đáng lẽ là `Colors.streakFrozen`), `#10B981` ở `league-tier-ladder.tsx`, `#208AEF` ở `animated-icon.tsx`.

## Đồng Bộ Bảng Màu Cho Component Vẽ Trên NHIỀU Loại Nền (Goal 49)

### Nguyên tắc: chỉnh gốc cho bề mặt CỐ ĐỊNH, chuyển đổi tại nơi vẽ trên bề mặt THEO THEME
Cửa hàng vẽ cùng một bảng màu lên hai loại nền: quầy sơn mài **luôn tối** và kệ hàng **theo theme**. Cách làm đúng:
- Giá trị gốc trong `constants/` chỉnh cho bề mặt cố định (ở đây là sơn mài) — đó là bề mặt duy nhất chắc chắn biết trước.
- Các điểm vẽ trên bề mặt theo theme cho màu qua `readableOn(tone, surface)`.

Tránh được cái bẫy "chọn tay một mã hex thứ hai cho mỗi accent" — nó sẽ lệch ngay khi ai đó sửa mã đầu.

### `readableOn` PHẢI có hướng
Bản đầu chỉ biết tối dần → gọi trên nền tối thì mỗi bước làm tương phản **tệ đi**, chạy hết 24 vòng rồi trả về gần đen. Sửa: `luminance(bg) > 0.18 ? darken : lighten`. Bất kỳ tiện ích tương phản nào cũng phải hỏi "nền sáng hay tối" trước khi chọn chiều.

### Luôn kiểm token có bị dùng ngoài phạm vi tên gọi không
`ShopPalette.goldLeaf` nghe như chỉ dùng trong Cửa hàng, thực tế `coin-mark.tsx` dùng nó cho **đồng xu trên toàn app** (kể cả header nền sáng) và `constants/quests.ts` cũng dùng. Đổi mà không grep là vỡ chỗ khác.
Mẹo: `grep -rho "ShopPalette\.[a-zA-Z]*" src/ | sort | uniq -c | sort -rn` để đếm, rồi grep từng token xem nằm trên nền gì.

### Thang bậc nên là thang CHẤT LIỆU, không phải 4 màu rời rạc
Thang độ hiếm cũ: xám `#8B93A7` → xanh Tailwind `#3FA9F5` → tím Tailwind `#A855F7` → vàng. Không có quan hệ nào giữa chúng.
Thang mới theo chất liệu Nhật: **đá `#91897A` → chàm `#7A88B7` → chu sa `#CE6F58` → vàng `#E0AE4A`** — trùng luôn với thang thương hiệu của app (ai-zome / shu / kogane). Thang có nghĩa thì dễ nhớ và không thể "lạc".

### Màu Tailwind sót lại: phân biệt LẠC BẢNG MÀU và CÓ NGHĨA RIÊNG
Không phải cứ hex kiểu Tailwind là sai:
- **Lạc thật**: `#38BDF8` cho huy hiệu đóng băng (app đã có `Colors.streakFrozen`), `#10B981` cho huy hiệu "đã qua" (app đã có `Colors.success`), `INITIAL_PALETTE` của `leaderboard-avatar` (6/8 màu là Tailwind nguyên bản).
- **Có nghĩa riêng, đừng vội sửa**: thang hạng đấu trường trong `rank-tier.ts` — Đồng `#B87333` đúng là màu đồng thật, Bạc `#9CA7BA`, Kim Cương đã là `#3B4C82` của app, Cao thủ đã là `#BE4A34`. Riêng Bạch Kim `#38BDF8` là xanh trời chứ không phải bạch kim, NHƯNG đổi sang màu bạch kim thật (trắng bạc nhạt) sẽ gần trùng với Bạc — nên đó là đánh đổi có lý do.

### Màu app "cùng họ" chưa chắc dùng thay thế trực tiếp được
Định thay `#38BDF8` bằng `Colors.streakFrozen` (#7C93C4) cho huy hiệu đóng băng, nhưng chữ trắng trên nó chỉ đạt **3.08:1**. Phải thêm token `Colors.streakFrozenDeep = "#617299"` (4.80:1). Luôn đo trước khi thay, kể cả khi màu thay "đúng họ".

### Màu splash nằm ở 5 chỗ, sửa phải sửa hết
`#208AEF` có ở `app.json:34`, `android/app/src/main/res/values/colors.xml` (2 dòng: `splashscreen_background`, `colorPrimaryDark`), `android/.../values/styles.xml` (`statusBarColor`), và `animated-icon.tsx` (overlay JS khớp với splash native). Sửa lẻ phía JS sẽ tạo cú nháy màu khi chuyển từ splash native sang overlay. Đây là thay đổi cấu hình native → phải hỏi người dùng trước.

## Phân Hệ Ôn Tập SM-2, Lỗi Sai & Từ Điển (Goal 51)

### Instant Feedback vs Deferred Grading Trong Luyện Tập Lỗi Sai
Khi FE sử dụng `QuizBottomBar` chuẩn Duolingo, trải nghiệm người dùng đòi hỏi phản hồi tức thì ("Chính xác!" / "Sai rồi!" + SFX đàn Koto/Taiko + hiện đáp án đúng) ngay khi nhấn "KIỂM TRA". Backend `ReviewSessionResponse.ReviewOption` bắt buộc phải trả trường `Boolean isCorrect`, không được giấu đáp án chỉ để chấm trễ ở `/submit`. Nếu thiếu `isCorrect`, FE mặc định coi mọi lựa chọn là sai và câu sắp xếp `LISTEN_AND_ARRANGE` bị hỏng logic hoàn toàn.

### Đồng Bộ Audio Cho `VocabQuestionCard`
`VocabQuestionCard` đòi hỏi cả `question.audioUrl` (file âm thanh ghi âm chuẩn) và `question.word` (fallback cho speech TTS khi audioUrl rỗng). Khi dựng câu hỏi ôn tập từ vựng SM-2 (`VocabularyReviewScreen`), bắt buộc phải map đủ hai trường này từ `item.audioUrl` và `item.surface`.

### Tích Hợp Loa Sổ Tay Từ Điển (`WordCard`)
Tránh đặt callback rỗng `onPress={() => {}}` ở các nút tương tác như `AudioButton`. Trong `WordCard`, tích hợp `useAudio(entry.audioUrl || "", entry.kanji || entry.reading)` để đảm bảo bấm loa là phát âm thanh chuẩn hoặc TTS.

## Lỗi Chặn Chạm (Touch Interception) & Xung Đột Z-Index / Elevation Giữa Modal và BottomSheet (Goal 54)

### Bản Chất Lỗi: React Native View Tuyệt Đối vs Native Dialog Window
- Khi hiển thị hộp thoại xác nhận (như `SignOutModal`) đè lên một BottomSheet (như `MoreBottomSheet` có `zIndex: 1000` + `elevation: 12`):
  - Nếu modal chỉ dùng một `Animated.View` thông thường (`ModalCard` có `zIndex: 100`), trên Android engine touch dispatcher sẽ ưu tiên view có `zIndex` và `elevation` cao hơn.
  - Hậu quả: `MoreBottomSheet` nằm đè lên `SignOutModal`. Người dùng chạm vào màn hình (kể cả bấm nút "ĐĂNG XUẤT") thì touch event bị `MoreBottomSheet` hứng trọn. Cú chạm ở nửa trên kích hoạt `onClose` đóng bottom sheet làm mất modal; cú chạm ở nửa dưới bị card sheet hứng và nuốt chửng → **Nút "ĐĂNG XUẤT" hoàn toàn không phản hồi**.
  - **Tại sao Jest Test không bắt được?**: React Native Testing Library (`fireEvent.press`) chỉ gọi trực tiếp callback prop `onPress` trong Virtual Tree/Fiber của component mà không mô phỏng hit-testing hệ điều hành hay `zIndex`/`elevation` trên Android native view hierarchy. Do đó unit test vẫn pass xanh 100% trong khi trên máy thật bị liệt nút.

### Giải Pháp Chuẩn
1. **Luôn bọc modal trong React Native `<Modal>` component**:
   - `<Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={...}>`:
     - Trên Android, component này tạo ra một `android.app.Dialog` Window riêng biệt ở tầng Window Manager của OS.
     - Nằm độc lập và hoàn toàn ở trên React Root View, miễn nhiễm với `zIndex` và `elevation` của bất kỳ component cha/anh em nào.
     - Chặn 100% rò rỉ sự kiện chạm xuống các view bên dưới.
     - Bắt trọn phím Back phần cứng Android qua `onRequestClose`.
2. **Nâng `zIndex` của `ModalCard`**:
   - Đặt `zIndex: 2000` cho `ModalCard.overlayContainer` để phòng vệ trường hợp dùng không qua native modal.
3. **Phòng vệ Network Hang (`authService.logout`)**:
   - Luôn bọc API logout bằng `Promise.race` với timeout 4s. Vì Axios mặc định không timeout (`timeout: 0`), nếu mạng ngrok/tunnel bị chậm hoặc mất kết nối thì app sẽ bị kẹt vĩnh viễn ở trạng thái "ĐANG ĐĂNG XUẤT...".

## Thiết Kế Câu Hỏi Phát Âm & Nút Hành Động Phụ Trên Thanh Đáy Cố Định (Goal 55)

### Bản Chất Lỗi: Chiều Cao Nội Dung Vượt Quá Viewport Đẩy Nút Bỏ Qua Xuống Dưới Nếp Gấp
- Trong các dạng câu hỏi đặc thù như `SPEAKING`:
  - Thẻ câu hỏi chứa rất nhiều phần tử chiếm diện tích dọc: Prompt câu hỏi, đoạn văn bản tiếng Nhật kèm Furigana, dòng Romaji & nghĩa tiếng Việt, nút Nghe câu mẫu, nút Micro lớn (110-120px) và các thông điệp gợi ý/lỗi ghi âm.
  - Nếu màn hình còn đặt thêm một hoạt họa Mascot Lottie dùng chung (~125px) ở trên đầu:
    - Tổng chiều cao nội dung trong `ScrollView` vượt ngưỡng khả dụng của màn hình điện thoại (đặc biệt là khi thanh `QuizBottomBar` cao 90-100px neo cố định ở đáy).
    - Hậu quả: Bất kỳ nút phụ nào đặt ở cuối thẻ (như nút chữ gạch chân `"Bạn không thể nói lúc này?"`) sẽ bị đẩy xuống dưới nếp gấp (below the fold) hoặc bị chính thanh bottom bar che lấp. Người dùng không thấy được nếu không chủ động cuộn xuống.

### Giải Pháp Chuẩn Duolingo
1. **Đưa nút bỏ qua / hành động phụ ra thanh điều hướng đáy (`QuizBottomBar`)**:
   - Truyền `onSkipSpeaking` vào `QuizBottomBar` để vẽ nút "Không thể nói lúc này?" cố định ngay phía trên nút "KIỂM TRA" khi câu hỏi chưa được submit (`!hasSubmitted`).
   - Đảm bảo luôn hiển thị 100% tầm mắt người dùng bất kể kích thước màn hình hay nội dung bên trong có dài bao nhiêu.
2. **Ẩn Mascot Lottie dùng chung cho câu `speaking`**:
   - Tương tự như `vocab` đã có minh họa riêng, câu `speaking` cần không gian thoáng cho micro và câu mẫu nên cần ẩn `QuestionMascot` dùng chung (`currentQuestion.type !== "vocab" && currentQuestion.type !== "speaking"`).
   - Toàn bộ nội dung câu nói vừa vặn trọn vẹn trong một khung nhìn duy nhất, không bao giờ bị tràn (zero overflow).
3. **Phản hồi người dùng rõ ràng (User Feedback)**:
   - Khi bấm bỏ qua câu nói, lọc bỏ tất cả câu nói còn lại trong buổi học và luôn hiển thị `useToast().showInfo("Đã tạm bỏ qua các bài tập nói trong bài học này")` để người học nắm rõ ngữ cảnh.
4. **Đối với màn hình thuần phát âm (`/voice/record.tsx`)**:
   - Khi bấm "Không thể nói lúc này?", mở hộp thoại `ModalCard` cung cấp 3 lựa chọn trực quan: "BỎ QUA CÂU NÀY", "THOÁT VỀ ÔN TẬP", hoặc "Ở LẠI".


