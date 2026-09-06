/**
 * Client cho dịch vụ AI hội thoại (Gemini qua ai-service).
 *
 * Dùng axios instance RIÊNG chứ không dùng `apiClient` chung, vì:
 *   - base URL khác (dịch vụ Python, không phải backend Java),
 *   - không cần gắn JWT (dịch vụ phi trạng thái, không có khái niệm người dùng),
 *   - cần cấu hình timeout riêng: lời gọi LLM chậm hơn hẳn một API CRUD.
 */

import axios, { AxiosInstance, create } from "axios";
import { config } from "@/config";
import type {
  ConversationRespondRequest,
  ConversationRespondResponse,
  ConversationSummary,
  ConversationSummaryRequest,
  ConversationTopic,
  ConversationStartResponse,
} from "@/types/conversation";

/**
 * Một lượt hội thoại = một lời gọi Gemini. Thực tế mất 2-6 giây; hosting free
 * còn có thể phải "thức dậy" thêm vài giây nữa.
 */
const TURN_TIMEOUT_MS = 45000;

/**
 * Bản tổng kết dài hơn nhiều và model phải đọc lại cả cuộc hội thoại, nên nó
 * được nới rộng hẳn. Người học lúc này đã hết giờ và đang chờ kết quả - thà
 * để họ chờ thêm còn hơn báo lỗi rồi mất trắng cả phiên vừa luyện.
 */
const SUMMARY_TIMEOUT_MS = 90000;

const client: AxiosInstance = create({
  baseURL: config.aiBaseUrl,
  timeout: TURN_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Thông điệp phải dùng được thẳng trên UI: người học đang ở giữa cuộc hội
    // thoại, họ cần biết phải làm gì tiếp chứ không cần mã lỗi HTTP.
    // Server đã trả `detail` bằng tiếng Việt cho mọi lỗi có chủ đích
    // (hết quota, chưa cấu hình khoá, chủ đề không tồn tại...).
    const message =
      error.code === "ECONNABORTED"
        ? "Máy chủ AI phản hồi hơi lâu. Bạn thử lại sau một chút nhé."
        : (error.response?.data?.detail ??
          "Không kết nối được tới máy chủ AI. Kiểm tra kết nối mạng nhé.");
    return Promise.reject(new Error(message));
  },
);

export const conversationApi = {
  /** Danh sách chủ đề dựng sẵn. Chủ đề tự nhập KHÔNG nằm trong này. */
  getTopics: (): Promise<ConversationTopic[]> =>
    client
      .get<ConversationTopic[]>("/api/v1/conversation/topics")
      .then((r) => r.data),

  /** Mở đầu một phiên; trả về câu chào của AI, gợi ý và độ dài phiên. */
  start: (
    topicId: string,
    customTopic?: string,
  ): Promise<ConversationStartResponse> =>
    client
      .post<ConversationStartResponse>("/api/v1/conversation/start", {
        topicId,
        customTopic,
      })
      .then((r) => r.data),

  /** Gửi một lượt nói của người học và nhận phản hồi + góp ý. */
  respond: (
    request: ConversationRespondRequest,
  ): Promise<ConversationRespondResponse> =>
    client
      .post<ConversationRespondResponse>(
        "/api/v1/conversation/respond",
        request,
      )
      .then((r) => r.data),

  /** Tổng kết cuối phiên: lỗi, cách sửa, ngữ pháp và độ tự nhiên. */
  summarize: (
    request: ConversationSummaryRequest,
  ): Promise<ConversationSummary> =>
    client
      .post<ConversationSummary>("/api/v1/conversation/summary", request, {
        timeout: SUMMARY_TIMEOUT_MS,
      })
      .then((r) => r.data),
};
