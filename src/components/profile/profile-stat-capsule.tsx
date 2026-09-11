/**
 * ProfileStatCapsule - Floating stat strip that overlaps the hero banner's
 * bottom edge. One elevated surface with internal dividers rather than four
 * separate bordered cards.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CoinMark } from "@/components/ui/coin-mark";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";

interface StatSegment {
  key: string;
  icon: keyof typeof Ionicons.glyphMap | null;
  iconColor: string;
  value: string;
  label: string;
  badge?: string;
}

interface ProfileStatCapsuleProps {
  streak: number;
  exp: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  streakFreezeCount: number;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
}

export function ProfileStatCapsule({
  streak,
  exp,
  coins,
  energy,
  maxEnergy,
  streakFreezeCount,
  cardColor,
  textColor,
  textSecondaryColor,
}: ProfileStatCapsuleProps) {
  const segments: StatSegment[] = [
    {
      key: "streak",
      icon: "flame",
      iconColor: Colors.streakActive,
      value: `${streak}`,
      label: "Streak",
      badge: streakFreezeCount > 0 ? `x${streakFreezeCount}` : undefined,
    },
    {
      key: "exp",
      icon: "star",
      iconColor: Colors.primary,
      value: exp.toLocaleString("vi-VN"),
      label: "EXP",
    },
    {
      key: "coins",
      icon: null,
      iconColor: Colors.accent,
      value: coins.toLocaleString("vi-VN"),
      label: "Xu",
    },
    {
      key: "energy",
      icon: "flash",
      iconColor: Colors.energy,
      value: `${energy}/${maxEnergy}`,
      label: "Năng lượng",
    },
  ];

  return (
    <View style={[styles.capsule, { backgroundColor: cardColor }]}>
      {segments.map((s, i) => (
        <React.Fragment key={s.key}>
          {i > 0 && (
            <View
              style={[styles.divider, { backgroundColor: textSecondaryColor }]}
            />
          )}
          <View style={styles.segment}>
            <View style={styles.iconRow}>
              {s.icon ? (
                <Ionicons name={s.icon} size={17} color={s.iconColor} />
              ) : (
                <CoinMark size={17} />
              )}
              {s.badge && (
                <View style={styles.freezeBadge}>
                  <Ionicons name="snow" size={9} color="#FFFFFF" />
                  <Text style={styles.freezeBadgeText}>{s.badge}</Text>
                </View>
              )}
            </View>
            <Text
              testID={`stat-value-${s.key}`}
              style={[styles.value, { color: textColor }]}
              numberOfLines={1}
            >
              {s.value}
            </Text>
            <Text
              style={[styles.label, { color: textSecondaryColor }]}
              numberOfLines={1}
            >
              {s.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  capsule: {
    flexDirection: "row",
    // Flat top + full hero width: the capsule overlaps the hero card's
    // rounded bottom corners, so its own top edge must be a plain straight
    // line and cover the hero's full width. Rounding the top here (or
    // insetting the width) leaves a wedge where neither shape's fill
    // reaches, and the hero's gradient shows through as a notch.
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingVertical: Spacing.four,
    marginTop: -Spacing.six,
    marginBottom: Spacing.five,
    ...Shadows.md,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  value: {
    fontSize: FontSizes.md,
    fontWeight: "800",
    marginTop: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    opacity: 0.25,
    marginVertical: 4,
  },
  freezeBadge: {
    position: "absolute",
    left: 14,
    top: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    backgroundColor: Colors.streakFrozenDeep,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  freezeBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
});
