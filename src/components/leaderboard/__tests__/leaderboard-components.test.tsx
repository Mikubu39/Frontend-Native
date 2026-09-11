import React from "react";
import { render } from "@testing-library/react-native";
import { LeaderboardStatusBanner } from "../leaderboard-status-banner";
import { LeaderboardPodium } from "../leaderboard-podium";
import { LeaderboardRow } from "../leaderboard-row";
import { LeaderboardStickyBar } from "../leaderboard-sticky-bar";
import { LeaderboardTrophy } from "../leaderboard-trophy";
import { LeaderboardUserDto } from "@/types/api";

const MOCK_USERS: LeaderboardUserDto[] = [
  { userId: 1, displayName: "Hero 1", exp: 1200, position: 1, avatarUrl: null },
  { userId: 2, displayName: "Hero 2", exp: 950, position: 2, avatarUrl: null },
  { userId: 3, displayName: "Hero 3", exp: 800, position: 3, avatarUrl: null },
  {
    userId: 4,
    displayName: "Player 4",
    level: 5,
    exp: 600,
    position: 4,
    avatarUrl: null,
  },
];

describe("Leaderboard Components", () => {
  it("renders LeaderboardStatusBanner with rank name and current user position", async () => {
    const { getByText } = await render(
      <LeaderboardStatusBanner
        rankName="Vàng"
        isCurrentRank={true}
        position={2}
        exp={950}
        message=""
      />,
    );

    expect(getByText("Hạng Vàng")).toBeTruthy();
    expect(getByText("Đang đứng thứ 2 · 950 EXP")).toBeTruthy();
  });

  it("renders LeaderboardPodium with 3 places and trophies", async () => {
    const { getByText } = await render(
      <LeaderboardPodium
        topThree={MOCK_USERS.slice(0, 3)}
        currentUserId={2}
        currentFreshExp={950}
        textOnCard="#000000"
        textOnCardSecondary="#666666"
      />,
    );

    expect(getByText("Hero 1")).toBeTruthy();
    expect(getByText("Bạn")).toBeTruthy(); // user 2 is current user
    expect(getByText("Hero 3")).toBeTruthy();
    expect(getByText("1.200 EXP")).toBeTruthy();
  });

  it("renders LeaderboardRow with 2-tier info (name and level)", async () => {
    const { getByText } = await render(
      <LeaderboardRow
        user={MOCK_USERS[3]}
        isCurrentUser={false}
        displayExp={600}
        delay={0}
        cardColor="#FFFFFF"
        textColor="#000000"
        textSecondaryColor="#666666"
        currentUserTintBg="#F5F3FF"
      />,
    );

    expect(getByText("Player 4")).toBeTruthy();
    expect(getByText("Cấp độ 5")).toBeTruthy();
    expect(getByText("600")).toBeTruthy();
  });

  it("renders LeaderboardStickyBar with user position and exp", async () => {
    const { getByText } = await render(
      <LeaderboardStickyBar
        position={5}
        displayName="Tôi"
        avatarUrl={null}
        userId={99}
        exp={450}
        cardColor="#FFFFFF"
        textColor="#000000"
        textSecondaryColor="#666666"
      />,
    );

    expect(getByText("5")).toBeTruthy();
    expect(getByText("Tôi")).toBeTruthy();
    expect(getByText("Bạn")).toBeTruthy();
    expect(getByText("450")).toBeTruthy();
  });

  it("renders LeaderboardTrophy without crashing for all 5 ranks", async () => {
    const { getByTestId } = await render(
      <>
        <LeaderboardTrophy rankName="Đồng" />
        <LeaderboardTrophy rankName="Bạc" />
        <LeaderboardTrophy rankName="Vàng" />
        <LeaderboardTrophy rankName="Bạch Kim" />
        <LeaderboardTrophy rankName="Kim Cương" />
      </>,
    );
    expect(getByTestId).toBeDefined();
  });

  it("renders LeaderboardRow and LeaderboardStickyBar with custom avatarUrl without crashing", async () => {
    const userWithAvatar: LeaderboardUserDto = {
      userId: 42,
      displayName: "Custom User",
      level: 3,
      exp: 750,
      position: 6,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=duolingo",
    };

    const { getAllByText } = await render(
      <>
        <LeaderboardRow
          user={userWithAvatar}
          isCurrentUser={true}
          displayExp={750}
          delay={0}
          cardColor="#FFFFFF"
          textColor="#000000"
          textSecondaryColor="#666666"
          currentUserTintBg="#F5F3FF"
        />
        <LeaderboardStickyBar
          position={6}
          displayName="Custom User"
          avatarUrl={userWithAvatar.avatarUrl}
          userId={42}
          exp={750}
          cardColor="#FFFFFF"
          textColor="#000000"
          textSecondaryColor="#666666"
        />
      </>,
    );

    expect(getAllByText("Custom User").length).toBe(2);
    expect(getAllByText("750").length).toBe(2);
  });
});
