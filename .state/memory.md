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
