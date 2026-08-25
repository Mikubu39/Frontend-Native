import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { AchievementMedal } from "@/components/profile/achievement-medal";
import { IncompleteProfileAlert } from "@/components/profile/incomplete-profile-alert";
import { ProfileHeroCard } from "@/components/profile/profile-hero-card";
import { ProfileStatCapsule } from "@/components/profile/profile-stat-capsule";
import { RankProgressBar } from "@/components/profile/rank-progress-bar";
import { StreakCalendarStrip } from "@/components/profile/streak-calendar-strip";
import { AvatarPickerModal } from "@/components/user/avatar-picker-modal";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import {
  buildAvatarUrl,
  DEFAULT_AVATAR_CONFIG,
  parseAvatarUrl,
  type AvatarConfig,
} from "@/data/avatar-options";
import { achievementsApi, rankApi } from "@/services/api";
import { avatarApi } from "@/services/api/avatar";
import { streakApi } from "@/services/api/streak";
import { userService } from "@/services/api/user";
import { storage } from "@/services/storage/async-storage";
import {
  AchievementResponse,
  PublicProfileResponse,
  RankResponse,
} from "@/types/api";
import { getRankTierStyle } from "@/utils/rank-tier";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Kích thước avatar chính trên Profile - đổi 1 chỗ này để đồng bộ mọi nơi liên quan.
const AVATAR_SIZE = 108;

/**
 * Lấy năm tham gia thật từ user.createdAt (backend trả về dạng ISO string,
 * vd "2025-03-14T08:00:00"). Nếu chưa có field này (BE chưa trả), fallback
 * về năm hiện tại thay vì hardcode "2025" như cũ.
 */
function getJoinYear(createdAt?: string | null): number {
  if (!createdAt) return new Date().getFullYear();
  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime())
    ? new Date().getFullYear()
    : parsed.getFullYear();
}

