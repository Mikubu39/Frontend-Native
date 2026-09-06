import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileTabScreen from "../profile";
import { useAuth } from "@/contexts/auth-context";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { achievementsApi, rankApi } from "@/services/api";
import { avatarApi } from "@/services/api/avatar";
import { userService } from "@/services/api/user";
import { streakApi } from "@/services/api/streak";
import { storage } from "@/services/storage/async-storage";
import { Colors } from "@/constants/theme";
import type { AchievementResponse, RankResponse } from "@/types/api";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/services/api", () => ({
  rankApi: {
    getRanks: jest.fn(),
  },
  achievementsApi: {
    getMyAchievements: jest.fn(),
  },
}));

jest.mock("@/services/api/avatar", () => ({
  avatarApi: {
    getAvatarUrl: jest.fn(),
    updateAvatarUrl: jest.fn(),
  },
}));

jest.mock("@/services/api/user", () => ({
  userService: {
    getPublicProfile: jest.fn(),
  },
}));

jest.mock("@/services/api/streak", () => ({
  streakApi: {
    getStreakCalendar: jest.fn(),
  },
}));

jest.mock("@/services/storage/async-storage", () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseGamification = useGamification as unknown as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedRankApi = rankApi as jest.Mocked<typeof rankApi>;
const mockedAchievementsApi = achievementsApi as jest.Mocked<
  typeof achievementsApi
>;
const mockedAvatarApi = avatarApi as jest.Mocked<typeof avatarApi>;
const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedStreakApi = streakApi as jest.Mocked<typeof streakApi>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

const RANKS: RankResponse[] = [
  { rankId: 1, name: "Đồng", minExpRequired: 0, orderIndex: 1 },
  { rankId: 2, name: "Bạc", minExpRequired: 1000, orderIndex: 2 },
];

const ACHIEVEMENTS: AchievementResponse[] = [
  {
    achievementId: 1,
    code: "FIRST_LESSON",
    name: "Câu chuyện đầu tiên",
    description: "Hoàn thành bài học đầu tiên",
    icon: "🎯",
    type: "LESSONS_COMPLETED",
    threshold: 1,
    secret: false,
    unlocked: true,
    progress: 1,
    active: true,
  },
  {
    achievementId: 2,
    code: "STREAK_30",
    name: "Tháng bền vững",
    description: "Đạt streak 30 ngày",
    icon: "🔥",
    type: "STREAK_MILESTONE",
    threshold: 30,
    secret: false,
    unlocked: false,
    progress: 12,
    active: true,
  },
];

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ProfileTabScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAuth.mockReturnValue({
    user: {
      id: "1",
      email: "hoc.vien@example.com",
      displayName: "Hoc Vien",
    },
  });
  mockedUseGamification.mockReturnValue({
    streak: 12,
    exp: 300,
    coins: 480,
    energy: 18,
    maxEnergy: 25,
    rankId: 1,
    rankName: "Đồng",
    streakFreezeCount: 2,
  });
  mockedUseTheme.mockReturnValue({ colors: Colors.light, isDark: false });
  mockedRankApi.getRanks.mockResolvedValue(RANKS);
  mockedAchievementsApi.getMyAchievements.mockResolvedValue(ACHIEVEMENTS);
  mockedAvatarApi.getAvatarUrl.mockResolvedValue(
    "https://api.example.com/uploads/images/avatars/a.png",
  );
  mockedUserService.getPublicProfile.mockResolvedValue({
    id: 1,
    displayName: "Hoc Vien",
    avatarUrl: null,
    rankName: "Đồng",
    currentStreak: 12,
    followerCount: 4,
    followingCount: 3,
    isFollowing: false,
  });
  mockedStreakApi.getStreakCalendar.mockResolvedValue([]);
  mockedStorage.get.mockResolvedValue(null);
  mockedStorage.set.mockResolvedValue(undefined);
});

describe("ProfileTabScreen", () => {
  it("shows the player's identity, rank and live gamification stats", async () => {
    const { findByText, getByText, getByTestId } = await renderScreen();

    expect(await findByText("Hoc Vien")).toBeTruthy();
    expect(
      getByText("@HOC.VIEN · Từ " + new Date().getFullYear()),
    ).toBeTruthy();
    expect(getByText("Đồng")).toBeTruthy();

    // Real gamification numbers reach the stat capsule, including energy,
    // which the previous layout never showed at all. Queried by testID
    // (not text) because the streak value "12" can collide with a
    // day-of-month label in the streak calendar heat map below it.
    expect(getByTestId("stat-value-streak").props.children).toBe("12");
    expect(getByTestId("stat-value-exp").props.children).toBe("300");
    expect(getByTestId("stat-value-coins").props.children).toBe("480");
    expect(getByTestId("stat-value-energy").props.children).toBe("18/25");
  });

  it("computes progress toward the next rank from real thresholds, not a guess", async () => {
    const { findByText } = await renderScreen();

    expect(await findByText("Còn 700 EXP để lên hạng Bạc")).toBeTruthy();
  });

  it("deep-links the rank chip into the leaderboard tab", async () => {
    const { findByText } = await renderScreen();

    fireEvent.press(await findByText("Đồng"));

    expect(mockPush).toHaveBeenCalledWith("/(tabs)/leaderboard");
  });

  it("renders achievements fetched from the API, showing progress for locked ones", async () => {
    const { findByText, getByText } = await renderScreen();

    expect(await findByText("Câu chuyện đầu tiên")).toBeTruthy();
    expect(getByText("Tháng bền vững")).toBeTruthy();
    // Locked achievement shows live progress toward its threshold.
    expect(getByText("12/30")).toBeTruthy();

    expect(mockedAchievementsApi.getMyAchievements).toHaveBeenCalled();
  });

  it("dismisses the incomplete-profile alert and persists the choice", async () => {
    const { findByText, queryByText, getByLabelText } = await renderScreen();

    expect(await findByText("Tài khoản chưa hoàn tất")).toBeTruthy();

    fireEvent.press(getByLabelText("Ẩn thông báo"));

    await waitFor(() =>
      expect(mockedStorage.set).toHaveBeenCalledWith(
        "profile_banner_dismissed",
        "true",
      ),
    );
    expect(queryByText("Tài khoản chưa hoàn tất")).toBeNull();
  });
});
