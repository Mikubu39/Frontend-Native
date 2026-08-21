/**
 * Quest board presentation types.
 *
 * The API DTOs live in `gamification.ts`. These are the view-model types the
 * board derives from them: where each quest sits on the day's rail, and the
 * one-line state of the board as a whole.
 */

import type { Quest } from "./gamification";

/** Where a quest sits on the rail: behind you, under you, or ahead. */
export type QuestState = "done" | "active" | "pending";

export interface QuestMeta {
  /** Ionicons glyph for the quest's type. */
  icon: string;
  /** Short name of what the quest measures ("Trả lời"). */
  label: string;
  /** Counting noun for the "Còn N …" line ("câu đúng"). */
  unit: string;
}

/** One station on the rail: the quest plus everything the UI derives. */
export interface QuestNode {
  quest: Quest;
  state: QuestState;
  /** 0–100, clamped. */
  pct: number;
  meta: QuestMeta;
  /** "Còn 8 câu đúng" / "Đã xong" — the line under the title. */
  caption: string;
}

/** The state of the whole board, as the header reads it out. */
export interface QuestBoardSummary {
  total: number;
  completed: number;
  /** Quests the chest asks for. */
  required: number;
  /** Still needed before the chest unlocks. */
  remainingForChest: number;
  chestReady: boolean;
  chestOpened: boolean;
  /** 0–100 — how far the rail has filled. */
  railPct: number;
}
