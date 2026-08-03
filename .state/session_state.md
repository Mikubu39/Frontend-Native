# Session State – React Native

## Mission
Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal
1. Refactor Home Screen to use native sticky `UnitBanner` using `stickyHeaderIndices`.
2. Update Frontend to parse and display long-press hints for Japanese words in Quiz.
3. Reseed DB with "learn-by-doing" scientific lesson flow.

## Plan
- [x] Create implementation plan.
- [x] Update `index.tsx`: Replace horizontal tab bar with native sticky headers.
- [x] Update `quiz.ts` and `quiz-mapper.ts`: Support `hint` field parsing from `metadataJson`.
- [x] Update `vocab-question.tsx`: Implement Tooltip / Long Press to view hint.
- [x] Create `V18__reseed_scientific_lessons.sql` with learn-by-doing flow.
- [x] Restart backend to apply migration. (Delegated to user).

## Progress
- Done: Implemented native sticky headers for Unit Banners, added Long-press Hint functionality, and sync'd backend code from Documents/BE_NihongoApp with Flyway V20 reseed migration.
- Done: Fixed a Network Error by updating `EXPO_PUBLIC_API_URL` in `.env` from `192.168.1.6` to `192.168.1.3` (the current local IP).
- Done: Fixed a 403 Forbidden error in `GamificationProvider` by wrapping the data fetch in an `isAuthenticated` check.
- In progress: N/A
- Blocked: N/A

## Next Steps
- User to restart Backend database/container to run Flyway migrations V1..V20.

## Blockers
- N/A

## Decisions
- The home screen will render a `ScrollView` containing multiple SVG paths (one for each topic) to prevent overlapping and allow dynamic tab switching.
