import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DictionaryScreen from "../dictionary";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";

const mockPlay = jest.fn();

jest.mock("@/services/api/vocabulary", () => ({
  vocabularyApi: {
    getLearned: jest.fn(),
  },
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/hooks/use-audio", () => ({
  useAudio: (url?: string, fallback?: string) => ({
    isPlaying: false,
    play: () => mockPlay(url, fallback),
    stop: jest.fn(),
  }),
}));

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require("react");
  return {
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

const mockedGetLearned = vocabularyApi.getLearned as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

const MOCK_ITEMS = [
  {
    id: 1,
    surface: "水",
    romaji: "mizu",
    meaningVn: "Nước",
    audioUrl: "/uploads/audios/words/mizu.mp3",
    due: false,
  },
  {
    id: 2,
    surface: "お茶",
    romaji: "ocha",
    meaningVn: "Trà",
    audioUrl: null, // Test fallback to /uploads/audios/words/ocha.mp3
    due: true,
  },
];

describe("DictionaryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: Colors.light,
      isDark: false,
    });
    mockedGetLearned.mockResolvedValue({
      items: MOCK_ITEMS,
      dueCount: 1,
      learnedCount: 2,
    });
  });

  const renderScreen = async () => {
    return await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <DictionaryScreen />
      </SafeAreaProvider>,
    );
  };

  it("loads and displays learned words and due count pill", async () => {
    const { getByText } = await renderScreen();

    await waitFor(() => {
      expect(mockedGetLearned).toHaveBeenCalledWith(100);
      expect(getByText("Sổ tay của tôi")).toBeTruthy();
      expect(getByText("1 cần ôn")).toBeTruthy();
      expect(getByText("水")).toBeTruthy();
      expect(getByText("mizu")).toBeTruthy();
      expect(getByText("Nước")).toBeTruthy();
      expect(getByText("お茶")).toBeTruthy();
      expect(getByText("ocha")).toBeTruthy();
      expect(getByText("Trà")).toBeTruthy();
    });
  });

  it("filters words when clicking 'Cần ôn' tab", async () => {
    const { getByText, queryByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText("水")).toBeTruthy();
      expect(getByText("お茶")).toBeTruthy();
    });

    const dueTab = getByText("Cần ôn");
    fireEvent.press(dueTab);

    await waitFor(() => {
      expect(getByText("お茶")).toBeTruthy();
      expect(queryByText("水")).toBeNull();
    });
  });

  it("plays audio with resolved URL and falls back to romaji mp3 when audioUrl is null", async () => {
    const { getAllByRole } = await renderScreen();

    await waitFor(() => {
      const speakerButtons = getAllByRole("button");
      expect(speakerButtons.length).toBeGreaterThanOrEqual(2);

      // Bấm nút loa của từ thứ 2 ("お茶", có audioUrl = null)
      fireEvent.press(speakerButtons[1]);
      expect(mockPlay).toHaveBeenCalledWith(
        "/uploads/audios/words/ocha.mp3",
        "お茶",
      );
    });
  });
});
