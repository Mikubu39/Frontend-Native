/**
 * LeaderboardAvatar - Shows a user's real avatar when available, falling back
 * to a deterministic initials badge (no random per-index emoji).
 */

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { FontWeights } from "@/constants/theme";
import { resolveMediaUrl } from "@/utils/media";
import { useImageFallback } from "@/hooks/use-image-fallback";

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
  // Avatar backend lưu tương đối (`/uploads/images/avatars/...`) nên cần ghép base URL.
  // Tải hỏng thì quay về chữ cái đầu của tên — nhánh dự phòng vốn đã có sẵn.
  const { uri: resolvedUri, onError } = useImageFallback(
    resolveMediaUrl(avatarUrl),
  );
  const hasValidUri = !!resolvedUri;
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
          source={{ uri: resolvedUri as string }}
          style={{
            width: size - ringWidth * 2,
            height: size - ringWidth * 2,
            borderRadius: (size - ringWidth * 2) / 2,
          }}
          resizeMode="cover"
          onError={onError}
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
