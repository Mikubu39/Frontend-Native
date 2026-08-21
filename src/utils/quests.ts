/**
 * Pure helpers for the quest board: progress, station ordering, the summary
 * line the header reads out, and the countdown to the next board.
 */

import { FALLBACK_QUEST_META, QUEST_META } from "@/constants/quests";
import type { ChestStatus, Quest } from "@/types/gamification";
import type {
  QuestBoardSummary,
  QuestMeta,
  QuestNode,
  QuestState,
} from "@/types/quest";

const STATE_ORDER: Record<QuestState, number> = {
  done: 0,
  active: 1,
  pending: 2,
};

/**
 * The backend flips `completed`, but a quest whose progress has already met
 * its target is done whether or not that flag has caught up yet.
 */
export function isQuestDone(quest: Quest): boolean {
  return quest.completed || quest.currentProgress >= quest.targetValue;
}

export function questProgressPct(quest: Quest): number {
  if (isQuestDone(quest)) return 100;
  if (quest.targetValue <= 0) return 0;

  const ratio = quest.currentProgress / quest.targetValue;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function questMeta(quest: Quest): QuestMeta {
  return QUEST_META[quest.questType] ?? FALLBACK_QUEST_META;
}

/** The line under the title: what is actually left to do. */
export function describeRemaining(quest: Quest): string {
  if (isQuestDone(quest)) return "Đã xong";

  const left = Math.max(0, quest.targetValue - quest.currentProgress);
  return `Còn ${left} ${questMeta(quest).unit}`;
}

function questState(quest: Quest): QuestState {
  if (isQuestDone(quest)) return "done";
  return quest.currentProgress > 0 ? "active" : "pending";
}

/**
 * Stations in the order the rail draws them: finished, then started, then
 * untouched. The rail only reads as progress if what you have already done
 * sits behind you — the API returns quests in catalogue order, which does
 * not.
 */
export function buildQuestNodes(quests: Quest[]): QuestNode[] {
  return quests
    .map((quest) => ({
      quest,
      state: questState(quest),
      pct: questProgressPct(quest),
      meta: questMeta(quest),
      caption: describeRemaining(quest),
    }))
    .sort(
      (a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state] || b.pct - a.pct,
    );
}

export function summarizeBoard(
  quests: Quest[],
  chest: ChestStatus | null,
): QuestBoardSummary {
  const total = quests.length;
  /**
   * Counted from the quests on screen so the headline can never disagree
   * with the seals the player can see; the chest's own tally is the
   * fallback for when the board itself failed to load.
   */
  const completed =
    total > 0
      ? quests.filter(isQuestDone).length
      : (chest?.questsCompleted ?? 0);

  const required = chest?.questsRequired ?? Math.max(total, 1);
  const chestOpened = chest?.alreadyOpenedToday ?? false;
  const chestReady = (chest?.available ?? false) && !chestOpened;

  return {
    total,
    completed,
    required,
    remainingForChest: Math.max(0, required - completed),
    chestReady,
    chestOpened,
    railPct:
      required > 0
        ? Math.min(100, Math.round((completed / required) * 100))
        : 0,
  };
}

/** The headline: the player's actual state, not the word "Nhiệm vụ" again. */
export function boardHeadline(summary: QuestBoardSummary): string {
  if (summary.total === 0) return "Bảng hôm nay còn trống";
  if (summary.completed === 0) return `Chưa xong nhiệm vụ nào`;
  if (summary.completed >= summary.total)
    return `Đã xong cả ${summary.total} nhiệm vụ`;
  return `Xong ${summary.completed}/${summary.total} nhiệm vụ`;
}

/** The line under it: what the state means for the chest. */
export function boardSubline(summary: QuestBoardSummary): string {
  if (summary.total === 0) return "Nhiệm vụ mới lên bảng vào nửa đêm.";
  if (summary.chestOpened) return "Đã nhận rương hôm nay. Hẹn chặng sau.";
  if (summary.chestReady) return "Rương đang chờ ở cuối chặng.";
  return `Còn ${summary.remainingForChest} nhiệm vụ nữa là mở được rương.`;
}

/**
 * Quests roll over at local midnight, so that is what the header counts down
 * to. The backend does not publish a reset timestamp; if it starts to, pass
 * that through instead of calling this.
 */
export function nextResetAt(from: Date = new Date()): string {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return next.toISOString();
}
