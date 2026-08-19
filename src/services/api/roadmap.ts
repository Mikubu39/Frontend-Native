import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { RoadmapTopicResponse } from "@/types";

export const roadmapApi = {
  /**
   * Fetch user roadmap topics and lessons.
   */
  getRoadmap: async (): Promise<RoadmapTopicResponse[]> => {
    return apiClient.get<RoadmapTopicResponse[]>(
      API_ENDPOINTS.ROADMAP.GET_TOPICS,
    );
  },
};
