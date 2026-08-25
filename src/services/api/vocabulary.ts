import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  VocabularyItem,
  VocabularyListResponse,
  VocabularyReviewResult,
} from "@/types";

export const vocabularyApi = {
  /** Các từ đã tới hạn ôn, quá hạn lâu nhất trước. */
  getDue: async (limit = 20): Promise<VocabularyListResponse> => {
    return apiClient.get<VocabularyListResponse>(API_ENDPOINTS.VOCABULARY.DUE, {
      limit,
    });
  },

  /** Sổ tay từ đã học, mới nhất trước. */
  getLearned: async (limit = 50): Promise<VocabularyListResponse> => {
    return apiClient.get<VocabularyListResponse>(
      API_ENDPOINTS.VOCABULARY.LEARNED,
      { limit },
    );
  },

  /**
   * Nộp kết quả phiên ôn. Server áp SM-2 rồi trả về số từ CÒN LẠI đang tới hạn,
   * để badge cập nhật ngay mà không phải gọi thêm một vòng.
   */
  submitReview: async (
    results: { vocabularyId: number; correct: boolean }[],
  ): Promise<VocabularyReviewResult> => {
    return apiClient.post<VocabularyReviewResult>(
      API_ENDPOINTS.VOCABULARY.REVIEW_SUBMIT,
      { results },
    );
  },

  /**
   * Toàn bộ kho từ — tải MỘT lần rồi cache, để mọi chữ Nhật trên màn hình đều
   * bấm giữ ra nghĩa được chứ không chỉ những từ nằm trong glossary của riêng
   * câu hỏi đang mở.
   */
  getGlossary: async (): Promise<VocabularyItem[]> => {
    return apiClient.get<VocabularyItem[]>(API_ENDPOINTS.VOCABULARY.GLOSSARY);
  },
};
