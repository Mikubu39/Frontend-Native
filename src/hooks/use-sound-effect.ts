/**
 * useSoundEffect Hook
 *
 * Hook cung cấp các hàm phát âm thanh và điều khiển cài đặt SFX:
 * - `playCorrect(comboStep)`: Phát tiếng koto khi trả lời đúng, cao dần theo
 *   số câu đúng liên tiếp
 * - `playTap()`: Phát tiếng gõ gỗ nhẹ khi chọn đáp án
 * - `playIncorrect()`: Phát âm thanh trầm khi trả lời sai
 * - `playLessonComplete()`: Phát âm thanh khi hoàn thành bài học
 * - `playAchievement()`: Phát âm thanh khi mở khoá thành tựu mới
 * - `playStreak()`: Phát âm thanh khi streak được nối dài / bảo vệ
 * - `soundEnabled`: Trạng thái bật/tắt
 * - `setSoundEnabled`: Cập nhật trạng thái
 * - `toggleSoundEnabled`: Bật/Tắt nhanh
 */

import { soundService } from "@/services/sound-service";
import { useCallback, useEffect, useState } from "react";

export function useSoundEffect() {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(
    soundService.isSoundEnabled(),
  );

  useEffect(() => {
    soundService.init().then((enabled) => {
      setSoundEnabledState(enabled);
    });
  }, []);

  const playCorrect = useCallback((comboStep: number = 0) => {
    soundService.playCorrect(comboStep);
  }, []);

  const playTap = useCallback(() => {
    soundService.playTap();
  }, []);

  const playIncorrect = useCallback(() => {
    soundService.playIncorrect();
  }, []);

  const playLessonComplete = useCallback(() => {
    soundService.playLessonComplete();
  }, []);

  const playAchievement = useCallback(() => {
    soundService.playAchievement();
  }, []);

  const playStreak = useCallback(() => {
    soundService.playStreak();
  }, []);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    await soundService.setSoundEnabled(enabled);
  }, []);

  const toggleSoundEnabled = useCallback(async () => {
    const nextState = !soundEnabled;
    setSoundEnabledState(nextState);
    await soundService.setSoundEnabled(nextState);
  }, [soundEnabled]);

  return {
    soundEnabled,
    playCorrect,
    playIncorrect,
    playTap,
    playLessonComplete,
    playAchievement,
    playStreak,
    setSoundEnabled,
    toggleSoundEnabled,
  };
}
