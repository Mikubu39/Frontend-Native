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
