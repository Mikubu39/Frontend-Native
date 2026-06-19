/**
 * Shared constants for the lesson path layout.
 * Colors extracted from the app's actual design (cream/yellow theme).
 */

/** Page background — cream/pale yellow */
export const PAGE_BG = '#FFF8E1';

/** Card border — yellow/gold */
export const CARD_BORDER = '#FFD54F';

/** Card background — white */
export const CARD_BG = '#FFFFFF';

/** Completed circle — hot pink/magenta with white checkmark */
export const COMPLETED_PINK = '#E91E8C';

/** Locked/incomplete circle — light gray */
export const LOCKED_GRAY = '#D5D5D5';

/** Current lesson — same pink but with pulsing effect */
export const CURRENT_PINK = '#E91E8C';

/** Active tab underline — yellow */
export const TAB_ACTIVE = '#FFD54F';

/** Text colors */
export const TEXT_PRIMARY = '#1A1A1A';
export const TEXT_SECONDARY = '#888888';

/**
 * S-Curve horizontal offsets from center.
 * Duolingo arranges nodes in a winding S-pattern.
 * Positive = right, negative = left.
 */
export const PATH_OFFSETS = [0, -35, -50, -35, 0, 35, 50, 35];

export function getPathOffset(index: number): number {
  return PATH_OFFSETS[index % PATH_OFFSETS.length]!;
}
