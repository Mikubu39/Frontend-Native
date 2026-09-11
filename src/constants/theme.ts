/**
 * Nihongo Design System — "Ai-zome" (Xưởng nhuộm chàm)
 *
 * Palette drawn from real Japanese craft materials instead of a generic
 * SaaS gradient: ai-zome indigo dye, shu-iro hanko-seal vermillion, aged
 * gold leaf, and washi paper — kept saturated enough for game UI, but
 * grounded, not neon.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  /** Core brand palette */
  primary: "#3B4C82", // ai — indigo dye
  primaryLight: "#5E6FA8",
  primaryDark: "#2A3760",

  secondary: "#BE4A34", // shu — hanko-seal vermillion
  secondaryLight: "#D97456",
  secondaryDark: "#8C3626",

  accent: "#C4922E", // kogane — aged gold leaf
  accentLight: "#D9AC5C",
  accentPale: "#EAD6A8",

  /** Gradients (used with LinearGradient) — tone-on-tone by default; the
   *  richer multi-stop combinations are reserved for genuine celebration
   *  moments (splash, quiz result) rather than repeated on every surface. */
  gradients: {
    splash: ["#3B4C82", "#8A4A5E", "#C4922E"],
    primary: ["#3B4C82", "#5E6FA8"],
    home: ["#3B4C82", "#5E6FA8", "#BE4A34"],
    result: ["#3B4C82", "#BE4A34", "#C4922E"],
    reward: ["#BE4A34", "#C4922E"],
    profile: ["#3B4C82", "#5E6FA8"],
  },

  /** Backgrounds */
  cream: "#F7EFDE", // washi paper
  creamDark: "#EFE2C4",
  surface: "#FFFCF5",
  surfaceElevated: "#FFFFFF",

  /** Text */
  textPrimary: "#2B2420", // sumi ink
  textSecondary: "#6F6559",
  textOnDark: "#FFFFFF",
  textOnCream: "#2B2420",
  textLink: "#BE4A34",

  /** Input / borders */
  inputBorder: "#E3C688",
  inputBorderFocus: "#C4922E",
  inputBackground: "#FFFFFF",

  /** Status */
  success: "#4C8C63", // moss
  error: "#E4483A",
  errorLight: "#FBE4DF",
  warning: "#C4922E",

  /** Score tones for the washi (light) background.
   *
   *  The bright pair used on the dark palette (#4ADE80 / #F87171) measures
   *  1.36:1 and 2.15:1 against the cream surface — far under the 3:1 floor for
   *  large text, which is why the result numbers were hard to read. These
   *  reach 4.8:1 and 4.6:1. */
  successInk: "#3A6B4B",
  errorInk: "#B8341F",

  /** Tab bar */
  tabActive: "#BE4A34",
  tabInactive: "#9C948A",

  /** Misc */
  locked: "#C9C0B2",
  lockedBg: "#EDE6D8",
  /** Dark-mode counterparts — the roadmap map's hex nodes render on a dark
   *  indigo-night backdrop in dark mode, so the light-mode locked tones read
   *  wrong there. Same visual weight, tuned for the dark palette. */
  lockedDark: "#3D4054",
  lockedBgDark: "#252736",
  checkmark: "#4C8C63",

  /** Streak state — kept in the "ai"/"kogane" family instead of the raw
   *  Duolingo orange/cyan (#FF9600 / #00C8FF) so the streak UI reads as part
   *  of this app's own palette rather than an unmodified brand color. */
  streakActive: "#D9762E", // warm ember-gold (kogane/shu lineage)
  streakFrozen: "#7C93C4", // indigo-frost (ai lineage)
  /** Frost deep enough to carry white label text (4.8:1); the base tone only
   *  reaches 3.08:1, which is under the floor for the small freeze badges. */
  streakFrozenDeep: "#617299",

  /** Energy / Stamina */
  energy: "#4ADE80", // bright vitality green (matching header flash)
  energyDark: "#22C55E",

  /** Theme mode palettes */
  light: {
    text: "#2B2420",
    textSecondary: "#6F6559",
    background: "#F7EFDE",
    backgroundElement: "#EFE2C4",
    backgroundSelected: "#EAD6A8",
    card: "#FFFCF5",
    cardElevated: "#FFFFFF",
    border: "#E6DCC8",
    borderSubtle: "#F0E8D8",
    tabBarBg: "#FFFCF5",
    tabBarBorder: "rgba(255, 255, 255, 0.8)",
    overlay: "rgba(0, 0, 0, 0.5)",
    overlaySubtle: "rgba(0, 0, 0, 0.3)",
    overlayLight: "rgba(255, 255, 255, 0.4)",
    borderTransparent: "rgba(0, 0, 0, 0.1)",
    cardQuiz: "#FFFCF5",
    cardQuizBorder: "#E6DCC8",
  },
  dark: {
    text: "#F5EFE3",
    textSecondary: "#B0A594",
    background: "#1B1D2B", // indigo night
    backgroundElement: "#262A3D",
    backgroundSelected: "#333A56",
    card: "#232739",
    cardElevated: "#2B3049",
    border: "#363C56",
    borderSubtle: "#262A3D",
    tabBarBg: "#232739",
    tabBarBorder: "rgba(255, 255, 255, 0.12)",
    overlay: "rgba(0, 0, 0, 0.7)",
    overlaySubtle: "rgba(0, 0, 0, 0.4)",
    overlayLight: "rgba(255, 255, 255, 0.1)",
    borderTransparent: "rgba(255, 255, 255, 0.12)",
    cardQuiz: "rgba(255, 255, 255, 0.06)",
    cardQuizBorder: "rgba(255, 255, 255, 0.1)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: "Nunito_600SemiBold",
  serif: "serif",
  /** Headlines, labels, buttons — Zen Maru Gothic, a rounded Japanese
   *  gothic, in place of the generic Nunito-everywhere look most
   *  gamified-app clones share. */
  rounded: "ZenMaruGothic_700Bold",
  /** Hero numbers and celebration moments only (streak count, XP total). */
  display: "ZenMaruGothic_900Black",
  mono: Platform.OS === "ios" ? "ui-monospace" : "monospace",
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 36,
  splash: 48,
} as const;

