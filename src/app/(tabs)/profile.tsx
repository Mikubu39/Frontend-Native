import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AvatarDisplay } from "@/components/user/avatar-display";
import { AvatarPickerModal } from "@/components/user/avatar-picker-modal";
import { BorderRadius, Colors, Shadows, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import {
  buildAvatarUrl,
  DEFAULT_AVATAR_CONFIG,
  parseAvatarUrl,
  type AvatarConfig,
} from "@/data/avatar-options";
import { avatarApi } from "@/services/api/avatar";
import { storage } from "@/services/storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Kích thước avatar chính trên Profile - đổi 1 chỗ này để đồng bộ mọi nơi liên quan.
const AVATAR_SIZE = 132;

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

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { streak, exp, coins } = useGamification();
  const { colors, isDark } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    buildAvatarUrl(DEFAULT_AVATAR_CONFIG),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

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

    loadAvatar();
    loadBannerState();
    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
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
        {/* TOP SECTION */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {user?.displayName || "Dương Gia Đắc"}
          </Text>
          <View style={styles.headerActions}>
            <AnimatedPressable
              onPress={() => router.push("/profile/qr")}
              pressScale={0.9}
            >
              <Ionicons name="share-outline" size={26} color={colors.text} />
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => router.push("/settings")}
              pressScale={0.9}
            >
              <Ionicons name="settings-outline" size={26} color={colors.text} />
            </AnimatedPressable>
          </View>
        </View>

        {/* INCOMPLETE PROFILE BANNER */}
        {isProfileIncomplete && (
          <View
            style={[
              styles.incompleteBanner,
              { backgroundColor: "#FFF4E5", borderColor: "#FFB74D" },
            ]}
          >
            <AnimatedPressable
              style={styles.incompleteBannerContent}
              onPress={() => router.push("/profile/edit")}
              pressScale={0.97}
            >
              <Ionicons name="alert-circle" size={32} color="#F57C00" />
              <View style={{ flex: 1 }}>
                <Text style={styles.incompleteBannerTitle}>
                  Tài khoản chưa hoàn tất
                </Text>
                <Text style={styles.incompleteBannerDesc}>
                  Bạn còn thiếu thông tin (số điện thoại, tên). Cập nhật ngay!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F57C00" />
            </AnimatedPressable>
            <Pressable
              style={styles.dismissBtn}
              onPress={handleDismissBanner}
              hitSlop={15}
            >
              <Ionicons name="close" size={20} color="#F57C00" />
            </Pressable>
          </View>
        )}

        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Avatar - bấm vào để mở modal chỉnh sửa, có badge bút chì báo hiệu */}
          <Pressable onPress={() => setIsModalVisible(true)} hitSlop={8}>
            <View style={styles.avatarWrap}>
              {isLoadingAvatar ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <AvatarDisplay
                  uri={avatarUrl}
                  size={AVATAR_SIZE}
                  backgroundColor={isDark ? "#2A2A3E" : "#F5ECFF"}
                />
              )}
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          {/* User Info Row */}
          <View style={styles.userInfoRow}>
            <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
              @{user?.email?.split("@")[0].toUpperCase() || "USER"} • THAM GIA
              TỪ {joinYear}
            </Text>
          </View>

          {/* Follower Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Đang theo dõi
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>4</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Người theo dõi
              </Text>
            </View>
          </View>

          {/* Add Friend Button */}
          <AnimatedPressable
            style={[
              styles.addFriendBtn,
              {
                backgroundColor: colors.card,
                borderColor: Colors.primary,
              },
            ]}
            onPress={() => router.push("/friends/search")}
            pressScale={0.97}
          >
            <Ionicons name="person-add" size={20} color={Colors.primary} />
            <Text style={styles.addFriendText}>THÊM BẠN BÈ</Text>
          </AnimatedPressable>
        </View>

        {/* OVERVIEW SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          TỔNG QUAN
        </Text>
        <View style={styles.overviewGrid}>
          <View
            style={[
              styles.overviewItem,
              styles.overviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.overviewIcon}>🔥</Text>
            <View>
              <Text style={[styles.overviewText, { color: colors.text }]}>
                {streak} ngày
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Streak
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.overviewItem,
              styles.overviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.overviewIcon}>⚡</Text>
            <View>
              <Text style={[styles.overviewText, { color: colors.text }]}>
                {exp} KN
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Tổng KN
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.overviewItem,
              styles.overviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.overviewIcon}>🪙</Text>
            <View>
              <Text style={[styles.overviewText, { color: colors.text }]}>
                {coins} Xu
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Tổng Xu
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.overviewItem,
              styles.overviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.overviewIcon}>🏅</Text>
            <View>
              <Text style={[styles.overviewText, { color: colors.text }]}>
                0 lần
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Top 3
              </Text>
            </View>
          </View>
        </View>

        {/* FRIENDS STREAK SECTION */}
        <Text style={styles.sectionTitle}>STREAK BẠN BÈ</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {[1, 2, 3, 4, 5].map((_, i) => (
            <View key={i} style={styles.dashedCircle}>
              <Ionicons name="add" size={32} color={Colors.locked} />
            </View>
          ))}
        </ScrollView>

        {/* MONTHLY CHALLENGE BADGES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>HUY HIỆU THỬ THÁCH THÁNG</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {["🐻", "🐸", "🐙", "👻"].map((emoji, i) => (
            <View
              key={i}
              style={[styles.badgeCircle, { opacity: i === 3 ? 0.3 : 1 }]}
            >
              <Text style={styles.badgeEmoji}>{emoji}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ACHIEVEMENTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>THÀNH TÍCH</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {["🥇", "🏆", "🎯", "🌟"].map((emoji, i) => (
            <View key={i} style={styles.achievementContainer}>
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeEmoji}>{emoji}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>MỚI</Text>
              </View>
              <Text style={styles.achievementNumber}>
                {i === 0 ? "25" : i === 1 ? "500" : "20000"}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Important for bottom tab bar clearance
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Shadows.md,
  },
  incompleteBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
  },
  incompleteBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  incompleteBannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 2,
  },
  incompleteBannerDesc: {
    fontSize: 13,
    color: "#E65100",
    opacity: 0.8,
  },
  dismissBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#F5ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four,
    overflow: "hidden",
  },
  editBadge: {
    position: "absolute",
    bottom: Spacing.four + 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...Shadows.sm,
  },
  avatarEmoji: {
    fontSize: 60,
    lineHeight: 60,
  },
  userInfoRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  userHandle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 40,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  addFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    gap: 10,
    ...Shadows.sm,
  },
  addFriendText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
    gap: 10,
    justifyContent: "space-between",
  },
  overviewItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Shadows.sm,
  },
  overviewIcon: {
    fontSize: 24,
  },
  overviewText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  overviewLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  horizontalScroll: {
    gap: 16,
    marginBottom: 30,
    paddingRight: 20,
  },
  shopContainer: {
    marginBottom: 30,
  },
  shopItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Shadows.sm,
  },
  shopItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  shopItemIcon: {
    fontSize: 28,
  },
  shopItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  shopItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: "90%",
  },
  dashedCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.locked,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Shadows.sm,
  },
  badgeEmoji: {
    fontSize: 40,
  },
  achievementContainer: {
    alignItems: "center",
    position: "relative",
    width: 90,
  },
  levelBadge: {
    position: "absolute",
    top: -5,
    right: 5,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  levelBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  achievementNumber: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: "900",
    position: "absolute",
    bottom: -8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
