/**
 * Quest board design tokens — "the day's track".
 *
 * The shop is a place you walk into. The quest board is a route you walk
 * along: one rail runs down the screen, every quest is a station on it, and
 * the rail terminates at the chest. That is the whole idea — the page should
 * read as a single journey with a payoff at the end, not as three unrelated
 * cards stacked on a background.
 *
 * It shares the shop's *craft* (beveled plates, a stamped seal, coin gold)
 * but none of its surface, so the two tabs stay recognisably different rooms.
 */

import type { QuestType } from "@/types/gamification";
import type { QuestMeta } from "@/types/quest";
import { ShopPalette } from "./shop";

export const QuestPalette = {
  /** The rail behind you — ground the day has already covered. */
  trail: "#7C5CFF",
  trailDeep: "#4A2CB5",
  trailWash: "rgba(124, 92, 255, 0.13)",

  /** A stamped mark. Same vocabulary as the shop's limited-time seal. */
  seal: "#D7382E",
  sealDeep: "#8E1E17",
  sealWash: "rgba(215, 56, 46, 0.09)",

  /** The reward at the end of the rail — deliberately the shop's coin gold. */
  gold: ShopPalette.goldLeaf,
  goldDeep: ShopPalette.goldDeep,
  goldWash: "rgba(245, 196, 81, 0.14)",

  /** Rail ahead of you: nothing has happened here yet. */
  dormant: "#9891B4",
} as const;

/**
 * Rail geometry, shared by the stations, the terminus and the skeleton so
 * the line never breaks between them.
 */
export const RailMetrics = {
  /** Width of the left gutter the rail runs down. */
  gutter: 32,
  lineWidth: 3,
  /** Distance from the top of a row to the centre of its node. */
  nodeOffset: 27,
  nodeSize: 18,
  nodeSizePending: 13,
} as const;

export const QUEST_META: Record<QuestType, QuestMeta> = {
  COMPLETE_LESSONS: { icon: "book", label: "Bài học", unit: "bài học" },
  CORRECT_ANSWERS: {
    icon: "checkmark-done",
    label: "Trả lời",
    unit: "câu đúng",
  },
  PERFECT_LESSON: {
    icon: "sparkles",
    label: "Hoàn hảo",
    unit: "bài không sai",
  },
};

/**
 * Gold leaf carries an earned plate beautifully as a fill, but as *text* on a
 * light card it lands at about 1.7:1 — unreadable. Ink it darker there.
 */
export const goldInk = (isDark: boolean): string =>
  isDark ? QuestPalette.gold : QuestPalette.goldDeep;

/** Used when the backend sends a quest type the app has not been taught. */
export const FALLBACK_QUEST_META: QuestMeta = {
  icon: "flag",
  label: "Nhiệm vụ",
  unit: "lượt",
};
