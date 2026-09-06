import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LeaderboardUserDto } from "@/types/api";
import { LeaderboardAvatar } from "./leaderboard-avatar";
import { LeaderboardTrophy } from "./leaderboard-trophy";
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
  trophySize: number;
  badgeColor: string;
}

const TIER_STYLES: Record<1 | 2 | 3, TierStyle> = {
  1: {
    gradient: ["#FBBF24", "#D97706"],
    ring: "#F59E0B",
    platformHeight: 64,
    avatarSize: 68,
    trophySize: 28,
    badgeColor: "#F59E0B",
  },
  2: {
    gradient: ["#CBD5E1", "#64748B"],
    ring: "#94A3B8",
    platformHeight: 46,
    avatarSize: 56,
    trophySize: 24,
    badgeColor: "#94A3B8",
  },
  3: {
    gradient: ["#FDBA74", "#C2410C"],
    ring: "#CD7F32",
    platformHeight: 36,
    avatarSize: 56,
    trophySize: 24,
    badgeColor: "#CD7F32",
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
      {/* Avatar with attached trophy medal */}
      <View style={styles.avatarWrap}>
        <LeaderboardAvatar
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          userId={user.userId}
          size={tier.avatarSize}
          ringColor={tier.ring}
          ringWidth={2.5}
        />
        <View style={[styles.trophyBadge, { top: -6, right: -6 }]}>
          <LeaderboardTrophy podiumPlace={place} size={tier.trophySize} />
        </View>
      </View>

      {/* User Name */}
      <Text
        style={[
          styles.slotName,
          {
            color: isCurrentUser ? tier.badgeColor : textOnCard,
            fontWeight: isCurrentUser
              ? FontWeights.extrabold
              : FontWeights.bold,
          },
        ]}
        numberOfLines={1}
      >
        {isCurrentUser ? "Bạn" : user.displayName}
      </Text>

      {/* EXP */}
      <View style={styles.expPill}>
        <Text style={[styles.slotExp, { color: textOnCardSecondary }]}>
          {formatExp(displayExp)} EXP
        </Text>
      </View>

      {/* Slim 3D Platform */}
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
    paddingHorizontal: Spacing.two,
  },
  slot: {
    flex: 1,
    maxWidth: 110,
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  trophyBadge: {
    position: "absolute",
    ...Shadows.sm,
  },
  slotName: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    textAlign: "center",
    maxWidth: "100%",
  },
  expPill: {
    marginTop: 2,
    marginBottom: 8,
  },
  slotExp: {
    fontSize: 11,
    fontWeight: FontWeights.bold,
  },
  platform: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  platformRank: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
