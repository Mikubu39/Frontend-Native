import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { Quest } from "@/types";

export const questApi = {
  getDailyQuests: async (): Promise<Quest[]> => {
    return apiClient.get<Quest[]>(API_ENDPOINTS.QUESTS.GET_ALL);
  },
};
