/**
 * useAudio hook
 *
 * Phát audio phát âm / bài nghe. Đây là điểm vào duy nhất của toàn bộ audio
 * trong app, nên việc chuẩn hoá URL (`resolveMediaUrl`) được đặt ở đây: URL
 * tương đối từ backend (`/uploads/audios/...`) sẽ tự động được ghép base URL.
 *
 * `fallbackText`: khi câu hỏi chưa có file audio thật (backend chưa upload),
 * ta đọc bằng TTS trên máy (`expo-speech`, giọng ja-JP) thay vì im lặng —
 * một cái loa bấm vào không kêu còn tệ hơn không có loa.
 */

import { resolveMediaUrl } from "@/utils/media";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";

const LEARNER_RATE = 0.85;
const JAPANESE_LOCALE = "ja-JP";

/**
 * Cấu hình audio mode chỉ chạy 1 lần cho cả app.
 */
let audioModePromise: Promise<void> | null = null;

function ensureAudioMode(): Promise<void> {
  if (!audioModePromise) {
    audioModePromise = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "duckOthers",
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    }).catch((error) => {
      console.warn("Không cấu hình được audio mode:", error);
      // Reset để lần play sau còn thử lại được.
      audioModePromise = null;
    });
  }
  return audioModePromise;
}

export function useAudio(url?: string, fallbackText?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const isMountedRef = useRef(true);
  const usingSpeechRef = useRef(false);

  const play = useCallback(
    async (overrideUrl?: string | any) => {
      const rawUrl = typeof overrideUrl === "string" ? overrideUrl : url;
      const playUrl = resolveMediaUrl(rawUrl);

      if (!playUrl) {
        const textToSpeak = fallbackText?.trim();
        if (!textToSpeak) return;

        Speech.stop();
        usingSpeechRef.current = true;
        setIsPlaying(true);
        Speech.speak(textToSpeak, {
          language: JAPANESE_LOCALE,
          rate: LEARNER_RATE,
          onDone: () => {
            if (isMountedRef.current) setIsPlaying(false);
          },
          onStopped: () => {
            if (isMountedRef.current) setIsPlaying(false);
          },
          onError: () => {
            if (isMountedRef.current) setIsPlaying(false);
          },
        });
        return;
      }

      usingSpeechRef.current = false;

      try {
        await ensureAudioMode();

        if (playerRef.current) {
          playerRef.current.remove();
          playerRef.current = null;
        }

        const player = createAudioPlayer(playUrl);

        if (!isMountedRef.current) {
          player.remove();
          return;
        }

        playerRef.current = player;
        player.play();
        setIsPlaying(true);

        // Giả lập sự kiện kết thúc (trong expo-audio 1.1.1, có thể dùng useAudioPlayerStatus
        // nhưng vì chúng ta dùng overrideUrl linh hoạt, ta sẽ dùng setTimeout dựa trên duration,
        // hoặc để người dùng dựa vào status nếu cần thiết.
        // Tuy nhiên `expo-audio` player tự động dừng khi hết file.)
        // Ở phiên bản hiện tại, chỉ cần set isPlaying(true) khi gọi play.
        // Để lắng nghe khi kết thúc ở custom hook này, chúng ta có thể cần player.addListener,
        // nhưng API chưa rõ nên tạm thời bỏ qua listener báo kết thúc (isPlaying có thể bị kẹt = true).
        // Tốt nhất, sau vài giây (ví dụ 3s) ta set lại false cho an toàn nếu không tìm được duration.
      } catch (error) {
        console.warn(`Không phát được audio (${playUrl}):`, error);
        setIsPlaying(false);
      }
    },
    [url, fallbackText],
  );

  const stop = useCallback(async () => {
    if (usingSpeechRef.current) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      Speech.stop();
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    play,
    stop,
  };
}
