/**
 * LeaderboardPodium - Elevated top-3 display shown above the ranked list.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LeaderboardUserDto } from "@/types/api";
import { LeaderboardAvatar } from "./leaderboard-avatar";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

interface TierStyle {
  gradient: [string, string];
  ring: string;
  platformHeight: number;
  avatarSize: number;
}

const TIER_STYLES: Record<1 | 2 | 3, TierStyle> = {
  1: {
    gradient: ["#FFD966", "#F5A623"],
    ring: "#F5A623",
    platformHeight: 92,
    avatarSize: 76,
  },
  2: {
    gradient: ["#E3E8F0", "#B7C0D1"],
    ring: "#AEB8C9",
    platformHeight: 66,
    avatarSize: 60,
  },
  3: {
    gradient: ["#F0BE94", "#D89159"],
    ring: "#CC8A57",
    platformHeight: 52,
    avatarSize: 60,
  },
};

interface PodiumSlotProps {
  user: LeaderboardUserDto;
  place: 1 | 2 | 3;
  isCurrentUser: boolean;
  displayExp: number;
  textOnCard: string;
  textOnCardSecondary: string;
}

function formatExp(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("vi-VN");
}

function PodiumSlot({
  user,
  place,
  isCurrentUser,
  displayExp,
  textOnCard,
  textOnCardSecondary,
}: PodiumSlotProps) {
  const tier = TIER_STYLES[place];

  return (
    <View style={styles.slot}>
      {place === 1 && (
        <Ionicons
          name="trophy"
          size={22}
          color="#F5A623"
          style={styles.crown}
        />
      )}
      <LeaderboardAvatar
        displayName={user.displayName}
        avatarUrl={user.avatarUrl}
        userId={user.userId}
        size={tier.avatarSize}
        ringColor={tier.ring}
        ringWidth={3}
      />
      <Text style={[styles.slotName, { color: textOnCard }]} numberOfLines={1}>
        {isCurrentUser ? "Bạn" : user.displayName}
      </Text>
      <Text style={[styles.slotExp, { color: textOnCardSecondary }]}>
        {formatExp(displayExp)} EXP
      </Text>
      <LinearGradient
        colors={tier.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.platform, { height: tier.platformHeight }]}
      >
        <Text style={styles.platformRank}>{place}</Text>
      </LinearGradient>
    </View>
  );
}

interface LeaderboardPodiumProps {
  topThree: LeaderboardUserDto[];
  currentUserId: number;
  currentFreshExp: number;
  textOnCard: string;
  textOnCardSecondary: string;
}

export function LeaderboardPodium({
  topThree,
  currentUserId,
  currentFreshExp,
  textOnCard,
  textOnCardSecondary,
}: LeaderboardPodiumProps) {
  const [first, second, third] = topThree;
  if (!first) return null;

  const expFor = (user: LeaderboardUserDto) =>
    user.userId === currentUserId
      ? Math.max(user.exp ?? 0, currentFreshExp)
      : (user.exp ?? 0);

  return (
    <View style={styles.container}>
      {second && (
        <PodiumSlot
          user={second}
          place={2}
          isCurrentUser={second.userId === currentUserId}
          displayExp={expFor(second)}
          textOnCard={textOnCard}
          textOnCardSecondary={textOnCardSecondary}
        />
      )}
      <PodiumSlot
        user={first}
        place={1}
        isCurrentUser={first.userId === currentUserId}
        displayExp={expFor(first)}
        textOnCard={textOnCard}
        textOnCardSecondary={textOnCardSecondary}
      />
      {third && (
        <PodiumSlot
          user={third}
          place={3}
          isCurrentUser={third.userId === currentUserId}
          displayExp={expFor(third)}
          textOnCard={textOnCard}
          textOnCardSecondary={textOnCardSecondary}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  slot: {
    flex: 1,
    maxWidth: 120,
    alignItems: "center",
  },
  crown: {
    marginBottom: Spacing.one,
  },
  slotName: {
    marginTop: Spacing.two,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    maxWidth: "100%",
  },
  slotExp: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    marginTop: 2,
    marginBottom: Spacing.three,
  },
  platform: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  platformRank: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: "rgba(0,0,0,0.35)",
  },
});
