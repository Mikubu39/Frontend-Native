/**
 * RankTabs - Horizontal segmented selector for switching between ranks.
 */

import React from "react";
import { RankResponse } from "@/types/api";

import { LeagueTierLadder } from "./league-tier-ladder";

interface RankTabsProps {
  ranks: RankResponse[];
  activeRankId: number | null;
  currentUserRankId?: number | null;
  onSelect: (rankId: number) => void;
  cardColor: string;
  borderColor: string;
  chipBg: string;
  textSecondaryColor: string;
}

export function RankTabs(props: RankTabsProps) {
  return <LeagueTierLadder {...props} />;
}
