import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { PlacementAnswerRequest, PlacementRoundResponse } from "@/types";

export const placementApi = {
  /**
   * Bắt đầu (hoặc resume nếu đang có 1 lượt dang dở) bài kiểm tra đầu vào.
   * Trả về câu hỏi của vòng đầu tiên — mỗi vòng dò 1 topic bằng vài câu hỏi
   * rút mẫu từ ngân hàng câu hỏi "Thi vượt" (JUMP_TEST) đã có sẵn của topic đó.
   */
  start: async (): Promise<PlacementRoundResponse> => {
    return apiClient.post<PlacementRoundResponse>(
      API_ENDPOINTS.PLACEMENT.START,
    );
  },

  /**
   * Nộp câu trả lời của vòng hiện tại. Trả về vòng tiếp theo (finished=false)
   * hoặc kết quả cuối cùng (finished=true, kèm topic đã tự động hoàn thành).
   */
  answer: async (
    attemptId: number,
    data: PlacementAnswerRequest,
  ): Promise<PlacementRoundResponse> => {
    return apiClient.post<PlacementRoundResponse>(
      API_ENDPOINTS.PLACEMENT.ANSWER(attemptId),
      data,
    );
  },
};
