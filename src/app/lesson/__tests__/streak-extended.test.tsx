import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StreakExtendedScreen from "../streak-extended";
import { useGamification } from "@/contexts/gamification-context";
import { useRouter } from "expo-router";

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockedUseGamification = useGamification as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe("StreakExtendedScreen", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    });
  });

  it("renders 'Bắt đầu chuỗi mới!' when streak is 1", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 1,
      frozenToday: false,
    });

    const { getByText } = await render(<StreakExtendedScreen />);

    expect(getByText("Bắt đầu chuỗi mới!")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
    expect(
      getByText(
        "Khởi đầu tuyệt vời! Hãy chăm chỉ học mỗi ngày để ngọn lửa luôn bùng cháy nhé.",
      ),
    ).toBeTruthy();
  });

  it("renders 'Khiên băng đã bảo vệ bạn!' when frozenToday is true", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 5,
      frozenToday: true,
    });

    const { getByText } = await render(<StreakExtendedScreen />);

    expect(getByText("Khiên băng đã bảo vệ bạn!")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
    expect(
      getByText(
        "Streak Freeze đã giữ trọn vẹn chuỗi học của bạn. Ngọn lửa đã bùng cháy trở lại!",
      ),
    ).toBeTruthy();
  });

  it("renders 'Streak đã tăng!' when streak > 1 and not frozen", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 6,
      frozenToday: false,
    });

    const { getByText } = await render(<StreakExtendedScreen />);

    expect(getByText("Streak đã tăng!")).toBeTruthy();
    expect(getByText("6")).toBeTruthy();
    expect(
      getByText(
        "Tuyệt vời! Bạn đang giữ lửa rất tốt. Hãy tiếp tục học mỗi ngày nhé!",
      ),
    ).toBeTruthy();
  });

  it("navigates back to tabs when TUYỆT VỜI button is pressed", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 2,
      frozenToday: false,
    });

    const { getByText } = await render(<StreakExtendedScreen />);

    fireEvent.press(getByText("TUYỆT VỜI"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });
});
