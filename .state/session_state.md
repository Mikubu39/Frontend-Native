# Session State – React Native

## Mission
Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal
1. UI/UX Enhancements for Lesson Map, Profile Avatar, Lesson Popover, Energy Warning, and Streak Fire Screen.

## Plan
- [x] Fix Lesson Map path connection bug.
- [x] Update Profile Avatar layout to match reference.
- [x] Change Lesson click behavior to use a small popover.
- [x] Fix energy requirement warning (energy < 1).
- [x] Add Streak Extended screen and trigger it appropriately.

## Progress
- Done: All frontend UI/UX enhancements and bug fixes are complete.

## Next Steps
- User to verify UI changes in Expo app.
- Wait for user feedback.

## Blockers
- Streak calculation on click is a Backend issue (in `startLesson`), communicated to user.

## Decisions
- Replaced `ModalCard` with inline popover in `index.tsx`.
- Changed progressIndex check to allow both UNLOCKED and COMPLETED.
