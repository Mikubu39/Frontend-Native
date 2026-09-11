import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { roadmapApi } from "@/services/api/roadmap";
import type { RoadmapTopicResponse } from "@/types";
import LearnScreen from "../index";

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/services/api/roadmap", () => ({
  roadmapApi: { getRoadmap: jest.fn() },
}));

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return { BlurView: View };
});

const mockedUseGamification = useGamification as unknown as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedGetRoadmap = roadmapApi.getRoadmap as jest.Mock;

const DEMO_TOPICS: RoadmapTopicResponse[] = [
  {
    topicId: 1,
    topicTitle: "Chào hỏi hằng ngày",
    lessons: [
      {
        lessonId: 1,
        title: "Konnichiwa",
        lessonType: "NORMAL",
        orderIndex: 1,
        status: "COMPLETED",
        starsEarned: 3,
        entryCostEnergy: 5,
      },
      {
        lessonId: 2,
        title: "Arigatou",
        lessonType: "NORMAL",
        orderIndex: 2,
        status: "UNLOCKED",
        starsEarned: 0,
        entryCostEnergy: 5,
      },
      {
        lessonId: 3,
        title: "Bai Kiem Tra",
        lessonType: "JUMP_TEST",
        orderIndex: 3,
        status: "LOCKED",
        starsEarned: 0,
        entryCostEnergy: 10,
      },
    ],
  },
];

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      primary: "#8B5CF6",
      secondary: "#EC4899",
      text: "#1F2937",
      textSecondary: "#6B7280",
      background: "#FFFFFF",
      border: "#E5E7EB",
      borderSubtle: "#F3F4F6",
      backgroundElement: "#F9FAFB",
    },
  });
  mockedUseGamification.mockReturnValue({
    energy: 25,
    maxEnergy: 25,
    streak: 5,
    streakStatus: "UNLIT",
    studiedToday: false,
    frozenToday: false,
    coins: 120,
    streakFreezeCount: 1,
    refillEnergy: jest.fn(),
    watchAdToRefill: jest.fn(),
  });
  mockedGetRoadmap.mockResolvedValue(DEMO_TOPICS);
});

