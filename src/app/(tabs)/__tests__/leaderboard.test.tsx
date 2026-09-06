import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LeaderboardScreen from "../leaderboard";
import { rankApi } from "@/services/api";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import {
  LeaderboardResponse,
  LeaderboardUserDto,
  RankResponse,
} from "@/types/api";

jest.mock("@/services/api", () => ({
  rankApi: {
    getRanks: jest.fn(),
    getLeaderboard: jest.fn(),
  },
}));

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

const mockedRankApi = rankApi as jest.Mocked<typeof rankApi>;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

const RANKS: RankResponse[] = [
  { rankId: 1, name: "Đồng", minExpRequired: 0, orderIndex: 1 },
  { rankId: 2, name: "Bạc", minExpRequired: 500, orderIndex: 2 },
];

function buildUser(overrides: Partial<LeaderboardUserDto>): LeaderboardUserDto {
  return {
    userId: 0,
    displayName: "",
    avatarUrl: null,
    exp: 0,
    position: 1,
    ...overrides,
  };
}

const BRONZE_LEADERBOARD: LeaderboardResponse = {
  currentRankInfo: { rankId: 1, name: "Đồng", minExpRequired: 0 },
  topUsers: [
    buildUser({ userId: 10, displayName: "Yuki", exp: 500, position: 1 }),
    buildUser({ userId: 11, displayName: "Minh", exp: 420, position: 2 }),
    buildUser({ userId: 12, displayName: "An", exp: 380, position: 3 }),
    buildUser({
      userId: 1,
      displayName: "Bạn Test",
      exp: 300,
      position: 4,
    }),
    // The backend can send `exp: null` for a user beyond the podium; the row
    // must render "0 EXP" instead of crashing on `null.toLocaleString()`.
    buildUser({
      userId: 13,
      displayName: "Lam",
      exp: null,
      position: 5,
    }),
  ],
  currentUserStanding: {
    userId: 1,
    displayName: "Bạn Test",
    exp: 300,
    position: 4,
    message: "",
  },
};

const SILVER_LEADERBOARD: LeaderboardResponse = {
  currentRankInfo: { rankId: 2, name: "Bạc", minExpRequired: 500 },
  topUsers: [
    buildUser({ userId: 20, displayName: "Hana", exp: 900, position: 1 }),
    buildUser({ userId: 21, displayName: "Kenji", exp: 800, position: 2 }),
  ],
  currentUserStanding: {
    userId: 1,
    displayName: "Bạn Test",
    exp: 300,
    position: null,
    message: "Hãy cố gắng hơn để vào hạng này!",
  },
};

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <LeaderboardScreen />
    </SafeAreaProvider>,
  );
}

describe("LeaderboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseGamification.mockReturnValue({ rankId: 1, exp: 300 });
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        text: "#1A1A2E",
        textSecondary: "#6B7280",
        background: "#FFF8E7",
        backgroundElement: "#FFF3D0",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
    });
    mockedRankApi.getRanks.mockResolvedValue(RANKS);
    mockedRankApi.getLeaderboard.mockImplementation((rankId?: number) =>
      Promise.resolve(rankId === 2 ? SILVER_LEADERBOARD : BRONZE_LEADERBOARD),
    );
  });

  it("loads the user's current rank, shows the podium and marks the user's row", async () => {
    const { findByText, getByText, getAllByText } = await renderScreen();

    expect(await findByText("Hạng Đồng")).toBeTruthy();
    expect(mockedRankApi.getLeaderboard).toHaveBeenCalledWith(1);

    // Podium (top 3) renders real names.
    expect(getByText("Yuki")).toBeTruthy();
    expect(getByText("Minh")).toBeTruthy();
    expect(getByText("An")).toBeTruthy();

    // The current user (position 4) shows in the ranked list & sticky bar with a "Bạn" badge.
    expect(getAllByText("Bạn Test").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Bạn").length).toBeGreaterThanOrEqual(1);

    // A user with `exp: null` renders as 0 instead of crashing.
    expect(getByText("Lam")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();

    // Top Group indicator is visible
    expect(getByText("NHÓM DẪN ĐẦU (TOP 3)")).toBeTruthy();
  });

  it("switches ranks when a different tab is pressed", async () => {
    const { findByText, getByText } = await renderScreen();

    await findByText("Hạng Đồng");

    fireEvent.press(getByText("Bạc"));

    await waitFor(() =>
      expect(mockedRankApi.getLeaderboard).toHaveBeenCalledWith(2),
    );
    expect(await findByText("Hạng Bạc")).toBeTruthy();
    expect(getByText("Hãy cố gắng hơn để vào hạng này!")).toBeTruthy();
  });
});