export const FontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 56,
  twelve: 64,
  sixteen: 80,
} as const;

/**
 * Corner radii, as a hierarchy rather than a set of similar large numbers.
 *
 * The previous scale started at 16 — there was no way to draw a small corner
 * with a token, so a 20px badge and a full-screen sheet were shaped the same
 * and the interface had no shape hierarchy at all. Everything reading as one
 * soft blob is a large part of what makes a UI look machine-assembled.
 *
 * The steps below widen as the surface grows, which is how physical objects
 * behave: a small chamfer on a small object, a broad one on a large panel.
 * Pick by what the element *is*, not by how soft you want it to look.
 */
export const BorderRadius = {
  /** Inputs, dividers, seal marks — nearly square. */
  xs: 2,
  /** Chips, badges, small tags. */
  sm: 6,
  /** Cards and list rows. */
  md: 12,
  /** Buttons and large cards. */
  lg: 20,
  /** Modals and bottom sheets. */
  xl: 28,
  /** Hero surfaces. */
  xxl: 36,
  /** Genuine pills only: counters, avatars, progress tracks. */
  full: 999,
} as const;

/**
 * Cross-platform shadow presets for consistent depth layering.
 * Use `sm` for cards, `md` for elevated elements, `lg` for modals/FABs.
 *
 * Tinted with ink (`#2B2420`) rather than the brand color — a grounded
 * paper-shadow instead of a colored neon glow under every card.
 * `glowPrimary` and `glow()` stay colored on purpose, reserved for the
 * handful of spots that should genuinely glow (primary CTA, active state).
 */
export const Shadows = {
  soft: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  float: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
  },
  glowPrimary: {
    shadowColor: "#3B4C82",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sm: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  lg: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.13,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: "#2B2420",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.17,
    shadowRadius: 48,
    elevation: 12,
  },
  /** Colored shadow for accent elements (Deep) */
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  }),
} as const;

/**
 * Centralized spring & timing configs for consistent motion design.
 */
export const AnimationPresets = {
  /** Gentle spring for most UI transitions */
  spring: {
    damping: 18,
    stiffness: 150,
    mass: 0.8,
  },
  /** Snappy spring for button presses (best with haptics) */
  springSnappy: {
    damping: 15,
    stiffness: 350,
    mass: 0.5,
  },
  /** Bouncy spring for playful elements (mascot, rewards) */
  springBouncy: {
    damping: 12,
    stiffness: 150,
    mass: 0.8,
  },
  /** Tab icon spring */
  springTab: {
    damping: 14,
    stiffness: 220,
    mass: 0.6,
  },
  /** Duration presets in ms */
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  /** Stagger delay between list items */
  staggerDelay: 50,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
