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
