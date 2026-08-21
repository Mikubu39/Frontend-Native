/**
 * Leaderboard / Rank Screen
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import {
  LeaderboardPodium,
  LeaderboardRow,
  LeaderboardStatusBanner,
  RankTabs,
} from "@/components/leaderboard";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
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

  const fetchRanks = useCallback(async () => {
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
  }, [activeRankId, currentUserRankId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const topThree = leaderboardData?.topUsers.slice(0, 3) ?? [];
  const rest = leaderboardData?.topUsers.slice(3) ?? [];
  const currentUserId = leaderboardData?.currentUserStanding?.userId;

  const expFor = (item: LeaderboardUserDto) =>
    item.userId === currentUserId
      ? Math.max(item.exp ?? 0, currentFreshExp)
      : (item.exp ?? 0);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardUserDto;
    index: number;
  }) => (
    <LeaderboardRow
      user={item}
      isCurrentUser={item.userId === currentUserId}
      displayExp={expFor(item)}
      delay={index * AnimationPresets.staggerDelay}
      cardColor={colors.card}
      textColor={colors.text}
      textSecondaryColor={colors.textSecondary}
      currentUserTintBg={isDark ? "#2E2A45" : "#F5F3FF"}
    />
  );

  const renderHeader = () => {
    if (!leaderboardData) return null;
    const { currentRankInfo, currentUserStanding } = leaderboardData;
    const isCurrentRank = currentUserStanding.position !== null;

    return (
      <View>
        <LeaderboardStatusBanner
          rankName={currentRankInfo.name}
          isCurrentRank={isCurrentRank}
          position={currentUserStanding.position}
          exp={Math.max(currentUserStanding.exp ?? 0, currentFreshExp)}
          message={currentUserStanding.message}
        />

        {topThree.length > 0 && (
          <View style={styles.podiumWrap}>
            <LeaderboardPodium
              topThree={topThree}
              currentUserId={currentUserId ?? -1}
              currentFreshExp={currentFreshExp}
              textOnCard={colors.text}
              textOnCardSecondary={colors.textSecondary}
            />
          </View>
        )}

        {rest.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Hạng 4 trở đi
          </Text>
        )}
      </View>
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
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

        <RankTabs
          ranks={ranks}
          activeRankId={activeRankId}
          onSelect={setActiveRankId}
          cardColor={colors.card}
          borderColor={colors.border}
          chipBg={colors.backgroundElement}
          textSecondaryColor={colors.textSecondary}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={rest}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              topThree.length === 0 ? (
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  Chưa có dữ liệu xếp hạng.
                </Text>
              ) : null
            }
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
  },
  header: {
    paddingVertical: Spacing.four,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
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
  podiumWrap: {
    marginBottom: Spacing.six,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.three,
    marginLeft: Spacing.one,
  },
  emptyText: {
    textAlign: "center",
    fontSize: FontSizes.md,
    marginTop: Spacing.eight,
  },
});
