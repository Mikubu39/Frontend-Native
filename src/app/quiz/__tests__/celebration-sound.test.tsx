/**
 * Integration tests: mỗi màn hình ăn mừng (kết quả bài học, thành tựu, streak)
 * phải phát đúng hiệu ứng âm thanh riêng biệt của nó khi hiển thị.
 */
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import QuizResultScreen from "../result";
import AchievementUnlockedScreen from "../../profile/achievement-unlocked";
import StreakExtendedScreen from "../../lesson/streak-extended";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RESULT_IMPACT_MS } from "@/components/quiz/quiz-result-card";

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));
jest.mock("@/hooks/use-sound-effect", () => ({
  useSoundEffect: jest.fn(),
}));
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseSoundEffect = useSoundEffect as jest.Mock;
const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

const mockPlayLessonComplete = jest.fn();
const mockPlayIncorrect = jest.fn();
const mockPlayAchievement = jest.fn();
const mockPlayStreak = jest.fn();

describe("Celebration screens — hiệu ứng âm thanh riêng biệt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: {
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        card: "#FFFFFF",
        border: "#E5E7EB",
        background: "#FFFFFF",
      },
      isDark: false,
    });
    mockedUseSoundEffect.mockReturnValue({
      playCorrect: jest.fn(),
      playIncorrect: mockPlayIncorrect,
      playLessonComplete: mockPlayLessonComplete,
      playAchievement: mockPlayAchievement,
      playStreak: mockPlayStreak,
      soundEnabled: true,
      setSoundEnabled: jest.fn(),
      toggleSoundEnabled: jest.fn(),
    });
    mockedUseRouter.mockReturnValue({
      replace: jest.fn(),
      push: jest.fn(),
      back: jest.fn(),
    });
  });

  it("phát âm thanh Hoàn thành bài học khi màn kết quả hiện ra (không rớt bài)", async () => {
    mockedUseGamification.mockReturnValue({
      fetchGamificationData: jest.fn(),
      newlyUnlockedAchievements: [],
    });
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "5",
      wrongCount: "0",
      expEarned: "20",
      starsEarned: "0",
      coinsEarned: "5",
      status: "COMPLETED",
      lessonType: "NORMAL",
    });

    await render(<QuizResultScreen />);

    // Tiếng fanfare cố ý chờ con dấu hanko chạm giấy chứ không phát ngay khi
    // màn hình mở — âm và hình phải rơi vào đúng một khoảnh khắc.
    expect(mockPlayLessonComplete).not.toHaveBeenCalled();

    await waitFor(
      () => expect(mockPlayLessonComplete).toHaveBeenCalledTimes(1),
      { timeout: RESULT_IMPACT_MS + 1000 },
    );
    expect(mockPlayIncorrect).not.toHaveBeenCalled();
  });

  it("phát âm thanh Sai (không phải Hoàn thành) khi bài học bị rớt (hết mạng)", async () => {
    mockedUseGamification.mockReturnValue({
      fetchGamificationData: jest.fn(),
      newlyUnlockedAchievements: [],
    });
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "1",
      wrongCount: "3",
      expEarned: "0",
      starsEarned: "0",
      coinsEarned: "0",
      status: "IN_PROGRESS",
      lessonType: "JUMP_TEST",
    });

    await render(<QuizResultScreen />);

    expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayLessonComplete).not.toHaveBeenCalled();
  });

  it("phát âm thanh Thành tựu khi màn mở khoá thành tựu hiện ra", async () => {
    mockedUseGamification.mockReturnValue({
      newlyUnlockedAchievements: [
        {
          code: "FIRST_LESSON",
          name: "Bài học đầu tiên",
          description: "Hoàn thành bài học đầu tiên",
        },
      ],
      clearNewlyUnlockedAchievements: jest.fn(),
    });

    await render(<AchievementUnlockedScreen />);

    expect(mockPlayAchievement).toHaveBeenCalledTimes(1);
  });

  it("không phát âm thanh Thành tựu nếu không có thành tựu mới nào", async () => {
    mockedUseGamification.mockReturnValue({
      newlyUnlockedAchievements: [],
      clearNewlyUnlockedAchievements: jest.fn(),
    });

    await render(<AchievementUnlockedScreen />);

    expect(mockPlayAchievement).not.toHaveBeenCalled();
  });

  it("phát âm thanh Streak khi màn nối dài streak hiện ra", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 5,
      frozenToday: false,
    });

    await render(<StreakExtendedScreen />);

    expect(mockPlayStreak).toHaveBeenCalledTimes(1);
  });
});
