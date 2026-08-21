/**
 * Bảng màu theo mức thông thạo (masteryLevel 0 -> 3).
 * Mức 0: chữ xám, viền nhạt. Mức 1-3: viền vàng/cam sáng dần.
 */

import { Colors } from "@/constants/theme";
import { MAX_MASTERY_LEVEL } from "@/types/alphabet";

export interface MasteryPalette {
  border: string;
  fill: string;
  accent: string;
  label: string;
}

const MASTERY_PALETTES: MasteryPalette[] = [
  {
    border: Colors.lockedBg,
    fill: "transparent",
    accent: Colors.locked,
    label: "Chưa học",
  },
  {
    border: Colors.accentPale,
    fill: "rgba(255, 224, 130, 0.18)",
    accent: Colors.accentPale,
    label: "Mới làm quen",
  },
  {
    border: Colors.accentLight,
    fill: "rgba(255, 202, 40, 0.22)",
    accent: Colors.accentLight,
    label: "Đang nhớ",
  },
  {
    border: Colors.accent,
    fill: "rgba(255, 184, 0, 0.28)",
    accent: Colors.accent,
    label: "Thành thạo",
  },
];

export function clampMasteryLevel(level?: number | null): number {
  if (!Number.isFinite(level ?? NaN)) return 0;
  return Math.min(Math.max(Math.round(level as number), 0), MAX_MASTERY_LEVEL);
}

export function getMasteryPalette(level?: number | null): MasteryPalette {
  return MASTERY_PALETTES[clampMasteryLevel(level)];
}
