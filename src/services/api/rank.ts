import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { RankResponse, LeaderboardResponse } from "@/types/api";

export const rankApi = {
  /**
   * Lấy danh sách các hạng trong hệ thống
   */
  getRanks: async (): Promise<RankResponse[]> => {
    return apiClient.get<RankResponse[]>(API_ENDPOINTS.RANK.GET_ALL);
  },

  /**
   * Lấy bảng xếp hạng theo hạng. Nếu không truyền rankId, sẽ lấy hạng hiện tại của người dùng.
   */
  getLeaderboard: async (rankId?: number): Promise<LeaderboardResponse> => {
    return apiClient.get<LeaderboardResponse>(
      API_ENDPOINTS.RANK.LEADERBOARD(rankId),
    );
  },
};
