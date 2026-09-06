/**
 * useSoundEffect Hook
 *
 * Hook cung cấp các hàm phát âm thanh Đúng/Sai và điều khiển cài đặt SFX:
 * - `playCorrect()`: Phát âm thanh chuông khi trả lời đúng
 * - `playIncorrect()`: Phát âm thanh trầm khi trả lời sai
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

  const playCorrect = useCallback(() => {
    soundService.playCorrect();
  }, []);

  const playIncorrect = useCallback(() => {
    soundService.playIncorrect();
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
    setSoundEnabled,
    toggleSoundEnabled,
  };
}
