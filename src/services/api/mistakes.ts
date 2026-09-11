import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  MistakeSummaryResponse,
  MistakeStartResponse,
  MistakeSubmitResponse,
} from "@/types/api";

export const mistakesApi = {
  getSummary: async (): Promise<MistakeSummaryResponse> => {
    return apiClient.get<MistakeSummaryResponse>(
      API_ENDPOINTS.MISTAKES.SUMMARY,
    );
  },

  startReview: async (): Promise<MistakeStartResponse> => {
    return apiClient.post<MistakeStartResponse>(API_ENDPOINTS.MISTAKES.START);
  },

  submitReview: async (data: {
    answers: { questionId: number; selectedOptionId?: number; isCorrect?: boolean }[];
  }): Promise<MistakeSubmitResponse> => {
    return apiClient.post<MistakeSubmitResponse>(
      API_ENDPOINTS.MISTAKES.SUBMIT,
      data,
    );
  },
};
