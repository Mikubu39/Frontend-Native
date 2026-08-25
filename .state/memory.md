# Memory

## What Works

- Follow established project structures (such as separating concerns into `src/components/`, `src/types/`, etc. as defined in workspace rules).
- Use path alias `@/` mapping to `./src/`.
- Use barrel exports (`index.ts`) for clean imports.

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

Chữ Nhật *nội dung* (bảng chữ cái, câu ví dụ) vẫn render bình thường ở cỡ lớn — chỉ tránh dùng làm ký hiệu nhỏ.

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
