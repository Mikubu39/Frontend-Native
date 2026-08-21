import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  energyApi,
  streakApi,
  questApi,
  chestApi,
  userService,
} from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { Quest, ChestStatus, OpenChestResponse } from "@/types";

interface GamificationState {
  energy: number;
  maxEnergy: number;
  exp: number;
  streak: number;
  coins: number;
  quests: Quest[];
  chestStatus: ChestStatus | null;
  lastRecoveryDate: string | null;
  streakFreezeCount: number;
  rankId: number;
  rankName: string;
  activeEffects: { effectType: string; expiresAt: string }[];
}

interface GamificationContextType extends GamificationState {
  setEnergy: (energy: number) => void;
  deductEnergy: (amount: number) => void;
  addExp: (amount: number) => void;
  setGamificationState: (state: Partial<GamificationState>) => void;
  fetchGamificationData: () => Promise<void>;
  refillEnergy: () => Promise<void>;
  fetchQuests: () => Promise<void>;
  fetchChestStatus: () => Promise<void>;
  /** Resolves with the payout so the caller can show what was won. */
  openChest: () => Promise<OpenChestResponse>;
  buyStreakFreeze: () => Promise<void>;
  watchAdToRefill: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined,
);

export function GamificationProvider({ children }: { children: ReactNode }) {
  // Temporary initial states until backend provides them globally
  const [state, setState] = useState<GamificationState>({
    energy: 25,
    maxEnergy: 25,
    exp: 0,
    streak: 0,
    coins: 0,
    quests: [],
    chestStatus: null,
    lastRecoveryDate: null,
    streakFreezeCount: 0,
    rankId: 1,
    rankName: "Đồng",
    activeEffects: [],
  });

  const setEnergy = (energy: number) => {
    setState((prev) => ({ ...prev, energy }));
  };

  const deductEnergy = (amount: number) => {
    setState((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount),
    }));
  };

  const addExp = (amount: number) => {
    setState((prev) => ({
      ...prev,
      exp: prev.exp + amount,
    }));
  };

  const setGamificationState = (newState: Partial<GamificationState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const fetchQuests = useCallback(async () => {
    try {
      const quests = await questApi.getDailyQuests();
      setState((prev) => ({ ...prev, quests }));
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    }
  }, []);

  const fetchChestStatus = useCallback(async () => {
    try {
      const chestStatus = await chestApi.getChestStatus();
      setState((prev) => ({ ...prev, chestStatus }));
    } catch (error) {
      console.error("Failed to fetch chest status:", error);
    }
  }, []);

  const fetchGamificationData = useCallback(async () => {
    try {
      // Gọi song song getMe() để lấy thông tin tổng hợp và getEnergy() để lấy lastRecoveryDate
      const [meRes, energyRes] = await Promise.all([
        userService.getMe(),
        energyApi.getEnergy(),
      ]);

      setState((prev) => ({
        ...prev,
        energy: meRes.currentEnergy,
        maxEnergy: meRes.maxEnergy,
        streak: meRes.currentStreak,
        exp: meRes.exp,
        coins: meRes.coins,
        streakFreezeCount: meRes.streakFreezeCount,
        rankId: meRes.rankId,
        rankName: meRes.rankName,
        lastRecoveryDate: energyRes.lastRecoveryDate,
        activeEffects: meRes.activeEffects || [],
      }));

      await fetchQuests();
      await fetchChestStatus();
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    }
  }, [fetchQuests, fetchChestStatus]);

  const refillEnergy = useCallback(async () => {
    try {
      const res = await energyApi.refill();
      setState((prev) => ({
        ...prev,
        energy: res.currentEnergy,
        maxEnergy: res.maxEnergy,
      }));
    } catch (error) {
      console.error("Failed to refill energy:", error);
      throw error;
    }
  }, []);

  const watchAdToRefill = useCallback(async () => {
    try {
      const res = await energyApi.watchAdToRefill();
      setState((prev) => ({
        ...prev,
        energy: res.currentEnergy,
        maxEnergy: res.maxEnergy,
      }));
    } catch (error) {
      console.error("Failed to watch ad for energy:", error);
      throw error;
    }
  }, []);

  const openChest = useCallback(async () => {
    try {
      const res = await chestApi.openChest();
      setState((prev) => ({ ...prev, coins: res.currentCoins }));
      await fetchChestStatus();
      return res;
    } catch (error) {
      console.error("Failed to open chest:", error);
      throw error;
    }
  }, [fetchChestStatus]);

  const buyStreakFreeze = useCallback(async () => {
    try {
      const res = await streakApi.buyStreakFreeze();
      setState((prev) => ({
        ...prev,
        streak: res.currentStreak,
        streakFreezeCount: res.streakFreezeCount,
        coins: Math.max(0, prev.coins - 200),
      }));
    } catch (error) {
      console.error("Failed to buy streak freeze:", error);
      throw error;
    }
  }, []);

  const { isAuthenticated } = useAuth();

  // Cập nhật khi mở app & Lắng nghe AppState
  useEffect(() => {
    if (isAuthenticated) {
      fetchGamificationData();
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active" && isAuthenticated) {
          fetchGamificationData();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [fetchGamificationData, isAuthenticated]);

  // Bộ đếm giờ ảo cập nhật năng lượng realtime (Cách 2)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (state.energy < state.maxEnergy && state.lastRecoveryDate) {
      interval = setInterval(() => {
        // Parse date directly to respect local time from BE
        const lastRecovery = new Date(state.lastRecoveryDate!).getTime();
        const now = Date.now();
        const diffMs = now - lastRecovery;
        const ONE_HOUR = 60 * 60 * 1000;

        if (diffMs >= ONE_HOUR) {
          const energyToAdd = Math.floor(diffMs / ONE_HOUR) * 5;
          if (energyToAdd > 0) {
            setState((prev) => {
              const newEnergy = Math.min(
                prev.maxEnergy,
                prev.energy + energyToAdd,
              );
              const newRecoveryDate = new Date(
                lastRecovery + Math.floor(diffMs / ONE_HOUR) * ONE_HOUR,
              ).toISOString();
              return {
                ...prev,
                energy: newEnergy,
                lastRecoveryDate:
                  newEnergy < prev.maxEnergy ? newRecoveryDate : null,
              };
            });
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.energy, state.maxEnergy, state.lastRecoveryDate]);

  return (
    <GamificationContext.Provider
      value={{
        ...state,
        setEnergy,
        deductEnergy,
        addExp,
        setGamificationState,
        fetchGamificationData,
        refillEnergy,
        fetchQuests,
        fetchChestStatus,
        openChest,
        buyStreakFreeze,
        watchAdToRefill,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error(
      "useGamification must be used within a GamificationProvider",
    );
  }
  return context;
}
