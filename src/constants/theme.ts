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
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
