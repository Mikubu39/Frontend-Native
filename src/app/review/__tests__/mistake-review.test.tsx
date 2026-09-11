import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MistakeReviewScreen from "../mistakes";
import { mistakesApi } from "@/services/api/mistakes";
import { useTheme } from "@/contexts/theme-context";

jest.mock("@/services/api/mistakes", () => ({
  mistakesApi: {
    startReview: jest.fn(),
    submitReview: jest.fn(),
    getSummary: jest.fn(),
  },
}));

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: () => ({
    setEnergy: jest.fn(),
  }),
}));

jest.mock("@/contexts/toast-context", () => ({
  useToast: () => ({
    showError: jest.fn(),
  }),
}));

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

const mockPlayCorrect = jest.fn();
const mockPlayIncorrect = jest.fn();
jest.mock("@/hooks/use-sound-effect", () => ({
  useSoundEffect: () => ({
    playCorrect: mockPlayCorrect,
    playIncorrect: mockPlayIncorrect,
  }),
}));

const mockedApi = mistakesApi as jest.Mocked<typeof mistakesApi>;
const mockedUseTheme = useTheme as jest.Mock;

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const MOCK_QUESTIONS: any[] = [
  {
    questionId: 101,
    questionType: "TRANSLATE_TO_VN",
    content: "こんにちは nghĩa là gì?",
    options: [
      {
        optionId: 1,
        content: "Xin chào",
        isCorrect: true,
        order: 1,
      },
      {
        optionId: 2,
        content: "Tạm biệt",
        isCorrect: false,
        order: 2,
      },
    ],
  },
];

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <MistakeReviewScreen />
    </SafeAreaProvider>,
  );
}

describe("Luyện tập Lỗi Sai (Mistake Review)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        background: "#FFF",
        card: "#FFF",
        border: "#EEE",
        text: "#000",
        textSecondary: "#666",
        cardQuiz: "#FFF",
        cardQuizBorder: "#EEE",
      },
    });
    mockedApi.startReview.mockResolvedValue({
      questions: MOCK_QUESTIONS,
      message: null,
    });
    mockedApi.submitReview.mockResolvedValue({
      results: [
        { questionId: 101, correct: true, correctOptionId: 1, resolved: true },
      ],
      resolvedCount: 1,
      energyRewarded: 5,
      currentEnergy: 25,
    });
    mockedApi.getSummary.mockResolvedValue({
      activeCount: 0,
      reviewableToday: 1,
    });
  });

  it("phản hồi đúng và phát âm thanh đúng khi chọn đáp án có isCorrect = true", async () => {
    const screen = await renderScreen();

    const answerOption = await screen.findByTestId("answer-1");
    expect(answerOption).toBeTruthy();

    // Chọn đáp án đúng
    await fireEvent.press(answerOption);

    // Đợi state update và bấm KIỂM TRA
    const checkButton = await screen.findByText("KIỂM TRA");
    await fireEvent.press(checkButton);

    // Phát âm thanh đúng và hiện feedback Tuyệt vời
    await waitFor(() => {
      expect(mockPlayCorrect).toHaveBeenCalledTimes(1);
    });
    expect(mockPlayIncorrect).not.toHaveBeenCalled();
    expect(await screen.findByText("Tuyệt vời!")).toBeTruthy();

    // Nút chuyển thành ĐÃ HOÀN THÀNH (câu cuối)
    const finishButton = await screen.findByText("ĐÃ HOÀN THÀNH");
    await fireEvent.press(finishButton);

    await waitFor(() => {
      expect(mockedApi.submitReview).toHaveBeenCalledWith({
        answers: [
          {
            questionId: 101,
            selectedOptionId: 1,
            isCorrect: true,
          },
        ],
      });
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/quiz/result",
          params: expect.objectContaining({
            correctCount: 1,
            wrongCount: 0,
            energyRewarded: 5,
            lessonType: "REVIEW_MISTAKES",
          }),
        }),
      );
    });
  });
});
