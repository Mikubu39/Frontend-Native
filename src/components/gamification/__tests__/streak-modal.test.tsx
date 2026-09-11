import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StreakModal } from "../streak-modal";
import { ThemeProvider } from "@/contexts/theme-context";
import { useGamification } from "@/contexts/gamification-context";

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockedUseGamification = useGamification as jest.Mock;

describe("StreakModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseGamification.mockReturnValue({
      streak: 7,
      streakStatus: "ACTIVE",
      studiedToday: true,
      frozenToday: false,
      streakFreezeCount: 2,
      studyDates: [],
    });
  });

  it("renders streak information, 7-day calendar, and streak freeze status", async () => {
    const handleClose = jest.fn();

    const { getByText } = await render(
      <ThemeProvider>
        <StreakModal visible={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    // Verify streak count and label
    expect(getByText("7")).toBeTruthy();
    expect(getByText("NGÀY HỌC LIÊN TIẾP")).toBeTruthy();
    expect(getByText("ĐÃ GIỮ LỬA HÔM NAY")).toBeTruthy();

    // Verify calendar weekdays
    expect(getByText("T2")).toBeTruthy();
    expect(getByText("CN")).toBeTruthy();

    // Verify streak freeze details
    expect(getByText("Đóng băng chuỗi")).toBeTruthy();
    expect(getByText("Đang trang bị 2 lượt bảo vệ chuỗi.")).toBeTruthy();

    // Verify close
    const closeBtn = getByText("TIẾP TỤC HỌC →");
    fireEvent.press(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in UNLIT state (chưa học hôm nay)", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 5,
      streakStatus: "UNLIT",
      studiedToday: false,
      frozenToday: false,
      streakFreezeCount: 0,
      studyDates: [],
    });

    const { getByText } = await render(
      <ThemeProvider>
        <StreakModal visible={true} onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(getByText("5")).toBeTruthy();
    expect(getByText("CHƯA HỌC HÔM NAY")).toBeTruthy();
    expect(
      getByText(
        "Hôm nay bạn chưa học bài. Hãy hoàn thành 1 bài học ngay để thắp sáng và giữ vững chuỗi ngày học nhé!",
      ),
    ).toBeTruthy();
    expect(getByText("MUA")).toBeTruthy();
  });

  it("renders correctly in FROZEN state (khiên băng đang bảo vệ)", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 12,
      streakStatus: "FROZEN",
      studiedToday: false,
      frozenToday: true,
      streakFreezeCount: 1,
      studyDates: [],
    });

    const { getByText } = await render(
      <ThemeProvider>
        <StreakModal visible={true} onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(getByText("12")).toBeTruthy();
    expect(getByText("ĐANG ĐÓNG BĂNG")).toBeTruthy();
    expect(
      getByText(
        "Chuỗi ngày học đang được bảo vệ an toàn bằng Đóng băng chuỗi. Hãy học hôm nay để ngọn lửa bùng cháy trở lại!",
      ),
    ).toBeTruthy();
  });

  it("only marks days present in studyDates as completed", async () => {
    mockedUseGamification.mockReturnValue({
      streak: 3,
      streakStatus: "ACTIVE",
      studiedToday: true,
      frozenToday: false,
      streakFreezeCount: 0,
      studyDates: ["2026-09-03"],
    });

    const { getByText } = await render(
      <ThemeProvider>
        <StreakModal visible={true} onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(getByText("3")).toBeTruthy();
    expect(getByText("T2")).toBeTruthy();
    expect(getByText("CN")).toBeTruthy();
  });

  it("returns null when visible is false", async () => {
    const { queryByText } = await render(
      <ThemeProvider>
        <StreakModal visible={false} onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(queryByText("NGÀY HỌC LIÊN TIẾP")).toBeNull();
  });
});
