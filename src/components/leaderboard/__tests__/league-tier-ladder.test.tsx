import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LeagueTierLadder } from "../league-tier-ladder";
import { RankResponse } from "@/types/api";

const MOCK_RANKS: RankResponse[] = [
  { rankId: 1, name: "Đồng", minExpRequired: 0, orderIndex: 1 },
  { rankId: 2, name: "Bạc", minExpRequired: 500, orderIndex: 2 },
  { rankId: 3, name: "Vàng", minExpRequired: 1500, orderIndex: 3 },
  { rankId: 4, name: "Bạch Kim", minExpRequired: 3000, orderIndex: 4 },
  { rankId: 5, name: "Kim Cương", minExpRequired: 6000, orderIndex: 5 },
];

describe("LeagueTierLadder", () => {
  it("renders all 5 league tiers with their names and highlights the current user rank", async () => {
    const onSelect = jest.fn();
    const { getByText } = await render(
      <LeagueTierLadder
        ranks={MOCK_RANKS}
        activeRankId={2}
        currentUserRankId={2}
        onSelect={onSelect}
        cardColor="#FFFFFF"
        borderColor="#E5E7EB"
        chipBg="#F3F4F6"
        textSecondaryColor="#6B7280"
      />,
    );

    expect(getByText("Đồng")).toBeTruthy();
    expect(getByText("Bạc")).toBeTruthy();
    expect(getByText("Vàng")).toBeTruthy();
    expect(getByText("Bạch Kim")).toBeTruthy();
    expect(getByText("Kim Cương")).toBeTruthy();

    // The user's active rank has a "Bạn" badge
    expect(getByText("Bạn")).toBeTruthy();
  });

  it("calls onSelect when a different rank node is pressed", async () => {
    const onSelect = jest.fn();
    const { getByText } = await render(
      <LeagueTierLadder
        ranks={MOCK_RANKS}
        activeRankId={1}
        currentUserRankId={1}
        onSelect={onSelect}
        cardColor="#FFFFFF"
        borderColor="#E5E7EB"
        chipBg="#F3F4F6"
        textSecondaryColor="#6B7280"
      />,
    );

    fireEvent.press(getByText("Vàng"));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
