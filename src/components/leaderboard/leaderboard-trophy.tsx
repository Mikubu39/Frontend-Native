/**
 * LeaderboardTrophy - Cúp giải đấu chuẩn phong cách vector Duolingo thuần túy (SVG).
 * Nét vẽ đậm, 2-tone cel-shading, đế nổi 3D, trong suốt nền 100%.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

export type LeagueKey = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface LeagueTheme {
  key: LeagueKey;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  gradient: [string, string];
  cardBgLight: string;
  cardBgDark: string;
  badgeBg: string;
  glowColor: string;
}

export const LEAGUE_THEMES: Record<LeagueKey, LeagueTheme> = {
  BRONZE: {
    key: "BRONZE",
    label: "Hạng Đồng",
    primaryColor: "#CD7F32",
    secondaryColor: "#8C4A19",
    gradient: ["#D97706", "#8C4A19"],
    cardBgLight: "#FFF7ED",
    cardBgDark: "#2B1D14",
    badgeBg: "rgba(205, 127, 50, 0.15)",
    glowColor: "rgba(205, 127, 50, 0.4)",
  },
  SILVER: {
    key: "SILVER",
    label: "Hạng Bạc",
    primaryColor: "#94A3B8",
    secondaryColor: "#475569",
    gradient: ["#94A3B8", "#475569"],
    cardBgLight: "#F8FAFC",
    cardBgDark: "#1E293B",
    badgeBg: "rgba(148, 163, 184, 0.18)",
    glowColor: "rgba(148, 163, 184, 0.4)",
  },
  GOLD: {
    key: "GOLD",
    label: "Hạng Vàng",
    primaryColor: "#F59E0B",
    secondaryColor: "#D97706",
    gradient: ["#FBBF24", "#D97706"],
    cardBgLight: "#FEFCE8",
    cardBgDark: "#2D2006",
    badgeBg: "rgba(245, 158, 11, 0.18)",
    glowColor: "rgba(245, 158, 11, 0.45)",
  },
  PLATINUM: {
    key: "PLATINUM",
    label: "Hạng Bạch Kim",
    primaryColor: "#06B6D4",
    secondaryColor: "#0284C7",
    gradient: ["#22D3EE", "#0284C7"],
    cardBgLight: "#ECFEFF",
    cardBgDark: "#082F49",
    badgeBg: "rgba(6, 182, 212, 0.18)",
    glowColor: "rgba(6, 182, 212, 0.45)",
  },
  DIAMOND: {
    key: "DIAMOND",
    label: "Hạng Kim Cương",
    primaryColor: "#A855F7",
    secondaryColor: "#7E22CE",
    gradient: ["#C084FC", "#7E22CE"],
    cardBgLight: "#FAF5FF",
    cardBgDark: "#2E1065",
    badgeBg: "rgba(168, 85, 247, 0.18)",
    glowColor: "rgba(168, 85, 247, 0.45)",
  },
};

interface CupPalette {
  main: string;
  shadow: string;
  baseShadow: string;
  innerBowl: string;
  outline: string;
  crestFill: string;
  crestStroke: string;
}

const CUP_PALETTES: Record<LeagueKey, CupPalette> = {
  BRONZE: {
    main: "#E08244",
    shadow: "#A8501E",
    baseShadow: "#78320C",
    innerBowl: "#682A0A",
    outline: "#3A1A08",
    crestFill: "#FFD54F",
    crestStroke: "#8C4A19",
  },
  SILVER: {
    main: "#E2E8F0",
    shadow: "#94A3B8",
    baseShadow: "#64748B",
    innerBowl: "#475569",
    outline: "#1E293B",
    crestFill: "#FCD34D",
    crestStroke: "#B45309",
  },
  GOLD: {
    main: "#FFC800",
    shadow: "#E69500",
    baseShadow: "#B86E00",
    innerBowl: "#995700",
    outline: "#422006",
    crestFill: "#FFF8D6",
    crestStroke: "#D97706",
  },
  PLATINUM: {
    main: "#38BDF8",
    shadow: "#0284C7",
    baseShadow: "#0369A1",
    innerBowl: "#075985",
    outline: "#0C4A6E",
    crestFill: "#E0F2FE",
    crestStroke: "#0284C7",
  },
  DIAMOND: {
    main: "#C084FC",
    shadow: "#9333EA",
    baseShadow: "#6B21A8",
    innerBowl: "#581C87",
    outline: "#3B0764",
    crestFill: "#38BDF8",
    crestStroke: "#0284C7",
  },
};

export function normalizeRankKey(name?: string | null): LeagueKey {
  if (!name) return "BRONZE";
  const upper = name.trim().toUpperCase();
  if (upper.includes("KIM CƯƠNG") || upper.includes("DIAMOND"))
    return "DIAMOND";
  if (upper.includes("BẠCH KIM") || upper.includes("PLATINUM"))
    return "PLATINUM";
  if (upper.includes("VÀNG") || upper.includes("GOLD")) return "GOLD";
  if (upper.includes("BẠC") || upper.includes("SILVER")) return "SILVER";
  return "BRONZE";
}

interface LeaderboardTrophyProps {
  rankName?: string | null;
  podiumPlace?: 1 | 2 | 3;
  size?: number;
  isLocked?: boolean;
}

export function LeaderboardTrophy({
  rankName,
  podiumPlace,
  size = 48,
  isLocked = false,
}: LeaderboardTrophyProps) {
  let leagueKey: LeagueKey;

  if (podiumPlace === 1) {
    leagueKey = "GOLD";
  } else if (podiumPlace === 2) {
    leagueKey = "SILVER";
  } else if (podiumPlace === 3) {
    leagueKey = "BRONZE";
  } else {
    leagueKey = normalizeRankKey(rankName);
  }

  const p = CUP_PALETTES[leagueKey] ?? CUP_PALETTES.BRONZE;

  return (
    <View
      style={[
        { width: size, height: size, opacity: isLocked ? 0.45 : 1 },
        styles.container,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient
            id={`stemGrad-${leagueKey}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <Stop offset="0" stopColor={p.main} />
            <Stop offset="0.5" stopColor={p.main} />
            <Stop offset="0.51" stopColor={p.shadow} />
            <Stop offset="1" stopColor={p.shadow} />
          </LinearGradient>
        </Defs>

        {/* 1. Left Handle */}
        <Path
          d="M 17 18 C 5 18, 5 34, 18 36"
          fill="none"
          stroke={p.outline}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <Path
          d="M 17 18 C 7 18, 7 34, 18 36"
          fill="none"
          stroke={p.main}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 2. Right Handle */}
        <Path
          d="M 47 18 C 59 18, 59 34, 46 36"
          fill="none"
          stroke={p.outline}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <Path
          d="M 47 18 C 57 18, 57 34, 46 36"
          fill="none"
          stroke={p.shadow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 3. Base bottom 3D shadow (Chunky Duolingo Bevel) */}
        <Rect
          x="16"
          y="54"
          width="32"
          height="6"
          rx="3"
          fill={p.baseShadow}
          stroke={p.outline}
          strokeWidth="2"
        />

        {/* 4. Base top pedestal */}
        <Rect
          x="19"
          y="48"
          width="26"
          height="7"
          rx="3"
          fill={p.main}
          stroke={p.outline}
          strokeWidth="2"
        />
        {/* Pedestal right shadow */}
        <Path
          d="M 32 48 L 42 48 C 43.6 48, 45 49.3, 45 51 L 45 52 C 45 53.6, 43.6 55, 42 55 L 32 55 Z"
          fill={p.shadow}
        />

        {/* 5. Stem */}
        <Path
          d="M 27 40 L 37 40 L 39 49 L 25 49 Z"
          fill={`url(#stemGrad-${leagueKey})`}
          stroke={p.outline}
          strokeWidth="2"
        />

        {/* 6. Chalice Body (2-tone split) */}
        {/* Left half (Light) */}
        <Path
          d="M 14 14 C 14 14, 17 35, 27 40 L 32 40 L 32 14 Z"
          fill={p.main}
        />
        {/* Right half (Shadow) */}
        <Path
          d="M 32 14 L 32 40 L 37 40 C 47 35, 50 14, 50 14 Z"
          fill={p.shadow}
        />
        {/* Chalice outer outline */}
        <Path
          d="M 14 14 C 14 14, 17 35, 27 40 L 37 40 C 47 35, 50 14, 50 14 Z"
          fill="none"
          stroke={p.outline}
          strokeWidth="2.5"
        />

        {/* 7. Curved Glare Highlight on left */}
        <Path
          d="M 18 18 C 19 26, 22 33, 26 36"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* 8. Top Rim */}
        <Rect
          x="12"
          y="11"
          width="40"
          height="6.5"
          rx="3.2"
          fill={p.main}
          stroke={p.outline}
          strokeWidth="2"
        />
        {/* Rim right shadow */}
        <Path
          d="M 32 11 L 48.8 11 C 50.5 11, 52 12.4, 52 14.25 L 52 14.25 C 52 16, 50.5 17.5, 48.8 17.5 L 32 17.5 Z"
          fill={p.shadow}
        />
        {/* Inner bowl depth */}
        <Ellipse
          cx="32"
          cy="14"
          rx="15"
          ry="1.8"
          fill={p.innerBowl}
          opacity={0.85}
        />

        {/* 9. League Specific Crest Icon on Cup */}
        {leagueKey === "DIAMOND" ? (
          // Diamond Crown Gem
          <G>
            <Path
              d="M 32 19 L 38 25 L 32 33 L 26 25 Z"
              fill={p.crestFill}
              stroke={p.outline}
              strokeWidth="1.8"
            />
            {/* Diamond facet lines */}
            <Path
              d="M 26 25 L 38 25 M 32 19 L 32 33"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
          </G>
        ) : leagueKey === "PLATINUM" ? (
          // Platinum Crystal Hexagon
          <G>
            <Path
              d="M 32 20 L 37 24 L 37 30 L 32 34 L 27 30 L 27 24 Z"
              fill={p.crestFill}
              stroke={p.outline}
              strokeWidth="1.8"
            />
            <Path
              d="M 32 20 L 32 34 M 27 24 L 37 30 M 27 30 L 37 24"
              stroke="rgba(2, 132, 199, 0.4)"
              strokeWidth="1"
            />
          </G>
        ) : (
          // Gold / Silver / Bronze 5-point Star
          <Path
            d="M 32 20.5 L 33.8 24.5 L 38 24.8 L 34.8 27.5 L 35.8 31.7 L 32 29.3 L 28.2 31.7 L 29.2 27.5 L 26 24.8 L 30.2 24.5 Z"
            fill={p.crestFill}
            stroke={p.outline}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}
      </Svg>

      {/* Locked overlay for higher tiers */}
      {isLocked && (
        <View
          style={[
            styles.lockOverlay,
            { borderRadius: Math.round(size * 0.22) },
          ]}
        >
          <Ionicons
            name="lock-closed"
            size={Math.round(size * 0.38)}
            color="#FFFFFF"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});
