/**
 * useSpeechInput — nhận diện giọng nói tiếng Nhật (speech-to-text).
 *
 * Dùng bộ nhận diện có sẵn của Android/iOS: miễn phí, không cần server riêng.
 *
 * Nguyên tắc thiết kế quan trọng nhất
 * -----------------------------------
 * Hook này KHÔNG tự gửi câu đi. Nó chỉ trả về transcript để màn hình điền vào
 * ô nhập cho người học ĐỌC LẠI VÀ SỬA. Đây là bước chặn lỗi dây chuyền: nếu
 * tin tưởng tuyệt đối vào STT thì mic kém -> nghe sai -> phân loại sai -> bot
 * trả lời lạc lõng, và người học không hiểu vì sao. Cho họ thấy máy đã nghe
 * ra gì trước khi gửi sẽ cắt đứt chuỗi đó ngay từ đầu.
 *
 * Nói và gõ luôn dùng được SONG SONG — người học chọn cách nào tuỳ lúc, không
 * bị ép vào một kiểu nhập liệu.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const JAPANESE_LOCALE = "ja-JP";

/**
 * Dưới mức tin cậy này thì cảnh báo người dùng kiểm lại transcript.
 * Bộ nhận diện của Android hay trả về -1 nghĩa là "không có thông tin", nên
 * giá trị âm KHÔNG được coi là tin cậy thấp.
 */
const LOW_CONFIDENCE = 0.6;

export type SpeechInputStatus =
  "idle" | "unsupported" | "denied" | "listening" | "error";

export interface UseSpeechInputValue {
  status: SpeechInputStatus;
  /** Kết quả tạm thời, cập nhật liên tục trong lúc nói. */
  partialTranscript: string;
  /** Cảnh báo khi máy nghe không rõ — UI nên nhắc người dùng kiểm lại. */
  lowConfidence: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

interface UseSpeechInputOptions {
  /** Gọi khi có transcript CHUNG CUỘC. Màn hình dùng để điền vào ô nhập. */
  onFinalTranscript: (text: string) => void;
}

export function useSpeechInput({
  onFinalTranscript,
}: UseSpeechInputOptions): UseSpeechInputValue {
  const [status, setStatus] = useState<SpeechInputStatus>("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [lowConfidence, setLowConfidence] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callback giữ trong ref: listener sự kiện đăng ký một lần, nhưng hàm xử lý
  // của màn hình được tạo lại mỗi lần render.
  const onFinal = useRef(onFinalTranscript);
  useEffect(() => {
    onFinal.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    return () => {
      // Rời màn hình giữa lúc đang nghe -> huỷ hẳn, nếu không micro vẫn mở.
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  useSpeechRecognitionEvent("start", () => {
    setStatus("listening");
    setPartialTranscript("");
    setLowConfidence(false);
    setError(null);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const best = event.results?.[0];
    if (!best) return;

    if (event.isFinal) {
      // confidence = -1 nghĩa là máy không cung cấp thông tin, KHÔNG phải kém.
      setLowConfidence(
        best.confidence >= 0 && best.confidence < LOW_CONFIDENCE,
      );
      setPartialTranscript("");
      if (best.transcript.trim()) {
        onFinal.current(best.transcript.trim());
      }
    } else {
      setPartialTranscript(best.transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setStatus((current) => (current === "listening" ? "idle" : current));
    setPartialTranscript("");
  });

  useSpeechRecognitionEvent("nomatch", () => {
    setError("Mình chưa nghe rõ. Bạn thử nói lại gần micro hơn nhé.");
    setStatus("idle");
  });

  useSpeechRecognitionEvent("error", (event) => {
    setPartialTranscript("");
    // Người dùng tự bấm dừng thì không phải lỗi, đừng doạ họ bằng thông báo đỏ.
    if (event.error === "aborted") {
      setStatus("idle");
      return;
    }
    setError(describeError(event.error));
    setStatus(event.error === "not-allowed" ? "denied" : "error");
  });

  const start = useCallback(async () => {
    setError(null);
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setStatus("denied");
        setError(
          "Cần quyền dùng micro để nghe bạn nói. Bạn vẫn có thể gõ chữ bình thường.",
        );
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: JAPANESE_LOCALE,
        // Hiện chữ ngay trong lúc nói -> người học thấy máy đang nghe được gì.
        interimResults: true,
        // Một lượt nói = một câu; dừng ngay khi người dùng ngắt lời.
        continuous: false,
        maxAlternatives: 1,
      });
      setStatus("listening");
    } catch {
      setStatus("error");
      setError("Không mở được micro. Bạn gõ chữ giúp mình nhé.");
    }
  }, []);

  const stop = useCallback(() => {
    // `stop` chờ xử lý nốt phần đã nghe rồi mới trả kết quả cuối, khác `abort`
    // là vứt bỏ toàn bộ. Người dùng bấm dừng nghĩa là "tôi nói xong rồi".
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { status, partialTranscript, lowConfidence, error, start, stop };
}

function describeError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Cần quyền dùng micro. Bạn vẫn có thể gõ chữ bình thường.";
    case "network":
      return "Nhận diện giọng nói cần mạng. Kiểm tra kết nối hoặc gõ chữ nhé.";
    case "audio-capture":
      return "Không đọc được micro. Kiểm tra xem app khác có đang dùng micro không.";
    case "language-not-supported":
      return "Máy chưa cài gói tiếng Nhật cho nhận diện giọng nói. Bạn gõ chữ giúp mình nhé.";
    case "no-speech":
      return "Mình không nghe thấy gì cả. Thử nói to hơn một chút nhé.";
    default:
      return "Nhận diện giọng nói gặp trục trặc. Bạn gõ chữ giúp mình nhé.";
  }
}
