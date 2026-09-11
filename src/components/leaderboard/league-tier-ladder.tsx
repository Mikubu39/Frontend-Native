/**
 * LeagueTierLadder - Thanh lộ trình giải đấu tương tác với 5 cúp hoạt hình nối liền.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { RankResponse } from "@/types/api";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import {
  LeaderboardTrophy,
  LEAGUE_THEMES,
  normalizeRankKey,
} from "./leaderboard-trophy";
import { translateRank } from "@/utils/rank-tier";

interface LeagueTierLadderProps {
  ranks: RankResponse[];
  activeRankId: number | null;
  currentUserRankId?: number | null;
  onSelect: (rankId: number) => void;
  cardColor: string;
  borderColor: string;
  chipBg: string;
  textSecondaryColor: string;
}

export function LeagueTierLadder({
  ranks,
  activeRankId,
  currentUserRankId,
  onSelect,
  cardColor,
  borderColor,
  textSecondaryColor,
}: LeagueTierLadderProps) {
  const currentUserRank = ranks.find((r) => r.rankId === currentUserRankId);
  const currentUserOrder = currentUserRank?.orderIndex ?? 1;

  const handlePress = (rankId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(rankId);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cardColor, borderBottomColor: borderColor },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ranks.map((r, index) => {
          const isActive = r.rankId === activeRankId;
          const isUserRank = r.rankId === currentUserRankId;
          const isPassed = r.orderIndex < currentUserOrder;
          const isHigher = r.orderIndex > currentUserOrder;

          const leagueKey = normalizeRankKey(r.name);
          const theme = LEAGUE_THEMES[leagueKey];

          return (
            <React.Fragment key={r.rankId}>
              {/* Connecting line between nodes */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        r.orderIndex <= currentUserOrder
                          ? theme.primaryColor
                          : borderColor,
                    },
                  ]}
                />
              )}

              <AnimatedPressable
                onPress={() => handlePress(r.rankId)}
                style={[
                  styles.nodeWrap,
                  isActive && [
                    styles.nodeActive,
                    {
                      borderColor: theme.primaryColor,
                      backgroundColor: theme.badgeBg,
                    },
                  ],
                ]}
                pressScale={0.92}
              >
                {/* Trophy container */}
                <View
                  style={[
                    styles.trophyCircle,
                    {
                      borderColor: isActive
                        ? theme.primaryColor
                        : isUserRank
                          ? "#F59E0B"
                          : "transparent",
                      borderWidth: isActive || isUserRank ? 2.5 : 1,
                    },
                  ]}
                >
                  <LeaderboardTrophy
                    rankName={r.name}
                    size={isActive ? 44 : 38}
                    isLocked={isHigher}
                  />

                  {/* Badges */}
                  {isUserRank && (
                    <View style={styles.userBadge}>
                      <Ionicons name="flame" size={11} color="#FFFFFF" />
                      <Text style={styles.userBadgeText}>Bạn</Text>
                    </View>
                  )}

                  {isPassed && !isUserRank && (
                    <View style={styles.passedBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Rank Name */}
                <Text
                  style={[
                    styles.rankLabel,
                    {
                      color: isActive ? theme.primaryColor : textSecondaryColor,
                      fontWeight: isActive
                        ? FontWeights.extrabold
                        : FontWeights.bold,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {translateRank(r.name)}
                </Text>
              </AnimatedPressable>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: "center",
  },
  connector: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  nodeWrap: {
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.lg,
  },
  nodeActive: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
  },
  trophyCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
    ...Shadows.sm,
  },
  userBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  userBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: FontWeights.extrabold,
    marginLeft: 1,
  },
  passedBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  rankLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
    textAlign: "center",
  },
});
