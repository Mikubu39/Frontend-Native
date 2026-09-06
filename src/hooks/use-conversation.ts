/**
 * useConversation
 *
 * Giữ toàn bộ trạng thái của một phiên luyện hội thoại 5 phút: lịch sử lượt
 * nói, đồng hồ đếm ngược, và bản tổng kết cuối phiên.
 *
 * Vì sao client giữ lịch sử
 * -------------------------
 * Dịch vụ AI là PHI TRẠNG THÁI (xem `ai-service/README.md`): máy chủ free-tier
 * ngủ đông và khởi động lại bất cứ lúc nào, phiên lưu trong RAM server sẽ bốc
 * hơi giữa cuộc hội thoại. Giữ ở client thì người học nhấn gửi lại sau lỗi
 * mạng mà không mất mạch chuyện, và hạ tầng không cần Redis/DB.
 *
 * Vì sao client giữ luôn đồng hồ
 * ------------------------------
 * Không có phiên trên server thì cũng không có "lúc bắt đầu" để trừ đi. Client
 * đếm ngược và gửi kèm `remainingSeconds` mỗi lượt; server chỉ dùng con số đó
 * để nhắc AI lái hội thoại về phần kết.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { conversationApi } from "@/services/api/conversation";
import {
  CUSTOM_TOPIC_ID,
  SESSION_DURATION_SECONDS,
} from "@/constants/conversation";
import type {
  ChatMessage,
  ConversationHistoryTurn,
  ConversationSummary,
  ConversationTopic,
  ConversationUtterance,
} from "@/types/conversation";

export type ConversationStatus =
  | "loading" // đang chờ câu chào mở màn
  | "ready" // tới lượt người học
  | "sending" // đang chờ AI đáp
  | "summarizing" // hết giờ, đang chờ bản tổng kết
  | "finished" // đã có bản tổng kết
  | "error"; // không mở được phiên

export interface UseConversationValue {
  status: ConversationStatus;
  topic: ConversationTopic | null;
  messages: ChatMessage[];
  hints: ConversationUtterance[];
  /** Giây còn lại của phiên. Đếm ngược mỗi giây, không bao giờ âm. */
  remainingSeconds: number;
  summary: ConversationSummary | null;
  /** Lỗi ở lượt vừa rồi hoặc lúc mở phiên. Không chặn việc gõ tiếp. */
  error: string | null;
  /** Lỗi riêng khi dựng bản tổng kết - có nút thử lại riêng. */
  summaryError: string | null;
  send: (text: string, vietnamese?: string) => Promise<void>;
  /** Kết thúc sớm theo ý người học. */
  finishNow: () => Promise<void>;
  retrySummary: () => Promise<void>;
  restart: () => Promise<void>;
}

let messageCounter = 0;
const nextId = (): string => `m${++messageCounter}`;

