import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { StreakResponse } from "@/types";

export const streakApi = {
  getStreak: async (): Promise<StreakResponse> => {
    return apiClient.get<StreakResponse>(API_ENDPOINTS.STREAK.GET_INFO);
  },
  buyStreakFreeze: async (): Promise<StreakResponse> => {
    return apiClient.post<StreakResponse>(API_ENDPOINTS.STREAK.BUY_FREEZE);
  },
  /** Danh sách ngày (ISO "yyyy-MM-dd") user đã học trong N ngày gần nhất, dùng vẽ heat map. */
  getStreakCalendar: async (days = 30): Promise<string[]> => {
    return apiClient.get<string[]>(API_ENDPOINTS.STREAK.CALENDAR, { days });
  },
};
