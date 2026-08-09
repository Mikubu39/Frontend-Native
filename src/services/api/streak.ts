import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { StreakResponse } from '@/types';

export const streakApi = {
  getStreak: async (): Promise<StreakResponse> => {
    return apiClient.get<StreakResponse>(API_ENDPOINTS.STREAK.GET_INFO);
  },
  buyStreakFreeze: async (): Promise<StreakResponse> => {
    return apiClient.post<StreakResponse>(API_ENDPOINTS.STREAK.BUY_FREEZE);
  },
};
