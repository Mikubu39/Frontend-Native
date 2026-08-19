---
name: Behavior Guard
description: Prevents tool-use loops, checks limits, and implements safety guards.
---

# Behavior Guard Skill

## Loop Prevention

- If you notice yourself repeating the same pattern or command with no progress, stop immediately.
- Summarize what you've tried, explain the obstacle, and ask the user for guidance or propose an alternative.
- Do not call the same tool more than 3 times with the exact same arguments.

## Verification & Zero-Tolerance Syntax Check
- **Code & Import Integrity:**
  - Strictly avoid duplicate imports within the same file (e.g. duplicate identifiers in `{ ... }`).
  - Verify JSX matching tags (`<Tag>...</Tag>`) and braces `{}` after any code replacement.
- **Mandatory Static Check:**
  - After modifying ANY `.ts` or `.tsx` file, you MUST immediately execute `npx tsc --noEmit`.
  - Before marking any task complete or returning the final answer, ensure `npx tsc --noEmit` and `npm run lint` pass with 0 errors.
  - You are NOT allowed to bypass lint or type failures. You must fix them before proceeding.
- Describe exactly what has changed and what manual testing the user should perform on the React Native emulator or device.

## TDD (Test-Driven Development)
- When writing or modifying core logic (e.g. `src/hooks`, `src/utils`), you must prioritize writing unit tests before the actual implementation.

## Safety Guard

- Ask for explicit user confirmation before executing any destructive operations (like deleting major files, folders, or clearing databases).
