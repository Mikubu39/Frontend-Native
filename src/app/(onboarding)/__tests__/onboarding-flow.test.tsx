import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import GoalScreen from "../goal";
import InterestsScreen from "../interests";
import LevelScreen from "../level";
import PlacementScreen from "../placement";
import { placementApi } from "@/services/api/placement";
import type { PlacementRoundResponse } from "@/types/api";

jest.mock("@/services/api/placement", () => ({
  placementApi: {
    start: jest.fn(),
    answer: jest.fn(),
  },
}));

const mockedPlacementApi = placementApi as jest.Mocked<typeof placementApi>;

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: () => ({
    colors: {
      background: "#1C1C24",
      card: "#262631",
      border: "#3F3F4E",
      text: "#F9FAFB",
      textSecondary: "#9CA3AF",
      cardQuiz: "#262631",
      cardQuizBorder: "#3F3F4E",
      backgroundElement: "#2A2A35",
      borderSubtle: "#2A2A35",
    },
    isDark: true,
    theme: "dark",
    themeMode: "dark",
    setThemeMode: jest.fn(),
  }),
}));

const mockPlay = jest.fn();
const mockStop = jest.fn();

jest.mock("@/hooks/use-audio", () => ({
  useAudio: () => ({
    isPlaying: false,
    play: mockPlay,
    stop: mockStop,
  }),
}));

describe("Onboarding Flow & Placement Test — Theme & Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GoalScreen", () => {
    it("renders goal screen with dynamic theme and advances when selecting a goal", async () => {
      await render(
        <OnboardingProvider>
          <GoalScreen />
        </OnboardingProvider>,
      );

      expect(screen.getByText("Mục tiêu của bạn là gì?")).toBeTruthy();
      expect(screen.getByText("Giao tiếp tiếng Nhật")).toBeTruthy();

      // Select a goal
      await fireEvent.press(screen.getByText("Giao tiếp tiếng Nhật"));

      // Click Tiếp tục
      const continueBtn = screen.getByText("TIẾP TỤC");
      await fireEvent.press(continueBtn);

      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/interests");
    });
  });

  describe("InterestsScreen", () => {
    it("renders interest grid and advances when at least one interest is chosen", async () => {
      await render(
        <OnboardingProvider>
          <InterestsScreen />
        </OnboardingProvider>,
      );

      expect(screen.getByText("Sở thích của bạn là gì?")).toBeTruthy();
      expect(screen.getByText("Du lịch")).toBeTruthy();

      // Select an interest
      await fireEvent.press(screen.getByText("Du lịch"));

      // Click Tiếp tục
      const continueBtn = screen.getByText("TIẾP TỤC");
      await fireEvent.press(continueBtn);

      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/level");
    });
  });

  describe("LevelScreen", () => {
    it("renders 2 clear Duolingo-style level cards without fake dropdown", async () => {
      await render(
        <OnboardingProvider>
          <LevelScreen />
        </OnboardingProvider>,
      );

      expect(screen.getByText("Trình độ của bạn là gì?")).toBeTruthy();
      expect(screen.getByText("Tôi mới bắt đầu từ con số 0")).toBeTruthy();
      expect(screen.getByText("Tôi đã biết một chút tiếng Nhật")).toBeTruthy();
      // Dropdown giả đã bị loại bỏ
      expect(screen.queryByText("Chọn trình độ hiện tại của bạn")).toBeNull();
    });

    it("navigates directly to tabs if starter is chosen", async () => {
      await render(
        <OnboardingProvider>
          <LevelScreen />
        </OnboardingProvider>,
      );

      await fireEvent.press(screen.getByText("Tôi mới bắt đầu từ con số 0"));
      expect(screen.getByText("BẮT ĐẦU HỌC")).toBeTruthy();

      await fireEvent.press(screen.getByText("BẮT ĐẦU HỌC"));
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("navigates to placement test if beginner is chosen", async () => {
      await render(
        <OnboardingProvider>
          <LevelScreen />
        </OnboardingProvider>,
      );

      await fireEvent.press(
        screen.getByText("Tôi đã biết một chút tiếng Nhật"),
      );
      expect(screen.getByText("LÀM BÀI KIỂM TRA ĐẦU VÀO")).toBeTruthy();

      await fireEvent.press(screen.getByText("LÀM BÀI KIỂM TRA ĐẦU VÀO"));
      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/placement");
    });
  });

  describe("PlacementScreen", () => {
    const ROUND_1: PlacementRoundResponse = {
      attemptId: 999,
      finished: false,
      roundNumber: 1,
      probeTopicId: 7,
      probeTopicTitle: "Động từ và sinh hoạt hằng ngày",
      questions: [
        {
          questionId: 101,
          questionType: "TRANSLATE_TO_VN",
          content: "「ねこ」nghĩa là gì?",
          metadataJson: { kana: "ねこ", romaji: "neko" },
          options: [
            { optionId: 1, content: "Con mèo", isCorrect: true },
            { optionId: 2, content: "Con chó", isCorrect: false },
          ],
        },
      ],
    };

    const FINISHED_RESULT: PlacementRoundResponse = {
      attemptId: 999,
      finished: true,
      resultTopicId: 7,
      resultTopicTitle: "Động từ và sinh hoạt hằng ngày",
      expEarned: 50,
      coinsEarned: 15,
    };

    beforeEach(() => {
      mockedPlacementApi.start.mockResolvedValue(ROUND_1);
      mockedPlacementApi.answer.mockResolvedValue(FINISHED_RESULT);
    });

    it("calls placementApi.start() and renders the first round's question", async () => {
      await render(<PlacementScreen />);

      await waitFor(() => {
        expect(mockedPlacementApi.start).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(screen.getByText(/Động từ và sinh hoạt hằng ngày/)).toBeTruthy();
      });
      expect(screen.getByText("Con mèo")).toBeTruthy();
    });

    it("submits the round's answers, shows the result screen, and navigates to tabs", async () => {
      await render(<PlacementScreen />);

      await waitFor(() => {
        expect(screen.getByText("Con mèo")).toBeTruthy();
      });

      await fireEvent.press(screen.getByTestId("answer-1"));
      await fireEvent.press(screen.getByText("TIẾP TỤC"));

      await waitFor(() => {
        expect(mockedPlacementApi.answer).toHaveBeenCalledWith(999, {
          answers: [{ questionId: 101, selectedOptionId: 1 }],
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Hoàn thành bài kiểm tra!")).toBeTruthy();
      });
      expect(screen.getByText(/Động từ và sinh hoạt hằng ngày/)).toBeTruthy();
      expect(screen.getByText("+50 EXP · +15 xu")).toBeTruthy();

      await fireEvent.press(screen.getByText("BẮT ĐẦU HỌC"));
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("skips gracefully (goes straight to tabs) when the user is not eligible for placement", async () => {
      mockedPlacementApi.start.mockRejectedValue(new Error("409 Conflict"));

      await render(<PlacementScreen />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
      });
    });
  });
});
