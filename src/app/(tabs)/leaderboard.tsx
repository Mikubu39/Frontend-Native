/**
 * Leaderboard / League Screen
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";
import { rankApi } from "@/services/api";
import {
  RankResponse,
  LeaderboardResponse,
  LeaderboardUserDto,
} from "@/types/api";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";

export default function LeaderboardScreen() {
  const { rankId: currentUserRankId, exp: currentFreshExp } = useGamification();
  const { colors, isDark } = useTheme();
  const [ranks, setRanks] = useState<RankResponse[]>([]);
  const [activeRankId, setActiveRankId] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRanks = async () => {
    try {
      const data = await rankApi.getRanks();
      setRanks(data);
      if (data.length > 0 && !activeRankId) {
        // Mặc định chọn hạng của user nếu có, không thì chọn hạng đầu tiên
        const found = data.find((r) => r.rankId === currentUserRankId);
        setActiveRankId(found ? found.rankId : data[0].rankId);
      }
    } catch (error) {
      console.error("Failed to fetch ranks:", error);
    }
  };

  const fetchLeaderboard = useCallback(
    async (targetRankId: number, silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const data = await rankApi.getLeaderboard(targetRankId);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRanks();
  }, [currentUserRankId]);

  useEffect(() => {
    if (activeRankId) {
      fetchLeaderboard(activeRankId);
    }
  }, [activeRankId, fetchLeaderboard]);

  const onRefresh = () => {
    setIsRefreshing(true);
    if (activeRankId) {
      fetchLeaderboard(activeRankId, true);
    } else {
      fetchRanks();
    }
  };

  const renderTabMenu = () => (
    <View
      style={[
        styles.tabContainer,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {ranks.map((r) => {
          const isActive = r.rankId === activeRankId;
          return (
            <View key={r.rankId}>
              <AnimatedPressable
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveRankId(r.rankId)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {r.name}
                </Text>
              </AnimatedPressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardUserDto;
    index: number;
  }) => {
    const isTop3 = item.position <= 3;
    const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze
    // Fallback emoji based on position if no avatar
    const fallbackEmojis = [
      "🦊",
      "🐱",
      "🐼",
      "🦉",
      "🦁",
      "🐰",
      "🐨",
      "🦄",
      "🐸",
      "🐙",
    ];
    const emoji = fallbackEmojis[index % fallbackEmojis.length];

    const isCurrentUser =
      leaderboardData?.currentUserStanding?.userId === item.userId;

    return (
      <Animated.View
        entering={FadeIn.delay(index * AnimationPresets.staggerDelay).duration(
          400,
        )}
      >
        <AnimatedPressable
          style={[
            styles.userRow,
            { backgroundColor: colors.card },
            isCurrentUser && [
              styles.currentUserRow,
              { backgroundColor: isDark ? "#232338" : "#F5F3FF" },
            ],
          ]}
          onPress={() => {}}
          pressScale={0.98}
        >
          {/* Rank Number / Badge */}
          <View style={styles.rankContainer}>
            {isTop3 ? (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: rankColors[item.position - 1] },
                ]}
              >
                <Text style={styles.rankBadgeText}>{item.position}</Text>
              </View>
            ) : (
              <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                {item.position}
              </Text>
            )}
          </View>

          {/* User Info */}
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: isDark ? "#232338" : Colors.cream,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.avatar}>{emoji}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userName,
                { color: colors.text },
                isCurrentUser && styles.currentUserText,
              ]}
            >
              {item.displayName}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>Bạn</Text>
              </View>
            )}
          </View>

          {/* XP */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>
              {isCurrentUser ? Math.max(item.exp, currentFreshExp) : item.exp}{" "}
              EXP
            </Text>
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  const renderHeader = () => {
    if (!leaderboardData) return null;
    const { currentRankInfo, currentUserStanding } = leaderboardData;
    const isCurrentRank = currentUserStanding.position !== null;

    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.leagueBanner}
        >
          <Text style={styles.leagueEmoji}>🏆</Text>
          <Text style={styles.leagueName}>Hạng {currentRankInfo.name}</Text>

          <View style={styles.promoCard}>
            {isCurrentRank ? (
              <Text style={styles.promoText}>
                Bạn đang đứng thứ {currentUserStanding.position} với{" "}
                {Math.max(currentUserStanding.exp, currentFreshExp)} EXP! Cố lên
                nhé! 🔥
              </Text>
            ) : (
              <Text style={styles.promoText}>
                {currentUserStanding.message} 🚀
              </Text>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        {/* League Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Bảng xếp hạng
          </Text>
        </View>

        {renderTabMenu()}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={leaderboardData?.topUsers || []}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.four,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  tabContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  tabScrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  tabButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.cream,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  leagueBanner: {
    alignItems: "center",
    borderRadius: BorderRadius.xxl,
    padding: Spacing.seven,
    marginBottom: Spacing.six,
    ...Shadows.lg,
  },
  leagueEmoji: {
    fontSize: 72,
    marginBottom: Spacing.three,
  },
  leagueName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  promoCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginTop: Spacing.five,
    width: "100%",
  },
  promoText: {
    fontSize: FontSizes.sm,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: FontWeights.bold,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  currentUserRow: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#F5F3FF",
    ...Shadows.glow(Colors.primary),
  },
  rankContainer: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  rankBadgeText: {
    color: "#FFFFFF",
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.md,
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.lockedBg,
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  currentUserText: {
    color: Colors.primaryDark,
    fontWeight: FontWeights.extrabold,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 22,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
  },
  xpContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  xpText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
});
