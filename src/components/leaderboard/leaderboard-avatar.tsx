/**
 * LeaderboardAvatar - Shows a user's real avatar when available, falling back
 * to a deterministic initials badge (no random per-index emoji).
 */

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { FontWeights } from "@/constants/theme";

interface LeaderboardAvatarProps {
  displayName: string;
  avatarUrl?: string | null;
  userId: number;
  size?: number;
  ringColor?: string;
  ringWidth?: number;
}

const INITIAL_PALETTE = [
  "#8B5CF6",
  "#E91E8E",
  "#0EA5E9",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#6366F1",
  "#EC4899",
];

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function getPaletteColor(userId: number): string {
  return INITIAL_PALETTE[userId % INITIAL_PALETTE.length];
}

export function LeaderboardAvatar({
  displayName,
  avatarUrl,
  userId,
  size = 44,
  ringColor,
  ringWidth = 0,
}: LeaderboardAvatarProps) {
  const hasValidUri = !!avatarUrl && /^https?:\/\//i.test(avatarUrl);
  const bg = getPaletteColor(userId);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: ringColor ?? "transparent",
          backgroundColor: hasValidUri ? "transparent" : bg,
        },
      ]}
    >
      {hasValidUri ? (
        <Image
          source={{ uri: avatarUrl as string }}
          style={{
            width: size - ringWidth * 2,
            height: size - ringWidth * 2,
            borderRadius: (size - ringWidth * 2) / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {getInitial(displayName)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    color: "#FFFFFF",
    fontWeight: FontWeights.extrabold,
  },
});
