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
});
