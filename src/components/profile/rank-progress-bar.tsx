/**
 * RankProgressBar - How close the user is to their next league, computed
 * from real rank thresholds (rankApi.getRanks()) rather than an invented
 * formula.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, Shadows, Spacing } from "@/constants/theme";
import type { RankTierStyle } from "@/utils/rank-tier";

interface RankProgressBarProps {
  currentRankName: string;
  nextRankName: string | null;
  currentTier: RankTierStyle;
  progress: number;
  expToNext: number | null;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
}

export function RankProgressBar({
  currentRankName,
  nextRankName,
  currentTier,
  progress,
  expToNext,
  cardColor,
  textColor,
  textSecondaryColor,
  borderColor,
}: RankProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const isMaxed = !nextRankName;

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.rankLabel, { color: currentTier.solid }]}>
          Hạng {currentRankName}
        </Text>
        <Text style={[styles.rankLabel, { color: textSecondaryColor }]}>
          {isMaxed ? "Cao nhất" : `Hạng ${nextRankName}`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: borderColor }]}>
        <LinearGradient
          colors={currentTier.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped * 100}%` }]}
        />
      </View>

      <View style={styles.caption}>
        <Ionicons
          name={isMaxed ? "trophy" : "trending-up"}
          size={14}
          color={textSecondaryColor}
        />
        <Text style={[styles.captionText, { color: textSecondaryColor }]}>
          {isMaxed
            ? "Bạn đang ở hạng cao nhất!"
            : `Còn ${(expToNext ?? 0).toLocaleString("vi-VN")} EXP để lên hạng ${nextRankName}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.five,
    ...Shadows.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  rankLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  track: {
    height: 10,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  caption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: Spacing.two,
  },
  captionText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
});
