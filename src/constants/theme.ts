/**
 * Kotodama Design System
 *
 * Color palette, typography, spacing, and layout constants
 * derived from the Figma designs.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  /** Core brand palette */
  primary: "#8B5CF6",
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",

  secondary: "#E91E8E",
  secondaryLight: "#FF6EC7",

  accent: "#FFB800",
  accentLight: "#FFCA28",
  accentPale: "#FFE082",

  /** Gradients (used with LinearGradient) */
  gradients: {
    splash: ["#FF00FF", "#8B5CF6", "#E88D67", "#FFB800"],
    primary: ["#8B5CF6", "#E91E8E"],
    home: ["#8B5CF6", "#E91E8E", "#FF69B4"],
    result: ["#8B5CF6", "#E91E8E", "#FFB800"],
    reward: ["#8B5CF6", "#E91E8E"],
    profile: ["#8B5CF6", "#E91E8E"],
  },

  /** Backgrounds */
  cream: "#FFF8E7",
  creamDark: "#FFF3D0",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  /** Text */
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textOnDark: "#FFFFFF",
  textOnCream: "#1A1A2E",
  textLink: "#E91E8E",

  /** Input / borders */
  inputBorder: "#FFD54F",
  inputBorderFocus: "#FFB800",
  inputBackground: "#FFFFFF",

  /** Status */
  success: "#4CAF50",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  warning: "#FFB800",

  /** Tab bar */
  tabActive: "#E91E8E",
  tabInactive: "#9CA3AF",

  /** Misc */
  locked: "#D1D5DB",
  lockedBg: "#E5E7EB",
  checkmark: "#E91E8E",
  overlay: "rgba(0, 0, 0, 0.5)",

  /** Theme mode palettes */
  light: {
    text: "#1A1A2E",
    textSecondary: "#6B7280",
    background: "#FFF8E7",
    backgroundElement: "#FFF3D0",
    backgroundSelected: "#FFE082",
    card: "#FFFFFF",
    cardElevated: "#FFFFFF",
    border: "#E5E7EB",
    borderSubtle: "#F3F4F6",
    tabBarBg: "rgba(255, 255, 255, 0.75)",
    tabBarBorder: "rgba(255, 255, 255, 0.8)",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    background: "#1C1C24", // Lighter slate/grey
    backgroundElement: "#2A2A35", 
    backgroundSelected: "#3E3E4F", 
    card: "#262631", // Lighter card
    cardElevated: "#30303D",
    border: "#3F3F4E",
    borderSubtle: "#2A2A35",
    tabBarBg: "rgba(38, 38, 49, 0.9)",
    tabBarBorder: "rgba(255, 255, 255, 0.12)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: "Nunito_600SemiBold",
  serif: "serif",
  rounded: "Nunito_700Bold",
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

export const BorderRadius = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 999,
} as const;

/**
 * Cross-platform shadow presets for consistent depth layering.
 * Use `sm` for cards, `md` for elevated elements, `lg` for modals/FABs.
 */
export const Shadows = {
  soft: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
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
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  sm: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  lg: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  xl: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.2,
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
