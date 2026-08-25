# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# Project Structure Rules

NEVER dump everything into one file — split by concern:
`types/` interfaces/enums (1 file/domain, barrel) · `components/` 1 component = 1 file (`ui/` = generic primitives, feature subfolders e.g. `components/lessons/`) · `data/` mock/seed (1 file/domain, barrel) · `app/` Expo Router screens ONLY, thin — no business logic/data · `hooks/` 1 hook/file · `services/` API/storage/analytics, subfolder per domain (`services/api/`) · `contexts/` · `constants/` theme/spacing/tokens · `config/` env/feature flags · `utils/` pure functions · `locales/` i18n.

## Import Rules

- Path alias `@/` → `./src/`. Barrel exports (`index.ts`). E.g. `import { Lesson } from '@/types'`, not `from '@/types/lesson'`.

## Naming Conventions

- Files `kebab-case`. Types/Interfaces `PascalCase`. Functions/hooks `camelCase`. Constants `SCREAMING_SNAKE_CASE` or `PascalCase` object.

---

# Behavior Rules – React Native Frontend

## General

- Act conservatively; prefer reversible changes.
- Do not silently expand scope. If a task implies larger refactors or new features, propose a minimal path first.

## Codebase Exploration — Use `codebase-memory-mcp`

- Before reading/grepping multiple files to find a function, trace callers/callees, or assess the impact of a change, use the `codebase-memory-mcp` MCP tools (`search_graph`, `trace_path`, `get_code_snippet`, `detect_changes`, `get_architecture`) instead. It returns precise structural results at a fraction of the token cost of manual file reads.
- Use `trace_path` (direction="both") before modifying a shared function/hook/service to see what depends on it.
- Use `detect_changes()` to map the current git diff to affected symbols before declaring a change safe.
- Fall back to Read/Grep only when the graph doesn't cover the answer (e.g. non-indexed file types, or `check_index_coverage` reports a gap).

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

`.agents/skills/` (`state-keeper`, `goal-tracker`, `behavior-guard`) is read by **Antigravity only** — Claude Code reads `.claude/skills/`, not this path. Their rules are already covered above in this file ("State Maintenance & Discipline", "Behavior Rules") and in the `tsc-gate` Stop hook, so there is nothing further to fetch from there.
