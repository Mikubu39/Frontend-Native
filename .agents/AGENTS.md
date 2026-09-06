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
- Do not silently expand scope. If a task implies larger refactors or new features, say so and propose a minimal path first.

## React Native Specifics

- When touching components:
  - Follow existing patterns for props, hooks, and styling (StyleSheet, design tokens, etc.).
  - Avoid introducing new global state mechanisms unless asked.
- For new screens or major flows:
  - Confirm navigation structure (React Navigation / Expo Router / etc.) before implementing.
- For performance-sensitive changes (lists, images, animations):
  - Mention potential impact on FPS and memory.
  - Suggest appropriate patterns (e.g. `FlatList` optimizations, memoization) when relevant.

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
- If you can’t run the app directly:
  - Clearly say so.
  - Ask the user to perform a quick manual check on a device/emulator, or specify what they should verify.
- Summarize evidence:
  - “Type checks pass with 0 errors, no new ESLint errors.”
  - “Screen X renders with sample data; please verify on iOS and Android.”

## No API/Data Guessing

- DO NOT invent or guess API responses, endpoints, or data structures.
- ALWAYS read the backend API documentation (e.g., `FE_API_GUIDE_...` files) before implementing API calls or data models. If the docs are missing or unclear, ask the user.

## Safety & Confirmation

For changes that can:

- Break the app (navigation, entry points, environment config)
- Affect production data (API endpoints, auth, payments)
- Change release behavior (permissions, deep links, push notifications)
  You must:

1. State exactly what will change.
2. Ask for explicit user confirmation before proceeding.

## Loop Prevention

- If you notice yourself repeating the same pattern with no progress (e.g., re-running the same command, re-editing the same file in the same way), stop and:
  - Summarize what you’ve tried.
  - Propose a different approach or ask the user.
- Do not call the same build/run/lint command more than 3 times in a row with identical arguments unless something clearly changed.

## State Maintenance & Discipline

Before ending your turn, ensure:

- Read `.state/session_state.md` and `.state/memory.md` to load state.
- Update `.state/session_state.md` to reflect the latest status of the plan, progress, and decisions.
- If you learned any reusable patterns, append them to `.state/memory.md`.

# Backend Modification Rule

- DO NOT modify any code inside the backend project (e.g., BE_NihongoApp) unless explicitly requested by the user. Your role is strictly focused on the Frontend-Native project.
