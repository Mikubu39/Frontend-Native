/**
 * useConversation
 *
 * Giữ toàn bộ trạng thái của một phiên luyện hội thoại. Dịch vụ AI là PHI
 * TRẠNG THÁI, nên hook này chính là nơi duy nhất nắm "cuộc hội thoại đang ở
 * đâu": trạng thái FSM hiện tại và chuỗi lượt hỏng liên tiếp.
 *
 * Vì sao giữ ở client
 * -------------------
 * Máy chủ free-tier ngủ đông và khởi động lại bất cứ lúc nào; phiên lưu trong
 * RAM server sẽ bốc hơi giữa cuộc hội thoại. Giữ ở client thì người học có thể
 * nhấn gửi lại mà không mất tiến độ, và hạ tầng không cần Redis/DB.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { conversationApi } from "@/services/api/conversation";
import type {
  ChatMessage,
  ConversationUtterance,
  ConversationRespondResponse,
} from "@/types/conversation";

export type ConversationStatus =
  "loading" | "ready" | "sending" | "finished" | "error";

export interface UseConversationValue {
  status: ConversationStatus;
  messages: ChatMessage[];
  hints: ConversationUtterance[];
  /** Số lượt hỏng liên tiếp - UI dùng để hiện trợ giúp dần dần. */
  failures: number;
  /** Bật khi người học kẹt: nên lộ luôn câu mẫu. */
  rescue: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  restart: () => Promise<void>;
}

let messageCounter = 0;
const nextId = (): string => `m${++messageCounter}`;

export function useConversation(scenarioId: string): UseConversationValue {
  const [status, setStatus] = useState<ConversationStatus>("loading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hints, setHints] = useState<ConversationUtterance[]>([]);
  const [failures, setFailures] = useState(0);
  const [rescue, setRescue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Trạng thái FSM giữ trong ref chứ không phải state: `send` đọc nó ngay
   * trong cùng một lượt gõ phím, sớm hơn nhịp re-render của React.
   */
  const fsmState = useRef<string>("");
  const failureStreak = useRef(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const begin = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setRescue(false);
    setFailures(0);
    failureStreak.current = 0;

    try {
      const response = await conversationApi.start(scenarioId);
      if (!isMounted.current) return;

      fsmState.current = response.state;
      setMessages([
        {
          id: nextId(),
          author: "bot",
          ja: response.reply.ja,
          vi: response.reply.vi,
        },
      ]);
      setHints(response.hints);
      setStatus("ready");
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Không mở được hội thoại.");
      setStatus("error");
    }
  }, [scenarioId]);

  useEffect(() => {
    begin();
  }, [begin]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "sending" || status === "finished") return;

      // Hiện ngay câu của người dùng - đừng bắt họ chờ mạng mới thấy mình vừa
      // gõ gì.
      setMessages((prev) => [
        ...prev,
        { id: nextId(), author: "user", ja: trimmed, vi: "" },
      ]);
      setStatus("sending");
      setError(null);

      try {
        const response: ConversationRespondResponse =
          await conversationApi.respond({
            scenarioId,
            state: fsmState.current,
            text: trimmed,
            consecutiveFailures: failureStreak.current,
          });
        if (!isMounted.current) return;

        fsmState.current = response.state;
        failureStreak.current = response.consecutiveFailures;

        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            author: "bot",
            ja: response.reply.ja,
            vi: response.reply.vi,
            outcome: response.outcome,
            grammarNotes: response.grammarNotes,
            confidence: response.confidence,
          },
        ]);
        setHints(response.hints);
        setFailures(response.consecutiveFailures);
        setRescue(response.rescue);
        setStatus(response.completed ? "finished" : "ready");
      } catch (err) {
        if (!isMounted.current) return;
        // Lỗi mạng KHÔNG được tính vào chuỗi hỏng: đó là lỗi của hạ tầng,
        // không phải của người học.
        setError(
          err instanceof Error ? err.message : "Gửi câu trả lời thất bại.",
        );
        setStatus("ready");
      }
    },
    [scenarioId, status],
  );

  return {
    status,
    messages,
    hints,
    failures,
    rescue,
    error,
    send,
    restart: begin,
  };
}
