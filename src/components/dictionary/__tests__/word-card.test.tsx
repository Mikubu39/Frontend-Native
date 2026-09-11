import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { WordCard } from "../word-card";

const mockPlay = jest.fn();

jest.mock("@/hooks/use-audio", () => ({
  useAudio: () => ({
    isPlaying: false,
    play: mockPlay,
    stop: jest.fn(),
  }),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: () => ({
    colors: {
      card: "#ffffff",
      border: "#e5e7eb",
      text: "#111827",
      textSecondary: "#6b7280",
    },
    isDark: false,
  }),
}));

describe("WordCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const entry = {
    id: "1",
    kanji: "水",
    romaji: "mizu",
    meaning: "Nước",
    audioUrl: "https://example.com/mizu.mp3",
  };

  it("renders kanji, romaji, and meaning correctly", async () => {
    const { getByText } = await render(<WordCard entry={entry} />);

    expect(getByText("水")).toBeTruthy();
    expect(getByText("mizu")).toBeTruthy();
    expect(getByText("Nước")).toBeTruthy();
  });

  it("calls play audio when speaker button is pressed", async () => {
    const { getByRole } = await render(<WordCard entry={entry} />);

    const button = getByRole("button");
    fireEvent.press(button);

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });
});
