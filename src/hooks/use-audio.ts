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

import { useToast } from "@/contexts/toast-context";
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

/**
 * Máy chưa tải gói giọng đọc tiếng Nhật thì `Speech.speak(..., { language: "ja-JP" })`
 * không kêu gì cả nhưng cũng không báo lỗi — người dùng tưởng app hỏng. Dò 1 lần
 * cho cả app và chỉ cảnh báo 1 lần duy nhất (tránh Toast lặp lại mỗi câu hỏi).
 */
let hasJapaneseVoicePromise: Promise<boolean> | null = null;
let hasWarnedMissingVoice = false;

function checkJapaneseVoiceAvailable(): Promise<boolean> {
  if (!hasJapaneseVoicePromise) {
    hasJapaneseVoicePromise = Speech.getAvailableVoicesAsync()
      .then((voices) =>
        voices.some((v) => v.language?.toLowerCase().startsWith("ja")),
      )
      .catch(() => true); // Không dò được thì đừng chặn TTS, cứ thử phát.
  }
  return hasJapaneseVoicePromise;
}

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
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const isMountedRef = useRef(true);
  const usingSpeechRef = useRef(false);
  const { showWarning, showError } = useToast();

  const cleanupPlayer = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (overrideUrl?: string | any) => {
      const rawUrl = typeof overrideUrl === "string" ? overrideUrl : url;
      const playUrl = resolveMediaUrl(rawUrl);

      if (!playUrl) {
        const textToSpeak = fallbackText?.trim();
        if (!textToSpeak) return;

        cleanupPlayer();

        const hasVoice = await checkJapaneseVoiceAvailable();
        if (!hasVoice && !hasWarnedMissingVoice) {
          hasWarnedMissingVoice = true;
          showWarning(
            "Thiếu giọng đọc tiếng Nhật",
            "Máy chưa cài gói giọng đọc Tiếng Nhật nên có thể không nghe được. Vào Cài đặt > Ngôn ngữ & nhập liệu > Chuyển văn bản thành giọng nói để tải thêm.",
          );
        }

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
      // Dừng giọng đọc TTS nếu đang phát trước khi phát file audio thật
      Speech.stop();

      try {
        await ensureAudioMode();

        cleanupPlayer();

        const player = createAudioPlayer(playUrl);

        if (!isMountedRef.current) {
          player.remove();
          return;
        }

        playerRef.current = player;

        // Lắng nghe sự kiện trạng thái phát của expo-audio để tự động tắt isPlaying khi kết thúc
        subscriptionRef.current = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (!isMountedRef.current) return;
            if (
              status.didJustFinish ||
              (!status.playing && status.currentTime > 0)
            ) {
              setIsPlaying(false);
            } else {
              setIsPlaying(status.playing);
            }
          },
        );

        player.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn(`Không phát được audio (${playUrl}):`, error);
        cleanupPlayer();

        // Tự động fallback sang TTS tiếng Nhật của máy nếu có chữ tiếng Nhật cần đọc
        const textToSpeak = fallbackText?.trim();
        if (textToSpeak) {
          const hasVoice = await checkJapaneseVoiceAvailable();
          if (!hasVoice && !hasWarnedMissingVoice) {
            hasWarnedMissingVoice = true;
            showWarning(
              "Thiếu giọng đọc tiếng Nhật",
              "Máy chưa cài gói giọng đọc Tiếng Nhật nên có thể không nghe được. Vào Cài đặt > Ngôn ngữ & nhập liệu > Chuyển văn bản thành giọng nói để tải thêm.",
            );
          }

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

        if (isMountedRef.current) setIsPlaying(false);
        showError(
          "Không phát được âm thanh",
          "Kiểm tra kết nối mạng rồi thử lại.",
        );
      }
    },
    [url, fallbackText, showWarning, showError, cleanupPlayer],
  );

  const stop = useCallback(async () => {
    Speech.stop();
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
    }
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      Speech.stop();
      cleanupPlayer();
    };
  }, [cleanupPlayer]);

  return {
    isPlaying,
    play,
    stop,
  };
}
