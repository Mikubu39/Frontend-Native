/**
 * Sound Service
 *
 * Quản lý hiệu ứng âm thanh (SFX) cho câu trả lời Đúng/Sai trong ứng dụng:
 * - Lưu & tải trạng thái bật/tắt (SFX Toggle) qua AsyncStorage.
 * - Phát âm thanh phản hồi nhanh bằng `expo-audio`, an toàn trên mọi nền tảng & môi trường test.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

const STORAGE_KEY_SFX = "@nihongo_sfx_enabled";
const LEGACY_STORAGE_KEY_SFX = "@kotodama_sfx_enabled";

// Static asset references for Bundler / Metro
const CORRECT_SOUND_SOURCE = require("../../assets/sounds/correct.wav");
const INCORRECT_SOUND_SOURCE = require("../../assets/sounds/incorrect.wav");

let soundEnabledCache: boolean = true;
let isInitialized: boolean = false;
let audioModePromise: Promise<void> | null = null;

let correctPlayer: AudioPlayer | null = null;
let incorrectPlayer: AudioPlayer | null = null;

function ensureAudioMode(): Promise<void> {
  if (!audioModePromise) {
    if (typeof setAudioModeAsync === "function") {
      audioModePromise = setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "duckOthers",
        allowsRecording: false,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      }).catch((err) => {
        console.warn("[SoundService] Không thể thiết lập AudioMode:", err);
        audioModePromise = null;
      });
    } else {
      audioModePromise = Promise.resolve();
    }
  }
  return audioModePromise;
}

export const soundService = {
  /**
   * Khởi tạo và đọc cấu hình từ AsyncStorage.
   */
  async init(): Promise<boolean> {
    if (isInitialized) return soundEnabledCache;
    try {
      let stored = await AsyncStorage.getItem(STORAGE_KEY_SFX);
      if (stored === null) {
        stored = await AsyncStorage.getItem(LEGACY_STORAGE_KEY_SFX);
      }
      if (stored !== null) {
        soundEnabledCache = stored === "true";
      } else {
        soundEnabledCache = true;
      }
      isInitialized = true;
    } catch {
      soundEnabledCache = true;
    }
    return soundEnabledCache;
  },

  /**
   * Kiểm tra xem hiệu ứng âm thanh có đang bật không.
   */
  isSoundEnabled(): boolean {
    return soundEnabledCache;
  },

  /**
   * Cập nhật trạng thái bật/tắt hiệu ứng âm thanh và lưu vào AsyncStorage.
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    soundEnabledCache = enabled;
    isInitialized = true;
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SFX, enabled ? "true" : "false");
    } catch (e) {
      console.warn("[SoundService] Lỗi lưu trạng thái SFX:", e);
    }
  },

  /**
   * Phát âm thanh khi trả lời Đúng.
   */
  async playCorrect(): Promise<void> {
    if (!soundEnabledCache) return;
    try {
      await ensureAudioMode();
      if (!correctPlayer && typeof createAudioPlayer === "function") {
        correctPlayer = createAudioPlayer(CORRECT_SOUND_SOURCE);
      }
      if (correctPlayer) {
        correctPlayer.seekTo(0);
        correctPlayer.play();
      }
    } catch {
      // Fallback: Tạo mới nếu player cũ bị huỷ
      try {
        if (typeof createAudioPlayer === "function") {
          const tempPlayer = createAudioPlayer(CORRECT_SOUND_SOURCE);
          correctPlayer = tempPlayer;
          tempPlayer.play();
        }
      } catch (fallbackError) {
        console.warn(
          "[SoundService] Không phát được correct sound:",
          fallbackError,
        );
      }
    }
  },

  /**
   * Phát âm thanh khi trả lời Sai.
   */
  async playIncorrect(): Promise<void> {
    if (!soundEnabledCache) return;
    try {
      await ensureAudioMode();
      if (!incorrectPlayer && typeof createAudioPlayer === "function") {
        incorrectPlayer = createAudioPlayer(INCORRECT_SOUND_SOURCE);
      }
      if (incorrectPlayer) {
        incorrectPlayer.seekTo(0);
        incorrectPlayer.play();
      }
    } catch {
      // Fallback: Tạo mới nếu player cũ bị huỷ
      try {
        if (typeof createAudioPlayer === "function") {
          const tempPlayer = createAudioPlayer(INCORRECT_SOUND_SOURCE);
          incorrectPlayer = tempPlayer;
          tempPlayer.play();
        }
      } catch (fallbackError) {
        console.warn(
          "[SoundService] Không phát được incorrect sound:",
          fallbackError,
        );
      }
    }
  },

  /**
   * Dọn dẹp tài nguyên âm thanh (khi cần).
   */
  cleanup(): void {
    isInitialized = false;
    try {
      if (correctPlayer) {
        correctPlayer.remove();
        correctPlayer = null;
      }
      if (incorrectPlayer) {
        incorrectPlayer.remove();
        incorrectPlayer = null;
      }
    } catch (e) {
      console.warn("[SoundService] Lỗi dọn dẹp player:", e);
    }
  },
};
