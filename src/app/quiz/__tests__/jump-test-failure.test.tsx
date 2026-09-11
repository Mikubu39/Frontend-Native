/**
 * Integration tests: Màn hình kết quả JUMP_TEST khi thất bại (hết mạng / status IN_PROGRESS)
 * Đảm bảo hiển thị đúng nhãn "Hết mạng!", con dấu "THỬ LẠI", phát âm thanh sai và điều hướng chuẩn.
 */
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import QuizResultScreen from "../result";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { useLocalSearchParams, useRouter } from "expo-router";

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

const mockPlayIncorrect = jest.fn();
const mockPlayLessonComplete = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

describe("JUMP_TEST Failure Flow — Màn hình kết quả khi hết tim", () => {
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
      playAchievement: jest.fn(),
      playStreak: jest.fn(),
      soundEnabled: true,
      setSoundEnabled: jest.fn(),
      toggleSoundEnabled: jest.fn(),
    });
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: mockBack,
    });
    mockedUseGamification.mockReturnValue({
      fetchGamificationData: jest.fn(),
      newlyUnlockedAchievements: [],
    });
  });

  it("hiển thị chính xác trạng thái Thất bại khi bài thi vượt bị hết mạng", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "2",
      wrongCount: "3",
      expEarned: "0",
      starsEarned: "0",
      coinsEarned: "0",
      status: "IN_PROGRESS",
      lessonType: "JUMP_TEST",
    });

    const { getByText, queryByText } = await render(<QuizResultScreen />);

    // Phải hiện tiêu đề Hết mạng và thống kê số câu đúng/sai
    expect(getByText("Hết mạng!")).toBeTruthy();
    expect(getByText("Đúng")).toBeTruthy();
    expect(getByText("Sai")).toBeTruthy();
    expect(getByText("+0 EXP")).toBeTruthy();

    // Không được hiện các tiêu đề chúc mừng hoàn thành
    expect(queryByText("Xuất sắc hoàn hảo!")).toBeNull();
    expect(queryByText("Hoàn thành bài học!")).toBeNull();

    // Phát âm thanh thất bại
    expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayLessonComplete).not.toHaveBeenCalled();
  });

  it("cho phép bấm 'Thử Lại' để quay lại chuẩn bị thi lại", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "1",
      wrongCount: "3",
      expEarned: "0",
      starsEarned: "0",
      coinsEarned: "0",
      status: "IN_PROGRESS",
      lessonType: "JUMP_TEST",
    });

    const { getByText } = await render(<QuizResultScreen />);

    const retryBtn = getByText("Thử Lại");
    fireEvent.press(retryBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("cho phép bấm 'Tiếp Tục' để quay về lộ trình học mà không nhận phần thưởng", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "1",
      wrongCount: "3",
      expEarned: "0",
      starsEarned: "0",
      coinsEarned: "0",
      status: "IN_PROGRESS",
      lessonType: "JUMP_TEST",
    });

    const { getByText } = await render(<QuizResultScreen />);

    const continueBtn = getByText("Tiếp Tục");
    await fireEvent.press(continueBtn);

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });
});
