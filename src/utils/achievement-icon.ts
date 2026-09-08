/**
 * Maps an achievement's stable `code` (see BE migration
 * V39__streak_calendar_and_achievements.sql) to a real vector icon + tint,
 * replacing the raw keyboard-emoji string the backend sends in `icon`.
 * Unknown/future codes fall back to a generic ribbon rather than guessing.
 */

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

interface AchievementIconStyle {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ACHIEVEMENT_ICONS: Record<string, AchievementIconStyle> = {
  FIRST_LESSON: { icon: "ribbon", color: Colors.accent },
  STREAK_3: { icon: "flame", color: Colors.streakActive },
  STREAK_7: { icon: "flame", color: Colors.streakActive },
  STREAK_30: { icon: "flame", color: Colors.streakActive },
  STREAK_100: { icon: "flame", color: Colors.streakActive },
  STREAK_365: { icon: "flame", color: Colors.streakActive },
  WEEK_WARRIOR: { icon: "shield", color: Colors.primary },
  PERFECT_10: { icon: "star", color: Colors.accent },
  PERFECT_50: { icon: "star", color: Colors.accent },
  TOPIC_MASTER: { icon: "book", color: Colors.primary },
  TOPIC_EXPERT: { icon: "library", color: Colors.primary },
  COIN_MASTER: { icon: "cash", color: Colors.accent },
  STREAK_FREEZE_USER: { icon: "snow", color: Colors.streakFrozen },
  EARLY_BIRD: { icon: "sunny", color: Colors.accent },
  NIGHT_OWL: { icon: "moon", color: Colors.primary },
  COMEBACK: { icon: "refresh", color: Colors.secondary },
};

const FALLBACK: AchievementIconStyle = { icon: "ribbon", color: Colors.accent };

export function getAchievementIconStyle(code: string): AchievementIconStyle {
  return ACHIEVEMENT_ICONS[code] ?? FALLBACK;
}
