/**
 * LeaderboardStatusBanner - Header card showing the active rank and the
 * current user's standing within it.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

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
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.badge}>
        <Ionicons name="trophy" size={30} color="#FFFFFF" />
      </View>
      <Text style={styles.rankName}>Hạng {rankName}</Text>

      <View style={styles.statusPill}>
        <Ionicons
          name={isCurrentRank ? "flame" : "rocket-outline"}
          size={16}
          color="#FFFFFF"
        />
        <Text style={styles.statusText}>
          {isCurrentRank
            ? `Đang đứng thứ ${position} · ${formatExp(exp)} EXP`
            : message}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.six,
    ...Shadows.lg,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },
  rankName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
    maxWidth: "100%",
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: "#FFFFFF",
    fontWeight: FontWeights.bold,
    flexShrink: 1,
  },
});
