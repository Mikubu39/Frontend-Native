/**
 * Màn kết quả sau khi ôn tập (từ vựng / lỗi sai) — kiểm thử tích hợp.
 *
 * Điều cần bảo vệ: trước đây làm xong một phiên ôn (tối đa 20 từ hoặc 10 lỗi
 * mỗi lượt) thì bị đá thẳng về trang chủ, dù backlog còn hàng chục/hàng trăm
 * mục khác. Giờ nếu server báo còn `remainingCount` > 0 cho một phiên ôn tập,
 * màn kết quả phải mời "Ôn Tiếp" ngay tại chỗ thay vì bắt người dùng tự quay
 * lại tab Review và bấm lại từ đầu.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import QuizResultScreen from "../result";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe("QuizResultScreen — mời ôn tiếp khi còn backlog", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: {
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
      isDark: false,
    });
    mockedUseGamification.mockReturnValue({
      setEnergy: jest.fn(),
      addExp: jest.fn(),
      fetchGamificationData: jest.fn(),
      newlyUnlockedAchievements: [],
    });
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
      back: jest.fn(),
      push: jest.fn(),
    });
  });

  it("hiện nút Ôn Tiếp và điều hướng lại /review/vocabulary khi còn từ tới hạn", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "18",
      wrongCount: "2",
      lessonType: "REVIEW_VOCAB",
      status: "COMPLETED",
      remainingCount: "184",
    });

    const { getByText, queryByText } = await render(<QuizResultScreen />);

    expect(getByText("Ôn Tiếp (184)")).toBeTruthy();
    expect(queryByText("Tiếp Tục")).toBeNull();

    fireEvent.press(getByText("Ôn Tiếp (184)"));
    expect(mockReplace).toHaveBeenCalledWith("/review/vocabulary");
  });

  it("hiện nút Ôn Tiếp và điều hướng lại /review/mistakes khi còn lỗi active", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "8",
      wrongCount: "2",
      lessonType: "REVIEW_MISTAKES",
      status: "COMPLETED",
      remainingCount: "15",
    });

    const { getByText } = await render(<QuizResultScreen />);

    fireEvent.press(getByText("Ôn Tiếp (15)"));
    expect(mockReplace).toHaveBeenCalledWith("/review/mistakes");
  });

  it("hết backlog thì quay lại nút Tiếp Tục / Thử Lại như cũ", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "20",
      wrongCount: "0",
      lessonType: "REVIEW_VOCAB",
      status: "COMPLETED",
      remainingCount: "0",
    });

    const { getByText, queryByText } = await render(<QuizResultScreen />);

    expect(getByText("Tiếp Tục")).toBeTruthy();
    expect(getByText("Thử Lại")).toBeTruthy();
    expect(queryByText(/Ôn Tiếp/)).toBeNull();
  });

  it("bài học NORMAL bình thường không bao giờ hiện nút Ôn Tiếp dù có remainingCount rác", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "10",
      wrongCount: "0",
      expEarned: "20",
      coinsEarned: "5",
      lessonType: "NORMAL",
      status: "COMPLETED",
      remainingCount: "99",
    });

    const { getByText, queryByText } = await render(<QuizResultScreen />);

    expect(getByText("Tiếp Tục")).toBeTruthy();
    expect(queryByText(/Ôn Tiếp/)).toBeNull();
  });
});
