import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { VocabularyListResponse, VocabularyReviewResult } from "@/types";

export const pronunciationApi = {
  /** Lấy danh sách các câu luyện phát âm đã tới hạn ôn hôm nay. */
  getDue: async (limit = 20): Promise<VocabularyListResponse> => {
    return apiClient.get<VocabularyListResponse>(
      API_ENDPOINTS.PRONUNCIATION.DUE,
      {
        limit,
      },
    );
  },

  /** Nộp kết quả chấm điểm phát âm (Đúng/Sai) để Server cập nhật SM-2. */
  submitReview: async (
    results: { vocabularyId: number; correct: boolean }[],
  ): Promise<VocabularyReviewResult> => {
    return apiClient.post<VocabularyReviewResult>(
      API_ENDPOINTS.PRONUNCIATION.REVIEW_SUBMIT,
      { results },
    );
  },
};
