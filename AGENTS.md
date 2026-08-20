# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# Project Structure Rules

## NEVER dump everything into a single file. Always separate concerns into the correct folders:

### `src/types/`

- All TypeScript interfaces, types, enums.
- One file per domain/feature (e.g., `lesson.ts`, `user.ts`, `api.ts`).
- Barrel export via `index.ts`.

### `src/components/`

- Reusable UI components used across multiple screens.
- Feature-specific components go in a subfolder: `components/lessons/`, `components/auth/`, etc.
- Each component = 1 file. Keep it focused and small.
- `ui/` subfolder for generic primitives (Button, Card, Input, etc.).

### `src/data/`

- Mock/sample data, static content, seed data.
- One file per domain (e.g., `lessons.ts`, `categories.ts`).
- Barrel export via `index.ts`.

### `src/app/`

- Expo Router screens ONLY.
- Screen files should be thin: import components, compose layout, handle navigation.
- DO NOT put business logic, large component definitions, or data here.

### `src/hooks/`

- Custom React hooks. One hook per file.

### `src/services/`

- API clients, storage, push notifications, analytics.
- Subfolder per service domain: `services/api/`, `services/storage/`.

### `src/contexts/`

- React Context providers and their hooks.

### `src/constants/`

- Theme, colors, spacing, font config, static app constants.

### `src/config/`

- Environment variables, feature flags, app metadata.

### `src/utils/`

- Pure utility/helper functions (format, validate, debounce, etc.).

### `src/locales/`

- i18n string resources.

## Import Rules

- Always use path alias `@/` (maps to `./src/`).
- Always use barrel exports (`index.ts`) for cleaner imports.
- Example: `import { Lesson } from '@/types'` not `from '@/types/lesson'`.

## Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Types/Interfaces: `PascalCase`
- Functions/hooks: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` or `PascalCase` object

---

# Behavior Rules – React Native Frontend

## General

- Act conservatively; prefer reversible changes.
- Do not silently expand scope. If a task implies larger refactors or new features, propose a minimal path first.

## React Native Specifics

- Follow existing patterns for props, hooks, and styling (`StyleSheet`, design tokens).
- Avoid introducing new global state mechanisms unless asked.
- Optimize list rendering (`FlatList`), image loading, and memoization for performance-sensitive screens.

## Verification Before Completion (Zero-Tolerance Syntax Check)

Before marking ANY React Native task complete or concluding your turn after editing code:

- **Code & Syntax Integrity:**
  - **No Duplicate Imports:** Never import the same identifier multiple times in a single file (e.g., `import { Spacing, Spacing } from ...`). Always verify the import block after editing.
  - **JSX & Scope Integrity:** Ensure all JSX tags (`<View>`, `</View>`), brackets `{ ... }`, and parentheses are properly matched and closed.
- **Mandatory Static Verification (ZERO EXCEPTIONS):**
  - Run `npx tsc --noEmit` immediately after modifying any `.ts` or `.tsx` file.
  - You MUST NOT conclude your turn or inform the user that work is complete until `npx tsc --noEmit` passes with 0 errors. If it fails, read the error and fix it immediately.
- **Mandatory E2E / Integration Testing:**
  - When creating a new feature, a new UI component, or connecting to a new API, you MUST write an integration test using `@testing-library/react-native`.
  - The test must simulate real user interactions (e.g., `fireEvent.press`, `fireEvent.changeText`) and mock the API responses.
  - Run `npm test` (or the specific test file using `npx jest path/to/file`) and ensure it passes (green). DO NOT mark the task complete if the test fails.
  - Run `npm run lint`.
- If direct execution is unavailable, summarize type-check/test status and request manual verification on emulator/device.

## No API/Data Guessing

- DO NOT invent or guess API responses, endpoints, or data structures.
- ALWAYS read the backend API documentation (e.g., `FE_API_GUIDE_...` files) before implementing API calls or data models. If the docs are missing or unclear, ask the user.

## Safety & Confirmation

For changes that can break navigation, environment configs, or production settings:

1. State exactly what will change.
2. Ask for explicit user confirmation before proceeding.

---

# Backend Modification Rule

- DO NOT modify any code inside the backend project (e.g., `BE_NihongoApp`) unless explicitly requested by the user. Your role is strictly focused on the `Frontend-Native` project.

---

# State Maintenance & Discipline

## State Files Location

- `.state/session_state.md`: Tracks active mission, session goals, current plan, progress, blockers, and decisions.
- `.state/memory.md`: Stores learned patterns, reusable code snippets, and workspace gotchas.

## When to READ & UPDATE `.state/session_state.md`

- 🟢 **MUST UPDATE (`session_state.md`)**:
  - Starting a new coding task or feature (Define Mission/Goal and initial Plan).
  - Completing a sub-task or plan step (Mark `[x]` and update `Progress`).
  - Encountering or resolving technical blockers (Update `Blockers`).
  - Making major architectural or UI/UX decisions (Update `Decisions`).
- ⚪ **DO NOT UPDATE (`session_state.md`)**:
  - Responding to Q&A, code explanations, concept clarifications, or informational requests (Read-Only queries).

## Pattern Capture

- When encountering reusable patterns or solving tricky bugs, append the solution to `.state/memory.md` for future sessions.

---

# Project Skills Integration

The workspace includes specialized skills in `.agents/skills/`. Always follow their guidance:

- **`state-keeper`** ([SKILL.md](file:///c:/Users/Endministrator/Pictures/Frontend-Native/.agents/skills/state-keeper/SKILL.md)):
  - Automatically manage `.state/session_state.md` using the exact structure (Mission, Session Goal, Plan, Progress, Blockers, Decisions).
- **`goal-tracker`** ([SKILL.md](file:///c:/Users/Endministrator/Pictures/Frontend-Native/.agents/skills/goal-tracker/SKILL.md)):
  - Align all implementation steps with project mission (ship fast, stable, accessible RN app). Prevent scope creep.
- **`behavior-guard`** ([SKILL.md](file:///c:/Users/Endministrator/Pictures/Frontend-Native/.agents/skills/behavior-guard/SKILL.md)):
  - Prevent command execution loops (max 3 identical runs).
  - Verify static type-checks (`tsc --noEmit`).
  - Require explicit user approval before destructive file or database operations.
