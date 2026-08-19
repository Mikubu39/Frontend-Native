import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import { useTheme } from "@/contexts/theme-context";
import { StatusBar } from "expo-status-bar";

export default function QuestsTabScreen() {
  const { quests, chestStatus, openChest } = useGamification();
  const { colors, isDark } = useTheme();
  const [openingChest, setOpeningChest] = useState(false);
  const [chestError, setChestError] = useState<string | null>(null);

  const handleOpenChest = async () => {
    setOpeningChest(true);
    setChestError(null);
    try {
      await openChest();
    } catch (e: any) {
      setChestError(e?.response?.data?.message || "Không thể mở rương");
    } finally {
      setOpeningChest(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NHIỆM VỤ BẠN BÈ (Dummy Section matching design) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NHIỆM VỤ BẠN BÈ
          </Text>
          <Text style={[styles.sectionTime, { color: colors.textSecondary }]}>
            🕒 10 GIỜ
          </Text>
        </View>

        <View
          style={[
            styles.friendsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.friendsBanner,
              { backgroundColor: isDark ? "#1C2E24" : "#E8F5E9" },
            ]}
          >
            <Text style={{ fontSize: 60 }}>😎 🤓</Text>
          </View>

          <Text style={[styles.friendsTaskTitle, { color: colors.text }]}>
            Hoàn thành 15 bài học
          </Text>

          <View style={styles.friendsProgressRow}>
            <View
              style={[
                styles.progressContainer,
                { backgroundColor: isDark ? "#2A2A3E" : Colors.creamDark },
              ]}
            >
              <View style={[styles.progressBar, { width: "66%" }]} />
              <Text style={styles.progressTextCenter}>10 / 15</Text>
            </View>
          </View>

          <View style={styles.friendsList}>
            <View style={styles.friendItem}>
              <View style={[styles.dot, { backgroundColor: "#FFB800" }]} />
              <Text style={[styles.friendName, { color: colors.text }]}>
                Bạn
              </Text>
              <Text
                style={[styles.friendScore, { color: colors.textSecondary }]}
              >
                7
              </Text>
            </View>
            <View style={styles.friendItem}>
              <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
              <Text style={[styles.friendName, { color: colors.text }]}>
                Lê Lan
              </Text>
              <Text
                style={[styles.friendScore, { color: colors.textSecondary }]}
              >
                3
              </Text>
            </View>
          </View>

          <View style={styles.friendsActions}>
            <AnimatedPressable
              style={[
                styles.outlineButton,
                { borderColor: isDark ? colors.border : Colors.creamDark },
              ]}
              pressScale={0.97}
            >
              <Text style={styles.outlineButtonText}>CHIA SẺ</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[
                styles.outlineButton,
                { borderColor: isDark ? colors.border : Colors.creamDark },
              ]}
              pressScale={0.97}
            >
              <Text style={styles.outlineButtonText}>NHẮC NHỞ</Text>
            </AnimatedPressable>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? colors.border : Colors.creamDark },
          ]}
        />

        {/* NHIỆM VỤ HÀNG NGÀY */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NHIỆM VỤ HÀNG NGÀY
          </Text>
        </View>

        <View style={styles.dailyQuestsContainer}>
          {quests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Không có nhiệm vụ hôm nay
            </Text>
          ) : (
            quests.map((q: any) => {
              const pct =
                q.targetValue > 0
                  ? Math.min(
                      100,
                      Math.round((q.currentProgress / q.targetValue) * 100),
                    )
                  : 0;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.dailyQuestRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.dailyQuestInfo}>
                    <Text
                      style={[styles.dailyQuestTitle, { color: colors.text }]}
                    >
                      {q.title}
                    </Text>
                    <View
                      style={[
                        styles.dailyProgressContainer,
                        {
                          backgroundColor: isDark
                            ? "#2A2A3E"
                            : Colors.creamDark,
                        },
                      ]}
                    >
                      <View
                        style={[styles.dailyProgressBar, { width: `${pct}%` }]}
                      />
                      <Text style={styles.dailyProgressText}>
                        {q.currentProgress} / {q.targetValue}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* THƯỞNG CUỐI CÙNG */}
        <View
          style={[
            styles.chestSection,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? Colors.accent : Colors.accent,
            },
          ]}
        >
          <Text style={styles.chestTitle}>Rương Tổng</Text>
          <Text
            style={[styles.chestStatusText, { color: colors.textSecondary }]}
          >
            {chestStatus?.alreadyOpenedToday
              ? "Đã mở hôm nay"
              : `${chestStatus?.questsCompleted || 0} / ${chestStatus?.questsRequired || 3} nhiệm vụ`}
          </Text>

          <Text style={{ fontSize: 60, marginVertical: Spacing.four }}>
            {chestStatus?.alreadyOpenedToday
              ? "📦"
              : chestStatus?.available
                ? "🎁"
                : "🔒"}
          </Text>

          {chestError && <Text style={styles.errorText}>{chestError}</Text>}

          <GradientButton
            title={openingChest ? "ĐANG MỞ..." : "MỞ RƯƠNG"}
            disabled={
              !chestStatus?.available ||
              chestStatus?.alreadyOpenedToday ||
              openingChest
            }
            onPress={handleOpenChest}
            style={{ width: "100%", maxWidth: 300, alignSelf: "center" }}
          />
        </View>
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
    padding: Spacing.four,
    paddingBottom: 120, // Increased to avoid tab bar overlap
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
    marginTop: Spacing.four,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontWeight: "bold",
    fontSize: FontSizes.sm,
    letterSpacing: 1,
  },
  sectionTime: {
    color: Colors.textSecondary,
    fontWeight: "bold",
    fontSize: FontSizes.sm,
  },
  friendsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    ...Shadows.sm,
  },
  friendsBanner: {
    backgroundColor: "#E8F5E9",
    height: 100,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  friendsTaskTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: "bold",
    marginBottom: Spacing.three,
  },
  friendsProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  progressContainer: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 8,
    marginRight: Spacing.three,
    justifyContent: "center",
    overflow: "hidden",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.success,
    borderRadius: 8,
  },
  progressTextCenter: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 1,
  },
  friendsList: {
    marginBottom: Spacing.four,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.two,
  },
  friendName: {
    color: Colors.textPrimary,
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: "bold",
  },
  friendScore: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: "bold",
  },
  friendsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: FontSizes.sm,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.six,
  },
  dailyQuestsContainer: {
    gap: Spacing.six,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  dailyQuestRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  dailyQuestInfo: {
    flex: 1,
    marginRight: Spacing.three,
  },
  dailyQuestTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: "bold",
    marginBottom: Spacing.two,
  },
  dailyProgressContainer: {
    height: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  },
  dailyProgressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  dailyProgressText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 1,
  },
  chestIcon: {
    fontSize: 40,
  },
  chestSection: {
    marginTop: Spacing.eight,
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.sm,
  },
  chestTitle: {
    color: Colors.accent,
    fontSize: FontSizes.lg,
    fontWeight: "bold",
    marginBottom: Spacing.one,
  },
  chestStatusText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.two,
    fontWeight: "bold",
  },
});
