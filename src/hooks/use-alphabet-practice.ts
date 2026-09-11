/**
 * useAlphabetPractice
 *
 * Vòng lặp luyện tập bảng chữ cái kiểu Duolingo, chạy hoàn toàn trên RAM:
 * - Nhận trọn bộ đề từ `POST /practice/start`, KHÔNG gọi API giữa các câu.
 * - Làm sai -> đẩy một bản sao câu hỏi xuống cuối hàng đợi để làm lại.
 * - Kết quả nộp lên server luôn là kết quả của LẦN LÀM ĐẦU TIÊN cho mỗi chữ.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { alphabetApi } from "@/services/api/alphabets";
import {
  AlphabetPracticeQuestion,
  AlphabetPracticeResultItem,
  AlphabetPracticeSubmitResponse,
} from "@/types/alphabet";
import { normalizeAlphabetPrompt } from "@/utils";

export type AlphabetPracticeStatus =
  "loading" | "playing" | "submitting" | "finished" | "empty" | "error";

export interface PracticeQueueItem {
  /** Khoá React duy nhất: cùng một chữ có thể xuất hiện lại nhiều lần. */
  key: string;
  question: AlphabetPracticeQuestion;
}

export interface UseAlphabetPracticeValue {
  status: AlphabetPracticeStatus;
  sessionId: string | null;
  current: PracticeQueueItem | null;
  /** Số chữ đã vượt qua / tổng số chữ trong bài. */
  progress: { completed: number; total: number };
  /** Số câu còn phải làm (kể cả các câu bị đẩy xuống cuối). */
  remaining: number;
  result: AlphabetPracticeSubmitResponse | null;
  error: string | null;
  answer: (isCorrect: boolean) => void;
  restart: () => Promise<void>;
}

export function useAlphabetPractice(): UseAlphabetPracticeValue {
  const [status, setStatus] = useState<AlphabetPracticeStatus>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [queue, setQueue] = useState<PracticeQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [result, setResult] = useState<AlphabetPracticeSubmitResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  /** characterId -> kết quả lần làm ĐẦU TIÊN. */
  const firstAttempts = useRef(new Map<number, boolean>());
  const replayCounter = useRef(0);
  const isMounted = useRef(true);
  // Chặn bấm đáp án liên tiếp trước khi state kịp cập nhật — tránh submit()
  // bị gọi 2 lần cho cùng một câu cuối.
  const answeringRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submit = useCallback(async () => {
    const results: AlphabetPracticeResultItem[] = Array.from(
      firstAttempts.current.entries(),
    ).map(([characterId, isCorrect]) => ({ characterId, isCorrect }));

    setStatus("submitting");
    try {
      const response = await alphabetApi.submitPractice({ results });
      if (!isMounted.current) return;
      setResult(response);
      setStatus("finished");
    } catch (e) {
      if (!isMounted.current) return;
      setError(e instanceof Error ? e.message : "Không thể nộp bài luyện tập.");
      setStatus("error");
    }
  }, []);

  const start = useCallback(async () => {
    firstAttempts.current = new Map();
    replayCounter.current = 0;
    setStatus("loading");
    setError(null);
    setResult(null);
    setCompleted(0);

    try {
      const response = await alphabetApi.startPractice();
      if (!isMounted.current) return;

      const questions = response?.questions ?? [];
      setSessionId(response?.practiceSessionId ?? null);

      if (questions.length === 0) {
        setQueue([]);
        setTotal(0);
        setStatus("empty");
        return;
      }

      setQueue(
        questions.map((question, index) => ({
          key: `${question.characterId}-${index}`,
          question: {
            ...question,
            prompt: normalizeAlphabetPrompt(question.prompt),
          },
        })),
      );
      setTotal(questions.length);
      setStatus("playing");
    } catch (e) {
      if (!isMounted.current) return;
      setError(e instanceof Error ? e.message : "Không thể tải bài luyện tập.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    answeringRef.current = false;
  }, [queue]);

  const answer = useCallback(
    (isCorrect: boolean) => {
      if (status !== "playing") return;
      if (answeringRef.current) return;

      const head = queue[0];
      if (!head) return;
      answeringRef.current = true;

      // Chỉ ghi nhận lần làm ĐẦU TIÊN của mỗi chữ cái cho server.
      if (!firstAttempts.current.has(head.question.characterId)) {
        firstAttempts.current.set(head.question.characterId, isCorrect);
      }

      const rest = queue.slice(1);

      if (isCorrect) {
        setCompleted((value) => value + 1);
        setQueue(rest);
        if (rest.length === 0) {
          submit();
        }
        return;
      }

      // Sai -> đẩy bản sao xuống cuối hàng đợi để bắt làm lại.
      replayCounter.current += 1;
      setQueue([
        ...rest,
        {
          key: `${head.question.characterId}-replay-${replayCounter.current}`,
          question: head.question,
        },
      ]);
    },
    [queue, status, submit],
  );

  return {
    status,
    sessionId,
    current: queue[0] ?? null,
    progress: { completed, total },
    remaining: queue.length,
    result,
    error,
    answer,
    restart: start,
  };
}
