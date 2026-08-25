import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { AchievementResponse } from "@/types/api";

export const achievementsApi = {
  /**
   * Danh sách achievement đang active kèm trạng thái unlock/progress của user.
   * Achievement secret chưa unlock đã bị BE ẩn khỏi danh sách.
   */
  getMyAchievements: async (): Promise<AchievementResponse[]> => {
    return apiClient.get<AchievementResponse[]>(
      API_ENDPOINTS.ACHIEVEMENTS.GET_ALL,
    );
  },
};
