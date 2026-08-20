# Session State – React Native

## Mission

Ship a fast, stable, accessible React Native application aligned with the roadmap.

## Session Goal

1. Impeccable Quiz & Lesson Flow Redesign — full theme-aware redesign of all quiz screens and question components.

## Plan

- [x] Fix Lesson Map path connection bug.
- [x] Update Profile Avatar layout to match reference.
- [x] Change Lesson click behavior to use a small popover.
- [x] Fix energy requirement warning (energy < 1).
- [x] Add Streak Extended screen and trigger it appropriately.
- [x] Install & Sync `impeccable` skill into `.agents/skills/`.
- [x] Option 1: Accessibility (a11y) & Platform Conformance Polish.
  - [x] Add `accessibilityRole`, `accessibilityState`, and `accessibilityLabel` to `AnimatedPressable`, `GradientButton`, `SocialButton`, `AudioButton`, `OptionCard`, `TabSwitcher`.
  - [x] Implement dynamic `useSafeAreaInsets` on Floating Tab Bar in `_layout.tsx`.
  - [x] Optimize SVG Path computation with `useCallback` and add a11y labels to Home map nodes & stats headers.
- [x] Option 2: Custom Toast / In-App Feedback System.
  - [x] Create `src/types/toast.ts` & `src/components/ui/in-app-toast.tsx` with spring animations, haptics, and glassmorphism.
  - [x] Create `src/contexts/toast-context.tsx` and integrate into root `_layout.tsx`.
  - [x] Replace raw `Alert.alert` with `useToast()` in Shop (`search.tsx`), Profile (`qr.tsx`, `edit.tsx`), Auth (`login.tsx`, `signup.tsx`), Review (`mistakes.tsx`), Friends (`index.tsx`), and Settings (`index.tsx`).
- [x] Option 3: Dark Mode Harmonization & In-App Theme Selector.
  - [x] Define `ThemeMode` ("light" | "dark" | "system") in `src/types/theme.ts`.
  - [x] Create `ThemeProvider` & `useTheme()` hook in `src/contexts/theme-context.tsx` with persistent storage (`user_theme_mode`).
  - [x] Add Theme Mode Selector & Modal in `src/app/settings/index.tsx` (Light / Dark / System Default).
  - [x] Harmonize dynamic theming across all screens: `_layout.tsx`, `(tabs)/_layout.tsx`, `index.tsx`, `characters.tsx`, `quests.tsx`, `leaderboard.tsx`, `search.tsx`, `more.tsx`, `profile.tsx`.
- [x] Impeccable Tab Bar Redesign (pill-expand active tabs).
- [x] Impeccable Lesson Map Full Redesign.

## Progress

- Done: Fixed React list unique key warning in Quests tab (`quests.tsx`).
- Done: **Full impeccable redesign of Lesson Map** (`src/app/(tabs)/index.tsx`).
  - World: "Game World Traversal" — dark background (#0F0F1A), violet–magenta palette.
  - Hexagon nodes (SVG polygon) replacing circle-progress widgets.
  - Three distinct node states: COMPLETED (gradient fill + checkmark), ACTIVE (pulsing glow ring + float), LOCKED (desaturated, lock icon).
  - Dual-rail SVG track: outer translucent rail + active gradient inner fill + white center highlight + halo glow.
  - Dark topic banners with colored left accent bar per topic, lesson count meta.
  - Rich popover: lesson type badge + difficulty stars + gradient CTA button.
  - Header: BlurView + language pill + stat pills (streak/coins/energy).
  - Dot-texture background + floating ambient orbs.
  - TypeScript: 0 errors. `"light"` / `"dark"`.
- Done: Redesigned bottom navigation bar (impeccable).
  - New `TabItem` component: pill-expand active pattern (icon → icon + label).
  - New `_layout.tsx`: edge-to-edge, BlurView on iOS, solid on Android, thin brand-tint top border.
  - Uses React Navigation `BottomTabBarProps` for reliable focus state.

- Done: Added "Incomplete Profile" banner on Profile screen.
  - Checks if user's display name is missing, matches their email, or is a default placeholder.
  - Displays a prominent banner directing the user to `/profile/edit`.
  - Used `Ionicons` and `AnimatedPressable` for interaction.

- Done: Added Shop Core enhancements.
  - Implemented real-time Countdown Timer for active Power-ups (Double XP, etc.) based on `expiresAt`.
  - Replaced native toast with full-screen "Chưa đủ xu!" Dialog (ModalCard) with smart routing to go learn and earn coins when buying fails.
  - TypeScript checks passed successfully.

## Next Steps

- Await user feedback or next feature request.

## Blockers

- None.

## Decisions

- Stored theme preference in persistent local storage (`user_theme_mode`).
- Effective theme resolves to system scheme when mode is `"system"`, or directly to `"light"` / `"dark"`.
- Tab bar: edge-to-edge instead of floating pill — less Duolingo-clone look.
- Active indicator: pill capsule (icon + label) instead of dot indicator — more informative, less cluttered.
