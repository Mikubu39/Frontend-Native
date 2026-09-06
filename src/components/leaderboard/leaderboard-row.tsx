import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
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

export const LeaderboardRow = React.memo(function LeaderboardRow({
  user,
  isCurrentUser,
  displayExp,
  delay,
  cardColor,
  textColor,
  textSecondaryColor,
  currentUserTintBg,
}: LeaderboardRowProps) {
  const subtitle = user.level
    ? `Cấp độ ${user.level}`
    : user.username
      ? `@${user.username}`
      : "Người học chăm chỉ";

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(300)}>
      <AnimatedPressable
        style={[
          styles.row,
          { backgroundColor: isCurrentUser ? currentUserTintBg : cardColor },
          isCurrentUser && styles.rowCurrentUser,
        ]}
        pressScale={0.98}
        disableAnimation
      >
        {/* Position Badge */}
        <View
          style={[
            styles.posBadge,
            isCurrentUser && { backgroundColor: Colors.primary },
          ]}
        >
          <Text
            style={[
              styles.position,
              { color: isCurrentUser ? "#FFFFFF" : textSecondaryColor },
            ]}
          >
            {user.position}
          </Text>
        </View>

        {/* Avatar */}
        <LeaderboardAvatar
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          userId={user.userId}
          size={44}
          ringColor={isCurrentUser ? Colors.primary : undefined}
          ringWidth={isCurrentUser ? 2 : 0}
        />

        {/* 2-tier Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {user.displayName}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Ionicons name="flame" size={10} color="#FFFFFF" />
                <Text style={styles.youBadgeText}>Bạn</Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.subtitle, { color: textSecondaryColor }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>

        {/* EXP Badge */}
        <View
          style={[
            styles.expContainer,
            isCurrentUser && styles.expContainerUser,
          ]}
        >
          <Text
            style={[
              styles.expText,
              { color: isCurrentUser ? Colors.primary : textColor },
            ]}
          >
            {formatExp(displayExp)}
          </Text>
          <Text style={styles.expUnit}>EXP</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.two + 2,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  rowCurrentUser: {
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  position: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.1,
    maxWidth: "80%",
  },
  subtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  youBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
  },
  expContainer: {
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingVertical: 5,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
  },
  expContainerUser: {
    backgroundColor: "rgba(59, 76, 130, 0.12)",
  },
  expText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  expUnit: {
    fontSize: 9,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});
