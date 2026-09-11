/**
 * Sound Service
 *
 * Quản lý hiệu ứng âm thanh (SFX) cho ứng dụng:
 * - Lưu & tải trạng thái bật/tắt (SFX Toggle) qua AsyncStorage.
 * - Phát âm thanh phản hồi nhanh bằng `expo-audio`, an toàn trên mọi nền tảng
 *   & môi trường test.
 *
 * Bộ âm 和音 (wa-on) do `scripts/generate-sounds.js` tổng hợp từ mô hình vật lý
 * nhạc cụ Nhật (koto, chuông rin, hyoshigi, taiko) — xem file đó để biết chi
 * tiết từng tiếng.
 *
 * Điểm đáng chú ý: tiếng trả lời đúng có 5 biến thể lên dần theo thang ngũ
 * cung yo. Mỗi câu đúng liên tiếp phát cao hơn một bậc, sai thì rơi về bậc
 * đầu — chính cao độ báo cho người học biết chuỗi đang dài ra, trước cả khi
 * đọc chữ trên màn hình.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

const STORAGE_KEY_SFX = "@nihongo_sfx_enabled";
const LEGACY_STORAGE_KEY_SFX = "@kotodama_sfx_enabled";

// Static asset references for Bundler / Metro — Metro chỉ nhận require() với
// đường dẫn hằng, nên bậc thang combo phải liệt kê thủ công.
const CORRECT_LADDER_SOURCES = [
  require("../../assets/sounds/correct.wav"),
  require("../../assets/sounds/correct-2.wav"),
  require("../../assets/sounds/correct-3.wav"),
  require("../../assets/sounds/correct-4.wav"),
  require("../../assets/sounds/correct-5.wav"),
];
const INCORRECT_SOUND_SOURCE = require("../../assets/sounds/incorrect.wav");
const TAP_SOUND_SOURCE = require("../../assets/sounds/tap.wav");
const LESSON_COMPLETE_SOUND_SOURCE = require("../../assets/sounds/lesson-complete.wav");
const ACHIEVEMENT_SOUND_SOURCE = require("../../assets/sounds/achievement.wav");
const STREAK_SOUND_SOURCE = require("../../assets/sounds/streak.wav");

/** Số bậc của thang combo. */
export const CORRECT_LADDER_STEPS = CORRECT_LADDER_SOURCES.length;

let soundEnabledCache: boolean = true;
let isInitialized: boolean = false;
let audioModePromise: Promise<void> | null = null;

/**
 * Player được tạo lười theo key và giữ lại để phát lại tức thì.
 * Dùng Map thay vì mỗi tiếng một biến để thêm biến thể combo không phải sửa
 * cả `cleanup()` lẫn danh sách biến mỗi lần.
 */
const players = new Map<string, AudioPlayer>();

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

/**
 * Phát một hiệu ứng âm thanh theo key, tái sử dụng player đã tạo (seek về 0
 * trước khi phát lại) và tự tạo player mới nếu lần đầu hoặc player cũ bị huỷ.
 */
async function playCachedSound(key: string, source: number): Promise<void> {
  if (!soundEnabledCache) return;
  try {
    await ensureAudioMode();
    let player = players.get(key) ?? null;
    if (!player && typeof createAudioPlayer === "function") {
      player = createAudioPlayer(source);
      players.set(key, player);
    }
    if (player) {
      player.seekTo(0);
      player.play();
    }
  } catch {
    // Fallback: Tạo mới nếu player cũ bị huỷ
    try {
      if (typeof createAudioPlayer === "function") {
        const tempPlayer = createAudioPlayer(source);
        players.set(key, tempPlayer);
        tempPlayer.play();
      }
    } catch (fallbackError) {
      console.warn(
        `[SoundService] Không phát được ${key} sound:`,
        fallbackError,
      );
    }
  }
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
   *
   * @param comboStep Số câu đúng liên tiếp TRƯỚC câu này (0 = câu đúng đầu
   * tiên). Cao độ leo một bậc thang yo mỗi câu, chạm trần ở bậc 5 rồi giữ
   * nguyên — leo mãi sẽ thành chói và mất ý nghĩa "đang giữ chuỗi".
   */
  async playCorrect(comboStep: number = 0): Promise<void> {
    const step = Math.min(
      Math.max(Math.floor(comboStep) || 0, 0),
      CORRECT_LADDER_STEPS - 1,
    );
    await playCachedSound(`correct-${step}`, CORRECT_LADDER_SOURCES[step]);
  },

  /**
   * Phát âm thanh khi trả lời Sai.
   */
  async playIncorrect(): Promise<void> {
    await playCachedSound("incorrect", INCORRECT_SOUND_SOURCE);
  },

  /**
   * Phát tiếng gõ gỗ nhẹ khi chọn đáp án — tiếng nhỏ nhất trong bộ, đủ để tay
   * biết đã chạm trúng mà không lấn tiếng phản hồi đúng/sai ngay sau đó.
   */
  async playTap(): Promise<void> {
    await playCachedSound("tap", TAP_SOUND_SOURCE);
  },

  /**
   * Phát âm thanh khi hoàn thành bài học (màn hình kết quả).
   */
  async playLessonComplete(): Promise<void> {
    await playCachedSound("lesson-complete", LESSON_COMPLETE_SOUND_SOURCE);
  },

  /**
   * Phát âm thanh khi mở khoá thành tựu mới.
   */
  async playAchievement(): Promise<void> {
    await playCachedSound("achievement", ACHIEVEMENT_SOUND_SOURCE);
  },

  /**
   * Phát âm thanh khi streak được nối dài / bảo vệ.
   */
  async playStreak(): Promise<void> {
    await playCachedSound("streak", STREAK_SOUND_SOURCE);
  },

  /**
   * Dọn dẹp tài nguyên âm thanh (khi cần).
   */
  cleanup(): void {
    isInitialized = false;
    try {
      for (const player of players.values()) {
        player?.remove();
      }
    } catch (e) {
      console.warn("[SoundService] Lỗi dọn dẹp player:", e);
    } finally {
      players.clear();
    }
  },
};
