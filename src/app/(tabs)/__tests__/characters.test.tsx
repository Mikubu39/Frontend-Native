import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CharactersScreen from "../characters";
import { alphabetApi } from "@/services/api/alphabets";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import { AlphabetGroup } from "@/types/alphabet";

jest.mock("@/services/api/alphabets", () => ({
  alphabetApi: {
    getAlphabets: jest.fn(),
  },
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/hooks/use-audio", () => ({
  useAudio: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

const mockedApi = alphabetApi as jest.Mocked<typeof alphabetApi>;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseAudio = useAudio as jest.Mock;
const play = jest.fn();

const HIRAGANA: AlphabetGroup[] = [
  {
    groupName: "Hàng A",
    characters: [
      {
        characterId: 1,
        symbol: "あ",
        romaji: "a",
        audioUrl: "https://cdn.example.com/audio/a.mp3",
        masteryLevel: 3,
      },
      {
        characterId: 2,
        symbol: "い",
        romaji: "i",
        audioUrl: null,
        masteryLevel: 0,
      },
    ],
  },
];

const KATAKANA: AlphabetGroup[] = [
  {
    groupName: "Hàng A (Katakana)",
    characters: [
      {
        characterId: 51,
        symbol: "ア",
        romaji: "a",
        audioUrl: null,
        masteryLevel: 1,
      },
    ],
  },
];

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <CharactersScreen />
    </SafeAreaProvider>,
  );
}

describe("CharactersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        text: "#1A1A2E",
        textSecondary: "#6B7280",
        background: "#FFF8E7",
        backgroundElement: "#FFF3D0",
        card: "#FFFFFF",
        cardElevated: "#FFFFFF",
        border: "#E5E7EB",
        borderSubtle: "#F3F4F6",
      },
    });
    mockedUseAudio.mockReturnValue({
      isPlaying: false,
      play,
      stop: jest.fn(),
    });
    mockedApi.getAlphabets.mockImplementation(async (type) =>
      type === "KATAKANA" ? KATAKANA : HIRAGANA,
    );
  });

  it("loads the hiragana matrix with mastery progress", async () => {
    const { findByText, getByText } = await renderScreen();

    expect(await findByText("Hàng A")).toBeTruthy();
    expect(mockedApi.getAlphabets).toHaveBeenCalledWith("HIRAGANA");
    expect(getByText("あ")).toBeTruthy();
    expect(getByText("い")).toBeTruthy();
    // あ ở mức 3 (thành thạo), い ở mức 0 (chưa học).
    expect(getByText(/Đã học 1\/2/)).toBeTruthy();
    expect(getByText(/Thành thạo/)).toBeTruthy();
  });

  it("shows the detail panel and plays the audio when a character is tapped", async () => {
    const { findByText, getByText, getByLabelText } = await renderScreen();

    await findByText("Hàng A");
    fireEvent.press(getByLabelText("あ, a, mức thông thạo 3 trên 3"));

    expect(await findByText("KÝ TỰ ĐANG CHỌN")).toBeTruthy();
    expect(getByText("Phiên âm: /a/")).toBeTruthy();
    expect(getByText("Thành thạo")).toBeTruthy();
    expect(play).toHaveBeenCalledWith("https://cdn.example.com/audio/a.mp3");
  });

  it("refetches the matrix when switching to katakana", async () => {
    const { findByText, getByText } = await renderScreen();

    await findByText("Hàng A");
    fireEvent.press(getByText("Katakana (ア)"));

    await waitFor(() =>
      expect(mockedApi.getAlphabets).toHaveBeenCalledWith("KATAKANA"),
    );
    expect(await findByText("ア")).toBeTruthy();
  });

  it("navigates to the practice screen", async () => {
    const { findByText, getByText } = await renderScreen();

    await findByText("Hàng A");
    fireEvent.press(getByText("Bắt đầu luyện tập"));

    expect(mockPush).toHaveBeenCalledWith("/alphabet/practice");
  });

  it("shows a retry action when the request fails", async () => {
    mockedApi.getAlphabets.mockRejectedValueOnce(new Error("Mất kết nối"));

    const { findByText, getByText } = await renderScreen();

    expect(await findByText("Mất kết nối")).toBeTruthy();

    fireEvent.press(getByText("Thử lại"));
    expect(await findByText("Hàng A")).toBeTruthy();
  });
});
