export interface EnergyResponse {
  currentEnergy: number;
  maxEnergy: number;
  lastRecoveryDate: string | null;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  streakFreezeCount: number;
}

export type QuestType = 'COMPLETE_LESSONS' | 'CORRECT_ANSWERS' | 'PERFECT_LESSON';

export interface Quest {
  questId: number;
  title: string;
  questType: QuestType;
  currentProgress: number;
  targetValue: number;
  completed: boolean;
}

export interface ChestStatus {
  available: boolean;
  alreadyOpenedToday: boolean;
  questsCompleted: number;
  questsRequired: number;
}

export interface OpenChestResponse {
  coinsRewarded: number;
  currentCoins: number;
}