export function useConversation(
  topicId: string,
  customTopic?: string,
): UseConversationValue {
  const [status, setStatus] = useState<ConversationStatus>("loading");
  const [topic, setTopic] = useState<ConversationTopic | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hints, setHints] = useState<ConversationUtterance[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(
    SESSION_DURATION_SECONDS,
  );
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  /**
   * Lịch sử giữ trong ref chứ không phải state: `send` đọc nó ngay trong cùng
   * một lượt gõ phím, sớm hơn nhịp re-render của React.
   */
  const history = useRef<ConversationHistoryTurn[]>([]);
  const sessionSeconds = useRef(SESSION_DURATION_SECONDS);
  /** Mốc kết thúc tuyệt đối. Đặt null khi đồng hồ chưa chạy. */
  const deadline = useRef<number | null>(null);
  /** Chặn tổng kết chạy hai lần (hết giờ + bấm tay cùng lúc). */
  const finishing = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const customArg = topicId === CUSTOM_TOPIC_ID ? customTopic : undefined;

  // --- Tổng kết -----------------------------------------------------------
  const buildSummary = useCallback(async () => {
    setStatus("summarizing");
    setSummaryError(null);

    try {
      const result = await conversationApi.summarize({
        topicId,
        customTopic: customArg,
        history: history.current,
        durationSeconds: sessionSeconds.current,
      });
      if (!isMounted.current) return;
      setSummary(result);
      setStatus("finished");
    } catch (err) {
      if (!isMounted.current) return;
      // Vẫn chuyển sang "finished": phiên ĐÃ kết thúc thật, chỉ là chưa có
      // nhận xét. Giữ ở "summarizing" sẽ khoá người học trong màn hình chờ
      // vĩnh viễn.
      setSummaryError(
        err instanceof Error ? err.message : "Không dựng được bản tổng kết.",
      );
      setStatus("finished");
    }
  }, [topicId, customArg]);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    deadline.current = null;
    setRemainingSeconds(0);

    // Chưa nói câu nào thì không có gì để tổng kết - server cũng sẽ từ chối.
    if (!history.current.some((turn) => turn.role === "user")) {
      setSummary(null);
      setSummaryError(
        "Phiên kết thúc mà bạn chưa nói câu nào, nên chưa có gì để tổng kết.",
      );
      setStatus("finished");
      return;
    }

    await buildSummary();
  }, [buildSummary]);

  // --- Mở phiên -----------------------------------------------------------
  const begin = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setSummary(null);
    setSummaryError(null);
    setMessages([]);
    setHints([]);
    history.current = [];
    finishing.current = false;
    deadline.current = null;
    sessionSeconds.current = SESSION_DURATION_SECONDS;
    setRemainingSeconds(SESSION_DURATION_SECONDS);

    try {
      const response = await conversationApi.start(topicId, customArg);
      if (!isMounted.current) return;

      setTopic(response.topic);
      history.current = [{ role: "ai", text: response.reply.ja }];
      setMessages([
        {
          id: nextId(),
          author: "bot",
          ja: response.reply.ja,
          vi: response.reply.vi,
        },
      ]);
      setHints(response.hints);

      // Đồng hồ chỉ bắt đầu chạy KHI câu chào đã hiện ra. Hosting free có thể
      // mất tới 30 giây để thức dậy, và tính khoảng đó vào 5 phút luyện tập
      // của người học thì quá vô lý.
      sessionSeconds.current =
        response.durationSeconds || SESSION_DURATION_SECONDS;
      setRemainingSeconds(sessionSeconds.current);
      deadline.current = Date.now() + sessionSeconds.current * 1000;

      setStatus("ready");
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Không mở được hội thoại.");
      setStatus("error");
    }
  }, [topicId, customArg]);

  useEffect(() => {
    begin();
  }, [begin]);

  // --- Đồng hồ đếm ngược --------------------------------------------------
  useEffect(() => {
    if (deadline.current === null) return;
    if (
      status === "summarizing" ||
      status === "finished" ||
      status === "error"
    ) {
      return;
    }

    // Tính lại từ MỐC KẾT THÚC chứ không trừ dần 1 giây mỗi nhịp: khi app bị
    // đưa xuống nền, `setInterval` của React Native bị bóp lại và cách trừ dần
    // sẽ khiến phiên kéo dài hơn 5 phút thật.
    const tick = () => {
      if (deadline.current === null) return;
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemainingSeconds(left);
      if (left <= 0) finish();
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [status, finish]);

  // --- Một lượt nói -------------------------------------------------------
  const send = useCallback(
    async (text: string, vietnamese?: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "ready") return;

      // Hiện ngay câu của người dùng - đừng bắt họ chờ mạng mới thấy mình vừa
      // gõ gì.
      const userMessageId = nextId();
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          author: "user",
          ja: trimmed,
          vi: vietnamese || "",
        },
      ]);
      setStatus("sending");
      setError(null);

      const snapshot = history.current;

      try {
        const response = await conversationApi.respond({
          topicId,
          customTopic: customArg,
          text: trimmed,
          history: snapshot,
          remainingSeconds,
        });
        if (!isMounted.current) return;

        history.current = [
          ...snapshot,
          { role: "user", text: trimmed },
          { role: "ai", text: response.reply.ja },
        ];

        setMessages((prev) => [
          // Góp ý và bản dịch tiếng Việt gắn vào chính câu NGƯỜI HỌC vừa nói.
          ...prev.map((message) =>
            message.id === userMessageId
              ? {
                  ...message,
                  vi: response.userVi || message.vi,
                  corrections: response.corrections,
                }
              : message,
          ),
          {
            id: nextId(),
            author: "bot" as const,
            ja: response.reply.ja,
            vi: response.reply.vi,
          },
        ]);
        setHints(response.hints);
        // Hết giờ ngay trong lúc lượt này còn đang bay: bản tổng kết đã khởi
        // động rồi, tuyệt đối không được kéo ngược trạng thái về "ready".
        if (!finishing.current) setStatus("ready");
      } catch (err) {
        if (!isMounted.current) return;
        setError(
          err instanceof Error ? err.message : "Gửi câu trả lời thất bại.",
        );
        if (!finishing.current) setStatus("ready");
      }
    },
    [topicId, customArg, status, remainingSeconds],
  );

  return {
    status,
    topic,
    messages,
    hints,
    remainingSeconds,
    summary,
    error,
    summaryError,
    send,
    finishNow: finish,
    retrySummary: buildSummary,
    restart: begin,
  };
}
