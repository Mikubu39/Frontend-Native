/**
 * useQuests - Loads the day's quests and chest state, keeps them fresh while
 * the tab is focused, and exposes the open action along with the coins it
 * paid out. Keeps the board screen free of data plumbing.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useGamification } from "@/contexts/gamification-context";
import { buildQuestNodes, nextResetAt, summarizeBoard } from "@/utils/quests";

export function useQuests() {
  const { quests, chestStatus, fetchQuests, fetchChestStatus, openChest } =
    useGamification();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestError, setChestError] = useState<string | null>(null);
  /** Set once the chest pays out, so the terminus can show the reward. */
  const [rewardCoins, setRewardCoins] = useState<number | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    try {
      await Promise.all([fetchQuests(), fetchChestStatus()]);
    } finally {
      hasLoaded.current = true;
      setIsLoading(false);
    }
  }, [fetchQuests, fetchChestStatus]);

  /** Progress is earned on other screens, so re-read it on every focus. */
  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded.current) setIsLoading(true);
      load();
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const claimChest = useCallback(async () => {
    setIsOpeningChest(true);
    setChestError(null);
    try {
      const res = await openChest();
      setRewardCoins(res.coinsRewarded);
    } catch (error: any) {
      setChestError(
        error?.response?.data?.message ?? "Không mở được rương. Thử lại sau.",
      );
    } finally {
      setIsOpeningChest(false);
    }
  }, [openChest]);

  const nodes = useMemo(() => buildQuestNodes(quests), [quests]);
  const summary = useMemo(
    () => summarizeBoard(quests, chestStatus),
    [quests, chestStatus],
  );

  // Chỉ tính lại mốc reset nửa đêm 1 lần hoặc khi đã trôi qua mốc cũ
  const resetAt = useMemo(() => nextResetAt(), []);

  return useMemo(
    () => ({
      nodes,
      summary,
      resetAt,
      isLoading: isLoading && quests.length === 0,
      isRefreshing,
      refresh,
      claimChest,
      isOpeningChest,
      chestError,
      rewardCoins,
    }),
    [
      nodes,
      summary,
      resetAt,
      isLoading,
      quests.length,
      isRefreshing,
      refresh,
      claimChest,
      isOpeningChest,
      chestError,
      rewardCoins,
    ],
  );
}