const MONTHLY_BADGES: { emoji: string; label: string; locked?: boolean }[] = [
  { emoji: "🐻", label: "Gấu chăm chỉ" },
  { emoji: "🐸", label: "Ếch nhanh nhẹn" },
  { emoji: "🐙", label: "Bạch tuộc đa năng" },
  { emoji: "👻", label: "Ma tháng 10", locked: true },
];

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    streak,
    exp,
    coins,
    energy,
    maxEnergy,
    rankId,
    rankName,
    streakFreezeCount,
  } = useGamification();
  const { colors, isDark } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    buildAvatarUrl(DEFAULT_AVATAR_CONFIG),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [ranks, setRanks] = useState<RankResponse[]>([]);
  const [achievements, setAchievements] = useState<AchievementResponse[]>([]);
  const [publicProfile, setPublicProfile] =
    useState<PublicProfileResponse | null>(null);
  const [studyDates, setStudyDates] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAvatar = async () => {
      try {
        const url = await avatarApi.getAvatarUrl();
        if (isMounted) {
          setAvatarUrl(url);
        }
      } catch {
        if (isMounted) {
          setAvatarUrl(buildAvatarUrl(DEFAULT_AVATAR_CONFIG));
        }
      } finally {
        if (isMounted) {
          setIsLoadingAvatar(false);
        }
      }
    };

    const loadBannerState = async () => {
      try {
        const dismissed = await storage.get("profile_banner_dismissed");
        if (isMounted && dismissed === "true") {
          setIsBannerDismissed(true);
        }
      } catch (e) {
        // ignore
      }
    };

    const loadRanks = async () => {
      try {
        const data = await rankApi.getRanks();
        if (isMounted) setRanks(data);
      } catch (error) {
        console.error("Failed to fetch ranks:", error);
      }
    };

    const loadAchievements = async () => {
      try {
        const data = await achievementsApi.getMyAchievements();
        if (isMounted) setAchievements(data);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      }
    };

    const loadStudyDates = async () => {
      try {
        const data = await streakApi.getStreakCalendar(30);
        if (isMounted) setStudyDates(data);
      } catch (error) {
        console.error("Failed to fetch streak calendar:", error);
      }
    };

    loadAvatar();
    loadBannerState();
    loadRanks();
    loadAchievements();
    loadStudyDates();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const id = Number(user?.id);
    if (!id) return;

    userService
      .getPublicProfile(id)
      .then((data) => {
        if (isMounted) setPublicProfile(data);
      })
      .catch((error) => {
        console.error("Failed to fetch public profile:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSaveAvatar = async (config: AvatarConfig) => {
    const nextUrl = buildAvatarUrl(config);
    setAvatarUrl(nextUrl);
    await avatarApi.updateAvatarUrl(nextUrl);
  };

  const joinYear = getJoinYear((user as any)?.createdAt);

  const isProfileIncomplete =
    (!user?.displayName ||
      user?.displayName === user?.email ||
      user?.displayName === "Dương Gia Đắc" ||
      user?.displayName === "Google User" ||
      user?.displayName.includes("Mock User") ||
      !(user as any)?.phoneNumber) &&
    !isBannerDismissed;

  const handleDismissBanner = async () => {
    setIsBannerDismissed(true);
    await storage.set("profile_banner_dismissed", "true");
  };

  const sortedRanks = useMemo(
    () => [...ranks].sort((a, b) => a.orderIndex - b.orderIndex),
    [ranks],
  );
  const currentRankIndex = sortedRanks.findIndex((r) => r.rankId === rankId);
  const currentRank =
    currentRankIndex >= 0 ? sortedRanks[currentRankIndex] : null;
  const nextRank =
    currentRankIndex >= 0 && currentRankIndex < sortedRanks.length - 1
      ? sortedRanks[currentRankIndex + 1]
      : null;
  const tier = getRankTierStyle(currentRank?.orderIndex ?? rankId);
  const rankProgress =
    currentRank &&
    nextRank &&
    nextRank.minExpRequired > currentRank.minExpRequired
      ? (exp - currentRank.minExpRequired) /
        (nextRank.minExpRequired - currentRank.minExpRequired)
      : 1;
  const expToNext = nextRank
    ? Math.max(0, nextRank.minExpRequired - exp)
    : null;

  return (
    <AnimatedScreen>
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar style="light" />
        <AvatarPickerModal
          visible={isModalVisible}
          initialConfig={parseAvatarUrl(avatarUrl)}
          onClose={() => setIsModalVisible(false)}
          onSave={handleSaveAvatar}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <ProfileHeroCard
            displayName={user?.displayName || "Người học Kotodama"}
            handle={user?.email?.split("@")[0].toUpperCase() || "USER"}
            joinYear={joinYear}
            rankName={rankName}
            tier={tier}
            avatarUrl={avatarUrl}
            avatarSize={AVATAR_SIZE}
            isLoadingAvatar={isLoadingAvatar}
            onAvatarPress={() => setIsModalVisible(true)}
            onSharePress={() => router.push("/profile/qr")}
            onSettingsPress={() => router.push("/settings")}
            onRankPress={() => router.push("/(tabs)/leaderboard")}
          />

          <ProfileStatCapsule
            streak={streak}
            exp={exp}
            coins={coins}
            energy={energy}
            maxEnergy={maxEnergy}
            streakFreezeCount={streakFreezeCount}
            cardColor={colors.card}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
          />

          {isProfileIncomplete && (
            <IncompleteProfileAlert
              isDark={isDark}
              onPress={() => router.push("/profile/edit")}
              onDismiss={handleDismissBanner}
            />
          )}

          {currentRank && (
            <RankProgressBar
              currentRankName={rankName}
              nextRankName={nextRank?.name ?? null}
              currentTier={tier}
              progress={rankProgress}
              expToNext={expToNext}
              cardColor={colors.card}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              borderColor={colors.border}
            />
          )}

          {/* STREAK CALENDAR (30 ngày gần nhất) */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            LỊCH SỬ HỌC
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <StreakCalendarStrip
              studyDates={studyDates}
              days={30}
              activeColor="#FF9600"
              inactiveColor={colors.border}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
            />
          </ScrollView>

          {/* Community card */}
          <View
            style={[
              styles.communityCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.statsRow}>
              <AnimatedPressable
                style={styles.statItem}
                pressScale={0.95}
                onPress={() =>
                  router.push({
                    pathname: "/friends/connections",
                    params: { userId: user?.id ?? "", type: "following" },
                  })
                }
              >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {publicProfile?.followingCount ?? 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Đang theo dõi
                </Text>
              </AnimatedPressable>
              <View
                style={[styles.statDivider, { backgroundColor: colors.border }]}
              />
              <AnimatedPressable
                style={styles.statItem}
                pressScale={0.95}
                onPress={() =>
                  router.push({
                    pathname: "/friends/connections",
                    params: { userId: user?.id ?? "", type: "followers" },
                  })
                }
              >
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {publicProfile?.followerCount ?? 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Người theo dõi
                </Text>
              </AnimatedPressable>
            </View>

            <AnimatedPressable
              style={styles.addFriendBtn}
              onPress={() => router.push("/friends/search")}
              pressScale={0.97}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" />
              <Text style={styles.addFriendText}>THÊM BẠN BÈ</Text>
            </AnimatedPressable>
          </View>

          {/* FRIENDS STREAK SECTION */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            STREAK BẠN BÈ
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {[1, 2, 3, 4, 5].map((_, i) => (
              <View
                key={i}
                style={[styles.dashedCircle, { borderColor: colors.border }]}
              >
                <Ionicons name="add" size={30} color={colors.textSecondary} />
              </View>
            ))}
          </ScrollView>

          {/* MONTHLY CHALLENGE BADGES */}
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginBottom: 0 },
              ]}
            >
              HUY HIỆU THỬ THÁCH THÁNG
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {MONTHLY_BADGES.map((badge, i) => (
              <AchievementMedal
                key={i}
                emoji={badge.emoji}
                ringGradient={Colors.gradients.reward as [string, string]}
                locked={badge.locked}
                surfaceColor={colors.card}
                lockedRing={colors.border}
              />
            ))}
          </ScrollView>

          {/* ACHIEVEMENTS */}
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginBottom: 0 },
              ]}
            >
              THÀNH TÍCH
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalScroll,
              { paddingBottom: 4 },
            ]}
          >
            {achievements.map((a) => (
              <View key={a.achievementId} style={styles.achievementCell}>
                <AchievementMedal
                  emoji={a.icon}
                  ringGradient={["#FFD966", "#F5A623"]}
                  locked={!a.unlocked}
                  caption={
                    a.unlocked ? undefined : `${a.progress}/${a.threshold}`
                  }
                  surfaceColor={colors.card}
                  lockedRing={colors.border}
                />
                <Text
                  style={[
                    styles.achievementLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {a.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 100, // Important for bottom tab bar clearance
  },
  communityCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.five,
    marginBottom: Spacing.six,
    ...Shadows.sm,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
    gap: Spacing.eight,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },
  statNumber: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  addFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    width: "100%",
    gap: 8,
  },
  addFriendText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: Spacing.three,
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  horizontalScroll: {
    gap: Spacing.four,
    marginBottom: Spacing.six,
    paddingRight: Spacing.five,
    paddingTop: Spacing.two,
  },
  dashedCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementCell: {
    alignItems: "center",
  },
  achievementLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
  },
});
