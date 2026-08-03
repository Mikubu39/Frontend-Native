import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { StreakResponse } from '@/types';

export const streakApi = {
  getStreak: async (): Promise<StreakResponse> => {
    return apiClient.get<StreakResponse>(API_ENDPOINTS.STREAK.GET_INFO);
  },
};
