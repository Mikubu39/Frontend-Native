import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  AlphabetGroup,
  AlphabetPracticeStartResponse,
  AlphabetPracticeSubmitRequest,
  AlphabetPracticeSubmitResponse,
  AlphabetType,
  CreateAlphabetRequest,
} from "@/types/alphabet";

export const alphabetApi = {
  /**
   * Lấy ma trận bảng chữ cái kèm tiến độ (masteryLevel) của người dùng.
   */
  getAlphabets: async (type: AlphabetType): Promise<AlphabetGroup[]> => {
    return apiClient.get<AlphabetGroup[]>(
      API_ENDPOINTS.ALPHABETS.GET_ALL(type),
    );
  },

  /**
   * Bắt đầu một lượt luyện tập. Backend tự bốc đề theo thuật toán spaced repetition.
   */
  startPractice: async (): Promise<AlphabetPracticeStartResponse> => {
    return apiClient.post<AlphabetPracticeStartResponse>(
      API_ENDPOINTS.ALPHABETS.PRACTICE_START,
      {},
    );
  },

  /**
   * Nộp kết quả. Chỉ gửi kết quả của LẦN LÀM ĐẦU TIÊN cho mỗi chữ cái.
   */
  submitPractice: async (
    data: AlphabetPracticeSubmitRequest,
  ): Promise<AlphabetPracticeSubmitResponse> => {
    return apiClient.post<AlphabetPracticeSubmitResponse>(
      API_ENDPOINTS.ALPHABETS.PRACTICE_SUBMIT,
      data,
    );
  },
};

/**
 * Admin-only endpoints. Chưa có màn hình admin trong app, giữ ở đây để dùng lại
 * khi cần seed dữ liệu hoặc build tool nội bộ.
 */
export const alphabetAdminApi = {
  create: async (data: CreateAlphabetRequest): Promise<void> => {
    return apiClient.post<void>(API_ENDPOINTS.ALPHABETS.ADMIN_CREATE, data);
  },

  bulkCreate: async (data: CreateAlphabetRequest[]): Promise<void> => {
    return apiClient.post<void>(
      API_ENDPOINTS.ALPHABETS.ADMIN_BULK_CREATE,
      data,
    );
  },
};
