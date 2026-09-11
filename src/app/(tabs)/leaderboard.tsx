import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import {
  LeaderboardPodium,
  LeaderboardRow,
  LeaderboardStatusBanner,
  LeaderboardStickyBar,
  RankTabs,
} from "@/components/leaderboard";
import {
  BorderRadius,
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
import { useOptionalAuth } from "@/contexts/auth-context";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { translateRank } from "@/utils/rank-tier";

export default function LeaderboardScreen() {
  const auth = useOptionalAuth();
  const authUser = auth?.user;
  const { rankId: currentUserRankId, exp: currentFreshExp } = useGamification();
  const { colors, isDark } = useTheme();
  const [ranks, setRanks] = useState<RankResponse[]>([]);
  const [activeRankId, setActiveRankId] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Chặn response cũ ghi đè response mới khi người dùng đổi tab hạng nhanh.
  const leaderboardRequestIdRef = useRef(0);

  const fetchRanks = useCallback(async () => {
    try {
      const data = await rankApi.getRanks();
      setRanks(data);
      if (data.length > 0) {
        setActiveRankId((prev) => {
          if (prev) return prev;
          const found = data.find((r) => r.rankId === currentUserRankId);
          return found ? found.rankId : data[0].rankId;
        });
      }
    } catch (error) {
      console.error("Failed to fetch ranks:", error);
    }
  }, [currentUserRankId]);

  const fetchLeaderboard = useCallback(
    async (targetRankId: number, silent = false) => {
      if (!silent) setIsLoading(true);
      const requestId = ++leaderboardRequestIdRef.current;
      try {
        const data = await rankApi.getLeaderboard(targetRankId);
        if (requestId !== leaderboardRequestIdRef.current) return; // response cũ, bỏ qua
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        if (requestId === leaderboardRequestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchRanks();
    }, [fetchRanks]),
  );

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

  const currentUserId = leaderboardData?.currentUserStanding?.userId;
  const currentUserStanding = leaderboardData?.currentUserStanding;

  const topThree = useMemo(() => {
    const raw = leaderboardData?.topUsers?.slice(0, 3) ?? [];
    return raw.map((item) =>
      item.userId === currentUserId && !item.avatarUrl && authUser?.avatarUrl
        ? { ...item, avatarUrl: authUser.avatarUrl }
        : item,
    );
  }, [leaderboardData?.topUsers, currentUserId, authUser?.avatarUrl]);

  const rest = useMemo(() => {
    const raw = leaderboardData?.topUsers?.slice(3) ?? [];
    return raw.map((item) =>
      item.userId === currentUserId && !item.avatarUrl && authUser?.avatarUrl
        ? { ...item, avatarUrl: authUser.avatarUrl }
        : item,
    );
  }, [leaderboardData?.topUsers, currentUserId, authUser?.avatarUrl]);

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
      currentUserTintBg={
        isDark
          ? Colors.dark.backgroundSelected
          : Colors.light.backgroundSelected
      }
    />
  );

  const renderHeader = () => {
    if (!leaderboardData || !leaderboardData.currentRankInfo) return null;
    const { currentRankInfo } = leaderboardData;
    const isCurrentRank = currentUserStanding?.position !== null;

    return (
      <View>
        <LeaderboardStatusBanner
          rankName={translateRank(currentRankInfo.name)}
          isCurrentRank={isCurrentRank}
          position={currentUserStanding?.position ?? null}
          exp={Math.max(currentUserStanding?.exp ?? 0, currentFreshExp)}
          message={currentUserStanding?.message ?? ""}
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

            {/* Promotion Zone Indicator */}
            <View style={styles.promotionZone}>
              <View
                style={[
                  styles.promotionLine,
                  { backgroundColor: Colors.success },
                ]}
              />
              <View
                style={[
                  styles.promotionBadge,
                  {
                    backgroundColor: isDark
                      ? Colors.success + "33"
                      : Colors.success + "15",
                    borderColor: isDark
                      ? Colors.success + "66"
                      : Colors.success + "40",
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={13}
                  color={Colors.success}
                />
                <Text style={[styles.promotionText, { color: Colors.success }]}>
                  NHÓM DẪN ĐẦU (TOP 3)
                </Text>
              </View>
              <View
                style={[
                  styles.promotionLine,
                  { backgroundColor: Colors.success },
                ]}
              />
            </View>
          </View>
        )}

        {rest.length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Bảng tổng sắp
          </Text>
        )}
      </View>
    );
  };

  return (
    <AnimatedScreen skipEntering>
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

        {/* Đã thêm map() để dịch tên ngay khi truyền vào RankTabs */}
        <RankTabs
          ranks={ranks.map((r) => ({ ...r, name: translateRank(r.name) }))}
          activeRankId={activeRankId}
          currentUserRankId={currentUserRankId}
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
          <View style={styles.listWrap}>
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

            {/* Smart Sticky Bar for Current User (shown if rank is 4+) */}
            {currentUserStanding &&
              currentUserStanding.position !== null &&
              currentUserStanding.position > 3 && (
                <LeaderboardStickyBar
                  position={currentUserStanding.position}
                  displayName={
                    currentUserStanding.displayName ||
                    authUser?.displayName ||
                    "Bạn"
                  }
                  avatarUrl={
                    currentUserStanding.avatarUrl ||
                    authUser?.avatarUrl ||
                    null
                  }
                  userId={currentUserStanding.userId}
                  exp={Math.max(currentUserStanding.exp ?? 0, currentFreshExp)}
                  cardColor={colors.card}
                  textColor={colors.text}
                  textSecondaryColor={colors.textSecondary}
                />
              )}
          </View>
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
  listWrap: {
    flex: 1,
    position: "relative",
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    paddingBottom: 110,
  },
  podiumWrap: {
    marginBottom: Spacing.four,
  },
  promotionZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  promotionLine: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
    opacity: 0.6,
  },
  promotionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  promotionText: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
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
