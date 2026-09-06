/**
 * LeaderboardStickyBar - Thanh nổi thông minh ở mép dưới hiển thị vị trí của bạn.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { LeaderboardAvatar } from "./leaderboard-avatar";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

interface LeaderboardStickyBarProps {
  position: number | null | undefined;
  displayName: string;
  avatarUrl: string | null;
  userId: number;
  exp: number;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  onPress?: () => void;
}

function formatExp(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function LeaderboardStickyBar({
  position,
  displayName,
  avatarUrl,
  userId,
  exp,
  cardColor,
  textColor,
  textSecondaryColor,
  onPress,
}: LeaderboardStickyBarProps) {
  if (!position) return null;

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <AnimatedPressable
        style={[
          styles.card,
          { backgroundColor: cardColor, borderColor: Colors.primary },
        ]}
        onPress={onPress}
        pressScale={0.98}
      >
        {/* Position Circle */}
        <View style={styles.posBadge}>
          <Text style={styles.positionText}>{position}</Text>
        </View>

        {/* Avatar */}
        <LeaderboardAvatar
          displayName={displayName}
          avatarUrl={avatarUrl}
          userId={userId}
          size={38}
          ringColor={Colors.primary}
          ringWidth={2}
        />

        {/* Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.youBadge}>
              <Ionicons name="flame" size={10} color="#FFFFFF" />
              <Text style={styles.youBadgeText}>Bạn</Text>
            </View>
          </View>
          <Text style={[styles.statusHint, { color: textSecondaryColor }]}>
            Vị trí hiện tại của bạn
          </Text>
        </View>

        {/* EXP Badge */}
        <View style={styles.expContainer}>
          <Text style={[styles.expText, { color: Colors.primary }]}>
            {formatExp(exp)}
          </Text>
          <Text style={styles.expUnit}>EXP</Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 12,
    left: Spacing.four,
    right: Spacing.four,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    gap: Spacing.three,
    ...Shadows.lg,
  },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    color: "#FFFFFF",
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    maxWidth: "80%",
  },
  youBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: FontWeights.extrabold,
  },
  statusHint: {
    fontSize: 10,
    marginTop: 1,
  },
  expContainer: {
    alignItems: "flex-end",
    backgroundColor: "rgba(59, 76, 130, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
  },
  expText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  expUnit: {
    fontSize: 9,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
});
