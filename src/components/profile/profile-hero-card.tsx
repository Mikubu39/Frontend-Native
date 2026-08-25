/**
 * ProfileHeroCard - Gradient banner that anchors the profile screen: avatar
 * with a tier-tinted ring + rank badge, name, handle/join pill, and a
 * rank chip that deep-links into the leaderboard.
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AvatarDisplay } from "@/components/user/avatar-display";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import type { RankTierStyle } from "@/utils/rank-tier";

interface ProfileHeroCardProps {
  displayName: string;
  handle: string;
  joinYear: number;
  rankName: string;
  tier: RankTierStyle;
  avatarUrl: string;
  avatarSize: number;
  isLoadingAvatar: boolean;
  onAvatarPress: () => void;
  onSharePress: () => void;
  onSettingsPress: () => void;
  onRankPress: () => void;
}

export function ProfileHeroCard({
  displayName,
  handle,
  joinYear,
  rankName,
  tier,
  avatarUrl,
  avatarSize,
  isLoadingAvatar,
  onAvatarPress,
  onSharePress,
  onSettingsPress,
  onRankPress,
}: ProfileHeroCardProps) {
  return (
    <LinearGradient
      colors={Colors.gradients.profile}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.topRow}>
        <AnimatedPressable
          style={styles.glassIconBtn}
          onPress={onRankPress}
          pressScale={0.94}
        >
          <Ionicons name="shield-checkmark" size={15} color="#FFFFFF" />
          <Text style={styles.rankPillText}>{rankName}</Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color="rgba(255,255,255,0.85)"
          />
        </AnimatedPressable>

        <View style={styles.topActions}>
          <AnimatedPressable
            style={styles.iconBtn}
            onPress={onSharePress}
            pressScale={0.9}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.iconBtn}
            onPress={onSettingsPress}
            pressScale={0.9}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </AnimatedPressable>
        </View>
      </View>

      <Pressable
        onPress={onAvatarPress}
        hitSlop={8}
        style={styles.avatarPressable}
      >
        <View
          style={[
            styles.avatarRing,
            {
              width: avatarSize + 12,
              height: avatarSize + 12,
              borderRadius: (avatarSize + 12) / 2,
              borderColor: tier.solid,
            },
          ]}
        >
          {isLoadingAvatar ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AvatarDisplay
              uri={avatarUrl}
              size={avatarSize}
              backgroundColor="#F5ECFF"
              borderWidth={3}
              borderColor="#FFFFFF"
            />
          )}
        </View>
        <View style={styles.editBadge}>
          <Ionicons name="pencil" size={14} color="#FFFFFF" />
        </View>
      </Pressable>

      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      <View style={styles.handlePill}>
        <Text style={styles.handleText}>
          @{handle} · Từ {joinYear}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: BorderRadius.xxl,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight,
    paddingHorizontal: Spacing.five,
    alignItems: "center",
    ...Shadows.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.four,
  },
  glassIconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: BorderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: "56%",
  },
  rankPillText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  topActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressable: {
    marginTop: Spacing.two,
  },
  avatarRing: {
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: {
    color: "#FFFFFF",
    fontSize: FontSizes.xl,
    fontWeight: "800",
    marginTop: Spacing.three,
    maxWidth: "100%",
  },
  handlePill: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: Spacing.two,
  },
  handleText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
