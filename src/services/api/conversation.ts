/**
 * Client cho dịch vụ AI hội thoại.
 *
 * Dùng axios instance RIÊNG chứ không dùng `apiClient` chung, vì:
 *   - base URL khác (dịch vụ Python, không phải backend Java),
 *   - không cần gắn JWT (dịch vụ phi trạng thái, không có khái niệm người dùng),
 *   - cần timeout NGẮN hơn: hosting free hay ngủ đông, và người dùng đang chờ
 *     giữa cuộc hội thoại nên thà báo lỗi sớm còn hơn treo im lặng.
 */

import axios, { AxiosInstance } from "axios";
import { config } from "@/config";
import type {
  ConversationRespondRequest,
  ConversationRespondResponse,
  ConversationScenario,
  ConversationStartResponse,
} from "@/types/conversation";

/** Hosting miễn phí có thể mất tới ~30 giây để "thức dậy" từ trạng thái ngủ. */
const COLD_START_TIMEOUT_MS = 30000;

const client: AxiosInstance = axios.create({
  baseURL: config.aiBaseUrl,
  timeout: COLD_START_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Thông điệp phải dùng được thẳng trên UI: người học đang ở giữa cuộc hội
    // thoại, họ cần biết phải làm gì tiếp chứ không cần mã lỗi HTTP.
    const message =
      error.code === "ECONNABORTED"
        ? "Máy chủ AI phản hồi hơi lâu. Bạn thử lại sau một chút nhé."
        : (error.response?.data?.detail ??
          "Không kết nối được tới máy chủ AI. Kiểm tra kết nối mạng nhé.");
    return Promise.reject(new Error(message));
  },
);

export const conversationApi = {
  /** Danh sách tình huống luyện tập. */
  getScenarios: (): Promise<ConversationScenario[]> =>
    client
      .get<ConversationScenario[]>("/api/v1/conversation/scenarios")
      .then((r) => r.data),

  /** Mở đầu một kịch bản; trả về câu chào của AI và các gợi ý đầu tiên. */
  start: (scenarioId: string): Promise<ConversationStartResponse> =>
    client
      .post<ConversationStartResponse>("/api/v1/conversation/start", {
        scenarioId,
      })
      .then((r) => r.data),

  /** Gửi một lượt nói của người học và nhận phản hồi của AI. */
  respond: (
    request: ConversationRespondRequest,
  ): Promise<ConversationRespondResponse> =>
    client
      .post<ConversationRespondResponse>(
        "/api/v1/conversation/respond",
        request,
      )
      .then((r) => r.data),
};
