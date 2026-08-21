/**
 * LeaderboardRow - Single ranked-user row for positions beyond the podium (4+).
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { LeaderboardAvatar } from "./leaderboard-avatar";
import { LeaderboardUserDto } from "@/types/api";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

interface LeaderboardRowProps {
  user: LeaderboardUserDto;
  isCurrentUser: boolean;
  displayExp: number;
  delay: number;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  currentUserTintBg: string;
}

function formatExp(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("vi-VN");
}

export function LeaderboardRow({
  user,
  isCurrentUser,
  displayExp,
  delay,
  cardColor,
  textColor,
  textSecondaryColor,
  currentUserTintBg,
}: LeaderboardRowProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(350)}>
      <AnimatedPressable
        style={[
          styles.row,
          { backgroundColor: isCurrentUser ? currentUserTintBg : cardColor },
          isCurrentUser && styles.rowCurrentUser,
        ]}
        pressScale={0.98}
        disableAnimation
      >
        <Text style={[styles.position, { color: textSecondaryColor }]}>
          {user.position}
        </Text>

        <LeaderboardAvatar
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          userId={user.userId}
          size={40}
        />

        <View style={styles.info}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {user.displayName}
          </Text>
        </View>

        {isCurrentUser && (
          <View style={styles.youBadge}>
            <Text style={styles.youBadgeText}>Bạn</Text>
          </View>
        )}

        <Text style={styles.exp}>{formatExp(displayExp)} EXP</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.two,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  rowCurrentUser: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  position: {
    width: 22,
    textAlign: "center",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
  },
  exp: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
});
