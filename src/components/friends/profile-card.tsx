/**
 * ProfileCard - Shared presentational card for a friend/user profile.
 *
 * Extracted from `src/app/friends/view-search-profile.tsx` and
 * `src/app/friends/profile/[username].tsx`, which had ~90% duplicated
 * markup/styles (avatar, stats row, optional rank badge, follow button)
 * that had already started to drift between the two screens. Each screen
 * keeps its own data-loading logic (route params vs fetch-by-username) and
 * simply renders this component with the data it has.
 */

import { GradientButton } from "@/components/ui/gradient-button";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ThemeColors } from "@/types";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export interface ProfileCardStat {
  /** Unique key for the stat row (used as the React key). */
  key: string;
  value: string | number;
  label: string;
}

export interface ProfileCardProps {
  displayName: string;
  /** Optional @handle shown under the display name. */
  username?: string;
  avatarUrl?: string | null;
  stats: ProfileCardStat[];
  /** Optional rank line shown under the stats row, e.g. "Hạng Kim cương". */
  rankLabel?: string;
  isFollowing: boolean;
  onToggleFollow: () => void;
  followLoading?: boolean;
  colors: ThemeColors;
}

export function ProfileCard({
  displayName,
  username,
  avatarUrl,
  stats,
  rankLabel,
  isFollowing,
  onToggleFollow,
  followLoading = false,
  colors,
}: ProfileCardProps) {
  return (
    <View
      style={[
        styles.profileHeader,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderSubtle,
          borderWidth: 1,
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {displayName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.fullName,
          { color: colors.text },
          !username && styles.fullNameNoUsername,
        ]}
      >
        {displayName}
      </Text>

      {username ? (
        <Text style={[styles.username, { color: colors.textSecondary }]}>
          @{username}
        </Text>
      ) : null}

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.key} style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {rankLabel ? (
        <Text style={[styles.rankBadge, { color: colors.textSecondary }]}>
          {rankLabel}
        </Text>
      ) : null}

      <View style={styles.actionContainer}>
        <GradientButton
          title={isFollowing ? "Đang theo dõi" : "Theo dõi"}
          onPress={onToggleFollow}
          disabled={followLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.four,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four,
  },
  avatarText: {
    fontSize: 40,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  fullName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    color: Colors.textPrimary,
    marginBottom: Spacing.one,
  },
  fullNameNoUsername: {
    marginBottom: Spacing.four,
  },
  username: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.sans,
    color: Colors.textSecondary,
    marginBottom: Spacing.four,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.six,
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.sans,
    color: Colors.textSecondary,
    marginTop: Spacing.one,
  },
  rankBadge: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    fontFamily: Fonts.rounded,
    marginBottom: Spacing.four,
    textAlign: "center",
  },
  actionContainer: {
    width: "100%",
  },
});
