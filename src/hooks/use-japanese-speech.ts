/**
 * useJapaneseSpeech — phát âm câu tiếng Nhật (text-to-speech).
 *
 * Chạy hoàn toàn TRÊN MÁY bằng bộ đọc có sẵn của Android/iOS, nên không tốn
 * phí và không cần mạng. Đổi lại, chất lượng giọng phụ thuộc vào gói giọng
 * tiếng Nhật người dùng đã cài — máy chưa có gói `ja-JP` sẽ đọc sai hoặc im
 * lặng, nên hook luôn báo lại trạng thái thay vì giả vờ đã đọc.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";

/** Tốc độ đọc chậm hơn bình thường — người mới học cần nghe rõ từng âm tiết. */
const LEARNER_RATE = 0.85;
const JAPANESE_LOCALE = "ja-JP";

export interface UseJapaneseSpeechValue {
  isSpeaking: boolean;
  /** Câu đang được đọc, để UI làm nổi bật đúng bong bóng chat. */
  speakingText: string | null;
  speak: (text: string) => void;
  stop: () => void;
}

export function useJapaneseSpeech(): UseJapaneseSpeechValue {
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Dừng hẳn khi rời màn hình, nếu không giọng đọc vẫn phát tiếp khi
      // người dùng đã sang màn khác.
      Speech.stop();
    };
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    if (isMounted.current) setSpeakingText(null);
  }, []);

  const speak = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Chạm vào câu đang đọc = dừng lại (bấm lần nữa để nghe lại từ đầu).
    Speech.stop();

    setSpeakingText(trimmed);
    Speech.speak(trimmed, {
      language: JAPANESE_LOCALE,
      rate: LEARNER_RATE,
      onDone: () => {
        if (isMounted.current) setSpeakingText(null);
      },
      onStopped: () => {
        if (isMounted.current) setSpeakingText(null);
      },
      onError: () => {
        if (isMounted.current) setSpeakingText(null);
      },
    });
  }, []);

  return {
    isSpeaking: speakingText !== null,
    speakingText,
    speak,
    stop,
  };
}
