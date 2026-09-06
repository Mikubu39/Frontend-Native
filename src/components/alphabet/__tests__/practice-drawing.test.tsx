import React from "react";
import { render } from "@testing-library/react-native";
import { PracticeDrawing } from "../practice-drawing";
import { useTheme } from "@/contexts/theme-context";
import { AlphabetPracticeQuestion } from "@/types/alphabet";

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const mockedUseTheme = useTheme as jest.Mock;

describe("PracticeDrawing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        text: "#1A1A2E",
        textSecondary: "#6B7280",
        background: "#FFF8E7",
        card: "#FFFFFF",
        border: "#E5E7EB",
        borderSubtle: "#F3F4F6",
      },
    });
  });

  it("shows standard stroke-order hint when strokeOrderData is available", async () => {
    const question: AlphabetPracticeQuestion = {
      characterId: 1,
      questionType: "DRAWING",
      prompt: "Viết chữ: a",
      audioUrl: null,
      symbol: "あ",
      strokeOrderData: JSON.stringify([
        { strokeNum: 1, path: "M 10 50 L 90 50" },
      ]),
      options: [],
    };

    const { getByText } = await render(
      <PracticeDrawing question={question} onComplete={jest.fn()} />,
    );

    expect(getByText("Viết chữ: a")).toBeTruthy();
    expect(
      getByText("Tô theo nét mờ, đúng thứ tự và đúng chiều."),
    ).toBeTruthy();
  });

  it("shows free-drawing hint when strokeOrderData is null", async () => {
    const question: AlphabetPracticeQuestion = {
      characterId: 10,
      questionType: "DRAWING",
      prompt: "Viết chữ: kyo",
      audioUrl: null,
      symbol: "きょ",
      strokeOrderData: null,
      options: [],
    };

    const { getByText } = await render(
      <PracticeDrawing question={question} onComplete={jest.fn()} />,
    );

    expect(getByText("Viết chữ: kyo")).toBeTruthy();
    expect(getByText("Viết tự do theo chữ mẫu mờ bên dưới.")).toBeTruthy();
  });
});
