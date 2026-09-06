import React from "react";
import { render } from "@testing-library/react-native";
import { QuizResultCard } from "@/components/quiz/quiz-result-card";
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
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

describe("QuizResultCard — Stars rendering logic", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: {
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
      isDark: false,
    });
  });

  it("renders 3 stars when cat.stars === 3 (TIMED_REVIEW 3 stars)", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 5,
      wrongCount: 0,
      correctCategories: [{ name: "+20 EXP, +10 Coin", stars: 3 }],
      wrongCategories: [],
    };

    const { getByTestId, getAllByText } = await render(
      <QuizResultCard result={result} />,
    );

    const starsRow = getByTestId("stars-row");
    expect(starsRow).toBeTruthy();
    const stars = getAllByText("⭐");
    expect(stars.length).toBe(3);
  });

  it("renders 2 stars when cat.stars === 2 (TIMED_REVIEW 2 stars)", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 4,
      wrongCount: 1,
      correctCategories: [{ name: "+15 EXP", stars: 2 }],
      wrongCategories: [],
    };

    const { getByTestId, getAllByText } = await render(
      <QuizResultCard result={result} />,
    );

    const starsRow = getByTestId("stars-row");
    expect(starsRow).toBeTruthy();
    const stars = getAllByText("⭐");
    expect(stars.length).toBe(2);
  });

  it("does NOT render stars row or star icons when cat.stars === 0 (NORMAL lesson)", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 5,
      wrongCount: 0,
      correctCategories: [{ name: "+10 EXP, +5 Coin", stars: 0 }],
      wrongCategories: [],
    };

    const { queryByTestId, queryAllByText, getByText } = await render(
      <QuizResultCard result={result} />,
    );

    expect(queryByTestId("stars-row")).toBeNull();
    expect(queryAllByText("⭐").length).toBe(0);
    expect(getByText("+10 EXP, +5 Coin")).toBeTruthy();
  });

  it("renders Hanko seal badge with 'HOÀN HẢO • 大吉' for 100% perfect score", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 5,
      wrongCount: 0,
      correctCategories: [{ name: "+20 EXP", stars: 0 }],
      wrongCategories: [],
    };

    const { getByText } = await render(<QuizResultCard result={result} />);
    expect(getByText("HOÀN HẢO • 大吉")).toBeTruthy();
    expect(getByText("Xuất sắc hoàn hảo!")).toBeTruthy();
  });

  it("renders Hanko seal badge with 'XUẤT SẮC • 皆伝' for score >= 80% with at most 1 mistake", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 4,
      wrongCount: 1,
      correctCategories: [{ name: "+15 EXP", stars: 0 }],
      wrongCategories: [],
    };

    const { getByText } = await render(<QuizResultCard result={result} />);
    expect(getByText("XUẤT SẮC • 皆伝")).toBeTruthy();
    expect(getByText("Làm rất tốt!")).toBeTruthy();
  });

  it("renders 'CỐ GẮNG • 努力' when making 2 mistakes out of 5 questions (60%) instead of unearned Xuất sắc", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 3,
      wrongCount: 2,
      correctCategories: [{ name: "+10 EXP", stars: 0 }],
      wrongCategories: [],
    };

    const { getByText, queryByText } = await render(
      <QuizResultCard result={result} />,
    );
    expect(getByText("CỐ GẮNG • 努力")).toBeTruthy();
    expect(getByText("Cần luyện tập thêm!")).toBeTruthy();
    expect(queryByText("XUẤT SẮC • 皆伝")).toBeNull();
  });

  it("renders 'ĐẠT CHUẨN • 合格' when making 2 mistakes out of 8 questions (75%)", async () => {
    const result = {
      totalQuestions: 8,
      correctCount: 6,
      wrongCount: 2,
      correctCategories: [{ name: "+20 EXP", stars: 0 }],
      wrongCategories: [],
    };

    const { getByText, queryByText } = await render(
      <QuizResultCard result={result} />,
    );
    expect(getByText("ĐẠT CHUẨN • 合格")).toBeTruthy();
    expect(getByText("Hoàn thành bài học!")).toBeTruthy();
    expect(queryByText("XUẤT SẮC • 皆伝")).toBeNull();
  });

  it("renders fail state with 'Hết mạng!' when isFailed is true", async () => {
    const result = {
      totalQuestions: 5,
      correctCount: 2,
      wrongCount: 3,
      correctCategories: [],
      wrongCategories: [],
    };

    const { getByText, queryByText } = await render(
      <QuizResultCard result={result} isFailed={true} />,
    );
    expect(getByText("Hết mạng!")).toBeTruthy();
    expect(queryByText("HOÀN HẢO • 大吉")).toBeNull();
    expect(queryByText("ĐẠT CHUẨN • 合格")).toBeNull();
  });
});

describe("QuizResultScreen — lessonType star calculation", () => {
  const mockSetEnergy = jest.fn();
  const mockAddExp = jest.fn();
  const mockFetchGamificationData = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
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
      setEnergy: mockSetEnergy,
      addExp: mockAddExp,
      fetchGamificationData: mockFetchGamificationData,
    });

    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
    });
  });

  it("shows stars when lessonType is TIMED_REVIEW with starsEarned > 0", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "5",
      wrongCount: "0",
      expEarned: "20",
      starsEarned: "3",
      coinsEarned: "5",
      status: "COMPLETED",
      lessonType: "TIMED_REVIEW",
    });

    const { getByTestId, getAllByText } = await render(<QuizResultScreen />);
    expect(getByTestId("stars-row")).toBeTruthy();
    expect(getAllByText("⭐").length).toBe(3);
  });

  it("does NOT show stars when lessonType is NORMAL even if expEarned > 0", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "10",
      wrongCount: "0",
      expEarned: "20",
      starsEarned: "0",
      coinsEarned: "5",
      status: "COMPLETED",
      lessonType: "NORMAL",
    });

    const { queryByTestId, queryAllByText, getByText } = await render(
      <QuizResultScreen />,
    );
    expect(queryByTestId("stars-row")).toBeNull();
    expect(queryAllByText("⭐").length).toBe(0);
    expect(getByText("+20 EXP, +5 Coin")).toBeTruthy();
  });

  it("does NOT show stars when lessonType is TOPIC_REVIEW", async () => {
    mockedUseLocalSearchParams.mockReturnValue({
      correctCount: "10",
      wrongCount: "0",
      expEarned: "30",
      starsEarned: "0",
      coinsEarned: "10",
      status: "COMPLETED",
      lessonType: "TOPIC_REVIEW",
    });

    const { queryByTestId, queryAllByText, getByText } = await render(
      <QuizResultScreen />,
    );
    expect(queryByTestId("stars-row")).toBeNull();
    expect(queryAllByText("⭐").length).toBe(0);
    expect(getByText("+30 EXP, +10 Coin")).toBeTruthy();
  });
});
