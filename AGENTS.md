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
