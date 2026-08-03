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
