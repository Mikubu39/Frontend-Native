import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ProfileCard } from "../profile-card";
import { Colors } from "@/constants/theme";
import type { ThemeColors } from "@/types";

const mockColors: ThemeColors = {
  text: Colors.light.text,
  textSecondary: Colors.light.textSecondary,
  background: Colors.light.background,
  backgroundElement: Colors.light.backgroundElement,
  backgroundSelected: Colors.light.backgroundSelected,
  card: Colors.light.card,
  cardElevated: Colors.light.cardElevated,
  border: Colors.light.border,
  borderSubtle: Colors.light.borderSubtle,
  tabBarBg: Colors.light.tabBarBg,
  tabBarBorder: Colors.light.tabBarBorder,
  overlay: Colors.light.overlay,
  overlaySubtle: Colors.light.overlaySubtle,
  overlayLight: Colors.light.overlayLight,
  borderTransparent: Colors.light.borderTransparent,
  cardQuiz: Colors.light.cardQuiz,
  cardQuizBorder: Colors.light.cardQuizBorder,
};

describe("ProfileCard", () => {
  it("renders the display name, username and stats", async () => {
    const { getByText } = await render(
      <ProfileCard
        displayName="Yamada Taro"
        username="yamada"
        avatarUrl={null}
        stats={[
          { key: "following", value: 12, label: "Đang theo dõi" },
          { key: "followers", value: 34, label: "Người theo dõi" },
        ]}
        isFollowing={false}
        onToggleFollow={jest.fn()}
        colors={mockColors}
      />,
    );

    expect(getByText("Yamada Taro")).toBeTruthy();
    expect(getByText("@yamada")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("Đang theo dõi")).toBeTruthy();
    expect(getByText("34")).toBeTruthy();
    expect(getByText("Người theo dõi")).toBeTruthy();
  });

  it("shows the rank badge only when provided", async () => {
    const { getByText, queryByText, rerender } = await render(
      <ProfileCard
        displayName="Suzuki Ichiro"
        stats={[{ key: "level", value: "Lv 5", label: "Cấp độ" }]}
        isFollowing={false}
        onToggleFollow={jest.fn()}
        colors={mockColors}
      />,
    );

    expect(queryByText(/Hạng/)).toBeNull();

    await rerender(
      <ProfileCard
        displayName="Suzuki Ichiro"
        stats={[{ key: "level", value: "Lv 5", label: "Cấp độ" }]}
        rankLabel="Hạng Kim cương"
        isFollowing={false}
        onToggleFollow={jest.fn()}
        colors={mockColors}
      />,
    );

    expect(getByText("Hạng Kim cương")).toBeTruthy();
  });

  it("calls onToggleFollow when the follow button is pressed and reflects follow state in the label", async () => {
    const onToggleFollow = jest.fn();
    const { getByText, rerender } = await render(
      <ProfileCard
        displayName="Sato Hanako"
        stats={[{ key: "level", value: "Lv 3", label: "Cấp độ" }]}
        isFollowing={false}
        onToggleFollow={onToggleFollow}
        colors={mockColors}
      />,
    );

    const followButton = getByText("Theo dõi");
    fireEvent.press(followButton);
    expect(onToggleFollow).toHaveBeenCalledTimes(1);

    await rerender(
      <ProfileCard
        displayName="Sato Hanako"
        stats={[{ key: "level", value: "Lv 3", label: "Cấp độ" }]}
        isFollowing
        onToggleFollow={onToggleFollow}
        colors={mockColors}
      />,
    );

    expect(getByText("Đang theo dõi")).toBeTruthy();
  });
});
