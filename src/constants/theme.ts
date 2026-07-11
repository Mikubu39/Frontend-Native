/**
 * Kotodama Design System
 *
 * Color palette, typography, spacing, and layout constants
 * derived from the Figma designs.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  /** Core brand palette */
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  secondary: '#E91E8E',
  secondaryLight: '#FF6EC7',

  accent: '#FFB800',
  accentLight: '#FFCA28',
  accentPale: '#FFE082',

  /** Gradients (used with LinearGradient) */
  gradients: {
    splash: ['#FF00FF', '#8B5CF6', '#E88D67', '#FFB800'],
    primary: ['#8B5CF6', '#E91E8E'],
    home: ['#8B5CF6', '#E91E8E', '#FF69B4'],
    result: ['#8B5CF6', '#E91E8E', '#FFB800'],
    reward: ['#8B5CF6', '#E91E8E'],
    profile: ['#8B5CF6', '#E91E8E'],
  },

  /** Backgrounds */
  cream: '#FFF8E7',
  creamDark: '#FFF3D0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  /** Text */
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textOnDark: '#FFFFFF',
  textOnCream: '#1A1A2E',
  textLink: '#E91E8E',

  /** Input / borders */
  inputBorder: '#FFD54F',
  inputBorderFocus: '#FFB800',
  inputBackground: '#FFFFFF',

  /** Status */
  success: '#4CAF50',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#FFB800',

  /** Tab bar */
  tabActive: '#E91E8E',
  tabInactive: '#9CA3AF',

  /** Misc */
  locked: '#D1D5DB',
  lockedBg: '#E5E7EB',
  checkmark: '#E91E8E',
  overlay: 'rgba(0, 0, 0, 0.5)',

  /** Legacy compat */
  light: {
    text: '#1A1A2E',
    background: '#FFF8E7',
    backgroundElement: '#FFF3D0',
    backgroundSelected: '#FFE082',
    textSecondary: '#6B7280',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A2E',
    backgroundElement: '#2D2D44',
    backgroundSelected: '#3D3D5C',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

/**
 * Cross-platform shadow presets for consistent depth layering.
 * Use `sm` for cards, `md` for elevated elements, `lg` for modals/FABs.
 */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  /** Colored shadow for accent elements */
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;

/**
 * Centralized spring & timing configs for consistent motion design.
 */
export const AnimationPresets = {
  /** Gentle spring for most UI transitions */
  spring: {
    damping: 18,
    stiffness: 140,
    mass: 0.8,
  },
  /** Snappy spring for button presses and quick actions */
  springSnappy: {
    damping: 22,
    stiffness: 300,
    mass: 0.6,
  },
  /** Bouncy spring for playful elements (mascot, rewards) */
  springBouncy: {
    damping: 12,
    stiffness: 120,
    mass: 0.7,
  },
  /** Tab icon spring */
  springTab: {
    damping: 14,
    stiffness: 180,
    mass: 0.6,
  },
  /** Duration presets in ms */
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  /** Stagger delay between list items */
  staggerDelay: 60,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
