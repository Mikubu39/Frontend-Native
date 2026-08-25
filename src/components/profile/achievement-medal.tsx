/**
 * AchievementMedal - One collectible in a horizontal badge/achievement rail.
 * Shared by the monthly-challenge mascots (emoji reward art) and the
 * milestone achievements (Ionicons standing in for generic trophy/medal
 * iconography). Locked entries desaturate under a lock overlay instead of
 * just fading, so "not yet earned" reads at a glance.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, Colors, FontSizes, Shadows } from "@/constants/theme";

interface AchievementMedalProps {
  size?: number;
  ringGradient: [string, string];
  emoji?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  locked?: boolean;
  caption?: string;
  tag?: string;
  surfaceColor: string;
  lockedRing: string;
}

export function AchievementMedal({
  size = 76,
  ringGradient,
  emoji,
  icon,
  iconColor = "#FFFFFF",
  locked = false,
  caption,
  tag,
  surfaceColor,
  lockedRing,
}: AchievementMedalProps) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={locked ? [lockedRing, lockedRing] : ringGradient}
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
              backgroundColor: surfaceColor,
            },
          ]}
        >
          {emoji ? (
            <Text
              style={[
                styles.emoji,
                { fontSize: size * 0.42, opacity: locked ? 0.35 : 1 },
              ]}
            >
              {emoji}
            </Text>
          ) : icon ? (
            <Ionicons
              name={icon}
              size={size * 0.4}
              color={locked ? lockedRing : iconColor}
            />
          ) : null}
        </View>
      </LinearGradient>

      {locked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
        </View>
      )}

      {tag && !locked && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      )}

      {caption && (
        <Text
          style={[
            styles.caption,
            { color: locked ? lockedRing : ringGradient[1] },
          ]}
        >
          {caption}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: 90,
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    ...Shadows.sm,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textAlign: "center",
  },
  lockBadge: {
    position: "absolute",
    bottom: 2,
    right: 18,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    position: "absolute",
    top: -4,
    right: 12,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  caption: {
    marginTop: 8,
    fontSize: FontSizes.md,
    fontWeight: "900",
  },
});
