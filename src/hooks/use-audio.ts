/**
 * useAudio hook
 *
 * Phát audio phát âm / bài nghe. Đây là điểm vào duy nhất của toàn bộ audio
 * trong app, nên việc chuẩn hoá URL (`resolveMediaUrl`) được đặt ở đây: URL
 * tương đối từ backend (`/uploads/audios/...`) sẽ tự động được ghép base URL.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { resolveMediaUrl } from "@/utils/media";

/**
 * Cấu hình audio mode chỉ chạy 1 lần cho cả app.
 *
 * `playsInSilentModeIOS` là bắt buộc: thiếu nó thì trên iPhone gạt nút im lặng
 * là toàn bộ tiếng phát âm biến mất mà không có lỗi nào được ném ra.
 */
let audioModePromise: Promise<void> | null = null;

function ensureAudioMode(): Promise<void> {
  if (!audioModePromise) {
    audioModePromise = Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    }).catch((error) => {
      console.warn("Không cấu hình được audio mode:", error);
      // Reset để lần play sau còn thử lại được.
      audioModePromise = null;
    });
  }
  return audioModePromise;
}

export function useAudio(url?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);

  const play = useCallback(
    async (overrideUrl?: string | any) => {
      const rawUrl = typeof overrideUrl === "string" ? overrideUrl : url;
      const playUrl = resolveMediaUrl(rawUrl);
      if (!playUrl) return;

      try {
        await ensureAudioMode();

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: playUrl },
          { shouldPlay: true },
        );

        if (!isMountedRef.current) {
          // Component đã unmount trong lúc chờ tải file — tránh rò rỉ sound.
          await newSound.unloadAsync();
          return;
        }

        soundRef.current = newSound;
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } catch (error) {
        console.warn(`Không phát được audio (${playUrl}):`, error);
        setIsPlaying(false);
      }
    },
    [url],
  );

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    play,
    stop,
  };
}
