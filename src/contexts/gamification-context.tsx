import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  energyApi,
  streakApi,
  questApi,
  chestApi,
  userService,
  achievementsApi,
} from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import {
  Quest,
  ChestStatus,
  OpenChestResponse,
  AchievementResponse,
  StreakStatus,
} from "@/types";
import { evaluateStreak } from "@/utils";

interface GamificationState {
  energy: number;
  maxEnergy: number;
  exp: number;
  streak: number;
  streakStatus: StreakStatus;
  studiedToday: boolean;
  frozenToday: boolean;
  lastStreakDate: string | null;
  coins: number;
  quests: Quest[];
  chestStatus: ChestStatus | null;
  lastRecoveryDate: string | null;
  streakFreezeCount: number;
  rankId: number;
  rankName: string;
  activeEffects: { effectType: string; expiresAt: string }[];
  achievements: AchievementResponse[];
  newlyUnlockedAchievements: AchievementResponse[];
  studyDates: string[];
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
  clearNewlyUnlockedAchievements: () => void;
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
    streakStatus: "UNLIT",
    studiedToday: false,
    frozenToday: false,
    lastStreakDate: null,
    coins: 0,
    quests: [],
    chestStatus: null,
    lastRecoveryDate: null,
    streakFreezeCount: 0,
    rankId: 1,
    rankName: "Đồng",
    activeEffects: [],
    achievements: [],
    newlyUnlockedAchievements: [],
    studyDates: [],
  });

  const setEnergy = useCallback((energy: number) => {
    setState((prev) => (prev.energy === energy ? prev : { ...prev, energy }));
  }, []);

  const deductEnergy = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount),
    }));
  }, []);

  const addExp = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      exp: prev.exp + amount,
    }));
  }, []);

  const setGamificationState = useCallback(
    (newState: Partial<GamificationState>) => {
      setState((prev) => ({ ...prev, ...newState }));
    },
    [],
  );

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
      // Gọi song song tất cả các nguồn dữ liệu và gộp thành 1 lần setState duy nhất
      // để triệt tiêu tình trạng cascade re-renders trên toàn bộ ứng dụng.
      const [
        meRes,
        energyRes,
        questsRes,
        chestRes,
        achievementsRes,
        streakRes,
        streakCalendarRes,
      ] = await Promise.all([
        userService.getMe().catch(() => null),
        energyApi.getEnergy().catch(() => null),
        questApi.getDailyQuests().catch(() => [] as Quest[]),
        chestApi.getChestStatus().catch(() => null),
        achievementsApi
          .getMyAchievements()
          .catch(() => [] as AchievementResponse[]),
        streakApi.getStreak().catch(() => null),
        streakApi.getStreakCalendar(30).catch(() => [] as string[]),
      ]);

      setState((prev) => {
        const oldAchievements = prev.achievements;
        const newAchievements = achievementsRes || prev.achievements;

        let newlyUnlocked: AchievementResponse[] = [];

        // Only compare if we already had achievements loaded before
        if (
          oldAchievements.length > 0 &&
          newAchievements.length > 0 &&
          achievementsRes
        ) {
          const oldUnlockedIds = new Set(
            oldAchievements
              .filter((a) => a.unlocked)
              .map((a) => a.achievementId),
          );
          newlyUnlocked = newAchievements.filter(
            (a) => a.unlocked && !oldUnlockedIds.has(a.achievementId),
          );
        }

        const rawStreak =
          streakRes?.currentStreak ?? meRes?.currentStreak ?? prev.streak ?? 0;
        const lastStreakDate =
          streakRes?.lastStreakDate ??
          meRes?.lastStreakDate ??
          prev.lastStreakDate ??
          null;
        const freezeCount =
          streakRes?.streakFreezeCount ??
          meRes?.streakFreezeCount ??
          prev.streakFreezeCount ??
          0;

        const streakEval = evaluateStreak(
          rawStreak,
          lastStreakDate,
          freezeCount,
        );

        return {
          ...prev,
          ...(meRes && {
            energy: meRes.currentEnergy,
            maxEnergy: meRes.maxEnergy,
            exp: meRes.exp,
            coins: meRes.coins,
            rankId: meRes.rankId,
            rankName: meRes.rankName,
            activeEffects: meRes.activeEffects || [],
          }),
          ...(energyRes && {
            lastRecoveryDate: energyRes.lastRecoveryDate,
          }),
          streak: streakEval.streak,
          streakStatus: streakEval.streakStatus,
          studiedToday: streakEval.studiedToday,
          frozenToday: streakEval.frozenToday,
          lastStreakDate: lastStreakDate,
          streakFreezeCount: freezeCount,
          studyDates: streakCalendarRes ?? prev.studyDates,
          quests: questsRes ?? prev.quests,
          chestStatus: chestRes ?? prev.chestStatus,
          achievements: newAchievements,
          newlyUnlockedAchievements:
            newlyUnlocked.length > 0
              ? [...prev.newlyUnlockedAchievements, ...newlyUnlocked]
              : prev.newlyUnlockedAchievements,
        };
      });
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    }
  }, []);

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
      const chestStatus = await chestApi.getChestStatus().catch(() => null);
      setState((prev) => ({
        ...prev,
        coins: res.currentCoins,
        ...(chestStatus && { chestStatus }),
      }));
      return res;
    } catch (error) {
      console.error("Failed to open chest:", error);
      throw error;
    }
  }, []);

  const buyStreakFreeze = useCallback(async () => {
    try {
      const res = await streakApi.buyStreakFreeze();
      setState((prev) => {
        const streakEval = evaluateStreak(
          res.currentStreak,
          res.lastStreakDate ?? prev.lastStreakDate,
          res.streakFreezeCount,
        );
        return {
          ...prev,
          streak: streakEval.streak,
          streakStatus: streakEval.streakStatus,
          studiedToday: streakEval.studiedToday,
          frozenToday: streakEval.frozenToday,
          lastStreakDate: res.lastStreakDate ?? prev.lastStreakDate,
          streakFreezeCount: res.streakFreezeCount,
          coins: Math.max(0, prev.coins - 200),
        };
      });
    } catch (error) {
      console.error("Failed to buy streak freeze:", error);
      throw error;
    }
  }, []);

  const clearNewlyUnlockedAchievements = useCallback(() => {
    setState((prev) => ({ ...prev, newlyUnlockedAchievements: [] }));
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

  // Đọc giá trị state qua ref để interval không tạo dependency vào state —
  // tránh vòng lặp setState → re-render → dependency thay đổi → interval reset.
  const energyRecoveryRef = useRef({
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    lastRecoveryDate: state.lastRecoveryDate,
  });
  energyRecoveryRef.current = {
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    lastRecoveryDate: state.lastRecoveryDate,
  };

  // Cờ active: interval chỉ cần chạy khi energy chưa đầy.
  // Khi energy đầy (do interval cập nhật), interval tự cancel.
  const needsRecovery =
    state.energy < state.maxEnergy && state.lastRecoveryDate !== null;

  // Bộ đếm giờ ảo cập nhật năng lượng realtime.
  // Dependency array CHỈ là `needsRecovery`: interval khởi động 1 lần khi
  // energy < max, và dừng lại khi energy đã đầy — không reset mỗi giây.
  useEffect(() => {
    if (!needsRecovery) return;

    const interval = setInterval(() => {
      const { lastRecoveryDate, maxEnergy } = energyRecoveryRef.current;
      if (!lastRecoveryDate) {
        clearInterval(interval);
        return;
      }

      const lastRecovery = new Date(lastRecoveryDate).getTime();
      const now = Date.now();
      const diffMs = now - lastRecovery;
      const ONE_HOUR = 60 * 60 * 1000;

      if (diffMs >= ONE_HOUR) {
        const energyToAdd = Math.floor(diffMs / ONE_HOUR) * 5;
        if (energyToAdd > 0) {
          setState((prev) => {
            const newEnergy = Math.min(maxEnergy, prev.energy + energyToAdd);
            const newRecoveryDate = new Date(
              lastRecovery + Math.floor(diffMs / ONE_HOUR) * ONE_HOUR,
            ).toISOString();
            return {
              ...prev,
              energy: newEnergy,
              lastRecoveryDate: newEnergy < maxEnergy ? newRecoveryDate : null,
            };
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [needsRecovery]);

  const value = useMemo<GamificationContextType>(
    () => ({
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
      clearNewlyUnlockedAchievements,
    }),
    [
      state,
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
      clearNewlyUnlockedAchievements,
    ],
  );

  return (
    <GamificationContext.Provider value={value}>
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
