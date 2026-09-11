import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import {
  LeaderboardTrophy,
  LEAGUE_THEMES,
  normalizeRankKey,
} from "./leaderboard-trophy";

interface LeaderboardStatusBannerProps {
  rankName: string;
  isCurrentRank: boolean;
  position: number | null;
  exp: number;
  message: string;
}

function formatExp(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function LeaderboardStatusBanner({
  rankName,
  isCurrentRank,
  position,
  exp,
  message,
}: LeaderboardStatusBannerProps) {
  const leagueKey = normalizeRankKey(rankName);
  const theme = LEAGUE_THEMES[leagueKey];

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.contentRow}>
        {/* Cartoon Trophy */}
        <View style={styles.trophyWrapper}>
          <LeaderboardTrophy rankName={rankName} size={64} />
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <Text style={styles.rankTitle}>{theme.label}</Text>

          <View style={styles.statusPill}>
            <Ionicons
              name={isCurrentRank ? "flame" : "rocket-outline"}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.statusText} numberOfLines={2}>
              {isCurrentRank && position
                ? `Đang đứng thứ ${position} · ${formatExp(exp)} EXP`
                : message || "Giải đấu đang diễn ra"}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    marginBottom: Spacing.five,
    ...Shadows.md,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  trophyWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.45)",
    ...Shadows.sm,
  },
  infoCol: {
    flex: 1,
  },
  rankTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.two,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  statusText: {
    fontSize: FontSizes.xs,
    color: "#FFFFFF",
    fontWeight: FontWeights.bold,
    flexShrink: 1,
  },
});
