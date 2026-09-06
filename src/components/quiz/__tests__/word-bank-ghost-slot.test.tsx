import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { KanaQuestionCard } from "../kana-question";
import { ThemeProvider } from "@/contexts/theme-context";
import type { KanaQuestion } from "@/types";

const mockQuestion: KanaQuestion = {
  id: "q-1",
  type: "kana",
  instruction: "Sắp xếp các từ thành câu đúng",
  imageUrl: "",
  characters: ["こんにちは", "みなさん"],
  correctOrder: ["みなさん", "こんにちは"],
  blockRomaji: {
    こんにちは: "konnichiwa",
    みなさん: "minasan",
  },
};

describe("KanaQuestionCard - Ghost Slot Word Bank", () => {
  it("places tile into arranged zone and leaves ghost slot, then restores on remove", async () => {
    const handleAnswerChange = jest.fn();

    const { getByText, getByTestId, queryByTestId } = await render(
      <ThemeProvider>
        <KanaQuestionCard
          question={mockQuestion}
          onAnswerChange={handleAnswerChange}
        />
      </ThemeProvider>,
    );

    // Initial state: instruction is shown and placeholder is displayed
    expect(getByText("Sắp xếp các từ thành câu đúng")).toBeTruthy();
    expect(getByText("Chạm vào các từ bên dưới để sắp xếp")).toBeTruthy();
    expect(queryByTestId("ghost-tile-みなさん")).toBeNull();

    // Select "みなさん"
    const minasanBtn = getByTestId("bank-tile-みなさん");
    fireEvent.press(minasanBtn);

    // After pressing, "みなさん" ghost slot appears in bank
    await waitFor(() => {
      expect(getByTestId("ghost-tile-みなさん")).toBeTruthy();
      expect(getByTestId("arranged-tile-0")).toBeTruthy();
    });

    // Now select "こんにちは" to complete the answer
    const konnichiwaBtn = getByTestId("bank-tile-こんにちは");
    fireEvent.press(konnichiwaBtn);

    // Both ghost slots are visible in the bank and validate is called
    await waitFor(() => {
      expect(getByTestId("ghost-tile-こんにちは")).toBeTruthy();
      expect(getByTestId("arranged-tile-1")).toBeTruthy();
      expect(handleAnswerChange).toHaveBeenLastCalledWith(
        true,
        "みなさんこんにちは",
      );
    });

    // Tap first arranged tile ("みなさん") to remove it
    fireEvent.press(getByTestId("arranged-tile-0"));

    // "みなさん" ghost slot disappears from bank and regular bank tile is restored
    await waitFor(() => {
      expect(queryByTestId("ghost-tile-みなさん")).toBeNull();
      expect(getByTestId("bank-tile-みなさん")).toBeTruthy();
      expect(handleAnswerChange).toHaveBeenLastCalledWith(false, "こんにちは");
    });
  });
});
