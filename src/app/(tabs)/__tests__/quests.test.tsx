import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import QuestsScreen from "../quests";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";
import type { ChestStatus, Quest } from "@/types";

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

const mockedUseGamification = useGamification as unknown as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

const QUESTS: Quest[] = [
  {
    questId: 1,
    title: "Trả lời đúng 20 câu",
    questType: "CORRECT_ANSWERS",
    currentProgress: 8,
    targetValue: 20,
    completed: false,
  },
  {
    questId: 2,
    title: "Hoàn thành 3 bài học",
    questType: "COMPLETE_LESSONS",
    currentProgress: 3,
    targetValue: 3,
    completed: true,
  },
  {
    questId: 3,
    title: "1 bài học không sai câu nào",
    questType: "PERFECT_LESSON",
    currentProgress: 0,
    targetValue: 1,
    completed: false,
  },
];

async function setup(overrides: {
  quests?: Quest[];
  chestStatus?: ChestStatus | null;
  openChest?: jest.Mock;
}) {
  const fetchQuests = jest.fn().mockResolvedValue(undefined);
  const fetchChestStatus = jest.fn().mockResolvedValue(undefined);
  const openChest =
    overrides.openChest ??
    jest.fn().mockResolvedValue({ coinsRewarded: 120, currentCoins: 620 });

  mockedUseGamification.mockReturnValue({
    quests: overrides.quests ?? QUESTS,
    chestStatus:
      overrides.chestStatus === undefined
        ? {
            available: false,
            alreadyOpenedToday: false,
            questsCompleted: 1,
            questsRequired: 3,
          }
        : overrides.chestStatus,
    fetchQuests,
    fetchChestStatus,
    openChest,
  });

  // RNTL 14 resolves the render asynchronously; the queries only exist
  // on the awaited result.
  const screen = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <QuestsScreen />
    </SafeAreaProvider>,
  );

  return { screen, fetchQuests, fetchChestStatus, openChest };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTheme.mockReturnValue({
    colors: Colors.light,
    isDark: false,
    mode: "light",
  });
});

describe("QuestsScreen", () => {
  it("loads the board and reports how far the day has got", async () => {
    const { screen, fetchQuests, fetchChestStatus } = await setup({});

    await waitFor(() => expect(fetchQuests).toHaveBeenCalled());
    expect(fetchChestStatus).toHaveBeenCalled();

    // Headline reads the player's standing, counted from the quests shown.
    await waitFor(() =>
      expect(screen.getByText("Xong 1/3 nhiệm vụ")).toBeTruthy(),
    );
    expect(
      screen.getByText("Còn 2 nhiệm vụ nữa là mở được rương."),
    ).toBeTruthy();

    expect(screen.getByText("Trả lời đúng 20 câu")).toBeTruthy();
    expect(screen.getByText("Còn 12 câu đúng")).toBeTruthy();
    expect(screen.getByText("Đã xong")).toBeTruthy();
  });

  it("orders finished stations ahead of untouched ones on the rail", async () => {
    const { screen } = await setup({});

    await waitFor(() =>
      expect(screen.getAllByTestId("quest-caption")).toHaveLength(3),
    );

    const captions = screen
      .getAllByTestId("quest-caption")
      .map((node) => node.props.children);

    expect(captions).toEqual([
      "Đã xong",
      "Còn 12 câu đúng",
      "Còn 1 bài không sai",
    ]);
  });

  it("keeps the chest shut until every quest is done", async () => {
    const { screen, openChest } = await setup({});

    await waitFor(() =>
      expect(screen.getByText("Còn 2 nhiệm vụ")).toBeTruthy(),
    );

    fireEvent.press(screen.getByText("Còn 2 nhiệm vụ"));
    expect(openChest).not.toHaveBeenCalled();
  });

  it("opens the chest and shows what it paid out", async () => {
    const done = QUESTS.map((quest) => ({
      ...quest,
      completed: true,
      currentProgress: quest.targetValue,
    }));

    const { screen, openChest } = await setup({
      quests: done,
      chestStatus: {
        available: true,
        alreadyOpenedToday: false,
        questsCompleted: 3,
        questsRequired: 3,
      },
    });

    await waitFor(() => expect(screen.getByText("Mở rương")).toBeTruthy());
    expect(screen.getByText("Đã xong cả 3 nhiệm vụ")).toBeTruthy();
    expect(screen.getByText("Rương đang chờ ở cuối chặng.")).toBeTruthy();

    fireEvent.press(screen.getByText("Mở rương"));

    await waitFor(() => expect(openChest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("+120")).toBeTruthy());
    // The reward takes the terminus body's place once it has paid out.
    expect(
      screen.queryByText("Xong 3/3 nhiệm vụ. Rương là của bạn."),
    ).toBeNull();
  });

  it("says what to do when the day has no quests", async () => {
    const { screen } = await setup({ quests: [], chestStatus: null });

    await waitFor(() =>
      expect(screen.getByText("Bảng hôm nay còn trống")).toBeTruthy(),
    );
    expect(screen.getByText("Kéo xuống để tải lại bảng")).toBeTruthy();
    // With no track there is no terminus to walk to.
    expect(screen.queryByText("Cuối chặng")).toBeNull();
  });
});