describe("Lộ trình — Tính năng Duolingo Polish", () => {
  it("mở Sổ tay Hướng dẫn GuidebookSheet khi chạm nút HƯỚNG DẪN", async () => {
    const { getByText, queryByText } = await render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <LearnScreen />
      </SafeAreaProvider>,
    );

    // Chờ bản đồ tải xong và thanh chủ đề hiển thị
    await waitFor(() => {
      expect(getByText("HƯỚNG DẪN")).toBeTruthy();
    });

    // Ban đầu chưa hiện nội dung sổ tay
    expect(queryByText("TỔNG QUAN & NGỮ PHÁP")).toBeNull();

    // Chạm vào nút "HƯỚNG DẪN"
    fireEvent.press(getByText("HƯỚNG DẪN"));

    // Sổ tay mở ra hiển thị nội dung
    await waitFor(() => {
      expect(getByText("TỔNG QUAN & NGỮ PHÁP")).toBeTruthy();
      expect(getByText("ĐÃ HIỂU →")).toBeTruthy();
    });

    // Đóng sổ tay
    fireEvent.press(getByText("ĐÃ HIỂU →"));

    await waitFor(() => {
      expect(queryByText("TỔNG QUAN & NGỮ PHÁP")).toBeNull();
    });
  });

  it("mở StreakModal khi chạm vào StatPill ngọn lửa streak", async () => {
    const { getAllByText, queryByText } = await render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <LearnScreen />
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });

    // Chưa mở modal streak
    expect(queryByText("NGÀY HỌC LIÊN TIẾP")).toBeNull();

    // Chạm vào StatPill streak (giá trị '5')
    fireEvent.press(getAllByText("5")[0]);

    // StreakModal hiện ra
    await waitFor(() => {
      expect(queryByText("NGÀY HỌC LIÊN TIẾP")).toBeTruthy();
      expect(queryByText("TIẾP TỤC HỌC →")).toBeTruthy();
    });

    // Đóng modal
    fireEvent.press(queryByText("TIẾP TỤC HỌC →")!);

    await waitFor(() => {
      expect(queryByText("NGÀY HỌC LIÊN TIẾP")).toBeNull();
    });
  });

  it("mở popup bài học và đóng lại khi chạm ra ngoài lớp nền trong suốt", async () => {
    const { getByLabelText, getByTestId, queryByTestId, queryByText } =
      await render(
        <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
          <LearnScreen />
        </SafeAreaProvider>,
      );

    await waitFor(() => {
      expect(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành")).toBeTruthy();
    });

    // Ban đầu chưa mở popup bài học
    expect(queryByTestId("popover-backdrop")).toBeNull();

    // Chạm vào bài học Konnichiwa
    fireEvent.press(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành"));

    // Popup hiện lên với nút hành động và backdrop
    await waitFor(() => {
      expect(getByTestId("popover-backdrop")).toBeTruthy();
      expect(queryByText("Konnichiwa")).toBeTruthy();
    });

    // Chạm ra ngoài lớp nền trong suốt
    fireEvent.press(getByTestId("popover-backdrop"));

    // Popup lập tức đóng lại
    await waitFor(() => {
      expect(queryByTestId("popover-backdrop")).toBeNull();
      expect(queryByText("ÔN TẬP LẠI →")).toBeNull();
    });
  });

  it("hiển thị Miễn phí ⚡ và nút ÔN TẬP LẠI → cho bài đã hoàn thành (COMPLETED)", async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
        <LearnScreen />
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành")).toBeTruthy();
    });

    // Chạm vào bài học Konnichiwa (COMPLETED)
    fireEvent.press(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành"));

    await waitFor(() => {
      // Hiển thị miễn phí năng lượng và nút ôn tập lại
      expect(getByText("Miễn phí ⚡")).toBeTruthy();
      expect(getByText("ÔN TẬP LẠI →")).toBeTruthy();
      // Không hiện năng lượng tốn phí
      expect(queryByText("5 ⚡ năng lượng")).toBeNull();
    });
  });

  it("cho phép mở và học lại bài COMPLETED khi có 0 năng lượng, nhưng chặn bài chưa học", async () => {
    // Giả lập người dùng hết năng lượng (0 ⚡)
    mockedUseGamification.mockReturnValue({
      energy: 0,
      maxEnergy: 25,
      streak: 5,
      streakStatus: "UNLIT",
      studiedToday: false,
      frozenToday: false,
      coins: 120,
      streakFreezeCount: 1,
      refillEnergy: jest.fn(),
      watchAdToRefill: jest.fn(),
    });

    const { getByLabelText, getByText, queryByText, getByTestId } =
      await render(
        <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
          <LearnScreen />
        </SafeAreaProvider>,
      );

    await waitFor(() => {
      expect(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành")).toBeTruthy();
    });

    // 1. Chạm vào bài đã hoàn thành khi 0 năng lượng: vẫn mở bình thường!
    fireEvent.press(getByLabelText("Bài học: Konnichiwa. Đã hoàn thành"));

    await waitFor(() => {
      expect(getByText("Miễn phí ⚡")).toBeTruthy();
      expect(getByText("ÔN TẬP LẠI →")).toBeTruthy();
      // Không bật popup báo hết năng lượng
      expect(queryByText("Hết năng lượng!")).toBeNull();
    });

    // Đóng popup bài cũ
    fireEvent.press(getByTestId("popover-backdrop"));

    // 2. Chạm vào bài chưa học (Arigatou - UNLOCKED) khi 0 năng lượng: chặn và hiện modal hết năng lượng!
    await waitFor(() => {
      expect(getByLabelText("Bài học: Arigatou. Đang mở khóa")).toBeTruthy();
    });
    fireEvent.press(getByLabelText("Bài học: Arigatou. Đang mở khóa"));

    await waitFor(() => {
      expect(getByText("Hết năng lượng!")).toBeTruthy();
      expect(
        getByText(
          "Bạn cần năng lượng để bắt đầu bài học mới. Năng lượng tối đa là 25. Hãy mua bằng xu hoặc xem quảng cáo để hồi phục.",
        ),
      ).toBeTruthy();
    });
  });
});
