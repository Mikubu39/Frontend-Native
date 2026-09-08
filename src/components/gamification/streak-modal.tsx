/**
 * StreakModal — Modal hiển thị chi tiết chuỗi ngày học chuẩn Duolingo.
 * Bật lên khi người dùng chạm vào viên StatPill ngọn lửa 🔥 trên Header.
 */

import React, { useEffect, useMemo } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
  ZoomIn,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Fonts,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { useTheme } from "@/contexts/theme-context";
import { useGamification } from "@/contexts/gamification-context";
import { formatStreakDate } from "@/utils";

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
}

const WEEK_DAYS = [
  { day: 1, label: "T2" },
  { day: 2, label: "T3" },
  { day: 3, label: "T4" },
  { day: 4, label: "T5" },
  { day: 5, label: "T6" },
  { day: 6, label: "T7" },
  { day: 0, label: "CN" },
];

export function StreakModal({ visible, onClose }: StreakModalProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    streak,
    streakStatus,
    studiedToday,
    frozenToday,
    streakFreezeCount,
    studyDates = [],
  } = useGamification();

  const reduceMotion = useReducedMotion();
  const flameScale = useSharedValue(0.7);
  const flameRotation = useSharedValue(0);

  const statusConfig = useMemo(() => {
    switch (streakStatus) {
      case "ACTIVE":
        return {
          gradient: [Colors.streakActive, "#FF4500"] as [string, string],
          icon: "fire" as const,
          shadowColor: Colors.streakActive,
          streakNumberColor: Colors.streakActive,
          badgeText: "ĐÃ GIỮ LỬA HÔM NAY",
          badgeBg: `${Colors.streakActive}26`,
          badgeColor: Colors.streakActive,
          description:
            "Bạn đã thắp sáng ngọn lửa thành công hôm nay! Hãy tiếp tục duy trì ngày mai nhé.",
        };
      case "FROZEN":
        return {
          gradient: [Colors.streakFrozen, Colors.primaryLight] as [string, string],
          icon: "snowflake" as const,
          shadowColor: Colors.streakFrozen,
          streakNumberColor: Colors.streakFrozen,
          badgeText: "ĐANG ĐÓNG BĂNG",
          badgeBg: `${Colors.streakFrozen}26`,
          badgeColor: Colors.streakFrozen,
          description:
            "Chuỗi ngày học đang được bảo vệ an toàn bằng khiên băng Streak Freeze. Hãy học hôm nay để ngọn lửa bùng cháy trở lại!",
        };
      case "UNLIT":
      default:
        return {
          gradient: isDark
            ? (["#4B5563", "#374151"] as [string, string])
            : (["#9CA3AF", "#6B7280"] as [string, string]),
          icon: "fire" as const,
          shadowColor: isDark ? "#4B5563" : "#9CA3AF",
          streakNumberColor: isDark ? "#D1D5DB" : "#6B7280",
          badgeText: "CHƯA HỌC HÔM NAY",
          badgeBg: isDark
            ? "rgba(156, 163, 175, 0.15)"
            : "rgba(107, 114, 128, 0.12)",
          badgeColor: isDark ? "#9CA3AF" : "#6B7280",
          description:
            "Hôm nay bạn chưa học bài. Hãy hoàn thành 1 bài học ngay để thắp sáng và giữ vững chuỗi ngày học nhé!",
        };
    }
  }, [streakStatus, isDark]);

  useEffect(() => {
    if (visible) {
      flameScale.value = reduceMotion ? 1 : withSpring(1, { damping: 10, stiffness: 100 });
      if (reduceMotion) {
        flameRotation.value = 0;
      } else {
        flameRotation.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 180, easing: Easing.linear }),
            withTiming(4, { duration: 180, easing: Easing.linear }),
            withTiming(0, { duration: 180, easing: Easing.linear }),
          ),
          -1,
          true,
        );
      }
    } else {
      cancelAnimation(flameRotation);
      cancelAnimation(flameScale);
      flameScale.value = 0.7;
      flameRotation.value = 0;
    }
    return () => {
      cancelAnimation(flameRotation);
      cancelAnimation(flameScale);
    };
  }, [visible, flameScale, flameRotation, reduceMotion]);

  const flameAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` },
    ],
  }));

  const weekCells = useMemo(() => {
    const studiedSet = new Set(studyDates);
    const now = new Date();
    const todayIso = formatStreakDate(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    return WEEK_DAYS.map((d, index) => {
      const cellDate = new Date(monday);
      cellDate.setDate(monday.getDate() + index);
      const iso = formatStreakDate(cellDate);
      const isToday = iso === todayIso;
      const isPast = iso < todayIso;
      const isFuture = iso > todayIso;
      const hasCompleted = studiedSet.has(iso) || (isToday && studiedToday);
      const isFrozenDay = isToday && frozenToday;

      return {
        ...d,
        iso,
        isToday,
        isPast,
        isFuture,
        hasCompleted,
        isFrozenDay,
      };
    });
  }, [studyDates, studiedToday, frozenToday]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={ZoomIn.duration(280).springify()}
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? "#1B1D2B" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.border,
            },
          ]}
        >
          {/* Flame Mascot Icon */}
          <View style={styles.flameWrap}>
            <Animated.View
              style={[
                styles.flameCircle,
                { shadowColor: statusConfig.shadowColor },
                flameAnimStyle,
              ]}
            >
              <LinearGradient
                colors={statusConfig.gradient}
                style={styles.flameGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5
                  name={statusConfig.icon}
                  size={36}
                  color="#FFFFFF"
                  solid
                />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.badgeBg },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusConfig.badgeColor },
              ]}
            >
              {statusConfig.badgeText}
            </Text>
          </View>

          {/* Streak count */}
          <Text
            style={[
              styles.streakNumber,
              { color: statusConfig.streakNumberColor },
            ]}
          >
            {streak}
          </Text>
          <Text
            style={[
              styles.streakSubtitle,
              { color: isDark ? "#FFFFFF" : Colors.textPrimary },
            ]}
          >
            NGÀY HỌC LIÊN TIẾP
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: isDark ? "rgba(255,255,255,0.7)" : colors.textSecondary,
              },
            ]}
          >
            {statusConfig.description}
          </Text>

          {/* 7-Day Week Calendar */}
          <View
            style={[
              styles.calendarCard,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.calendarTitle,
                { color: isDark ? "#9CA3AF" : Colors.textSecondary },
              ]}
            >
              TUẦN NÀY
            </Text>

            <View style={styles.daysRow}>
              {weekCells.map((cell) => {
                let dotBg = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
                let dotBorder = "transparent";

                if (cell.hasCompleted) {
                  dotBg = Colors.streakActive;
                } else if (cell.isFrozenDay) {
                  dotBg = Colors.streakFrozen;
                }

                if (cell.isToday) {
                  dotBorder = cell.hasCompleted
                    ? Colors.streakActive
                    : cell.isFrozenDay
                      ? Colors.streakFrozen
                      : isDark
                        ? "#6B7280"
                        : "#9CA3AF";
                }

                return (
                  <View key={cell.label} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayLabel,
                        cell.isToday && styles.dayLabelToday,
                        {
                          color: cell.isToday
                            ? cell.hasCompleted
                              ? Colors.streakActive
                              : cell.isFrozenDay
                                ? Colors.streakFrozen
                                : isDark
                                  ? "#9CA3AF"
                                  : "#6B7280"
                            : isDark
                              ? "#9CA3AF"
                              : Colors.textSecondary,
                        },
                      ]}
                    >
                      {cell.label}
                    </Text>

                    <View
                      style={[
                        styles.dayDot,
                        {
                          backgroundColor: dotBg,
                          borderColor: dotBorder,
                          borderWidth: cell.isToday ? 2 : 0,
                        },
                      ]}
                    >
                      {cell.hasCompleted ? (
                        <FontAwesome5
                          name="check"
                          size={11}
                          color="#FFFFFF"
                          solid
                        />
                      ) : cell.isFrozenDay ? (
                        <FontAwesome5
                          name="snowflake"
                          size={11}
                          color="#FFFFFF"
                          solid
                        />
                      ) : (
                        <View
                          style={[
                            styles.emptyDot,
                            {
                              backgroundColor: isDark
                                ? "rgba(255,255,255,0.2)"
                                : "#D1D5DB",
                            },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Streak Freeze Card */}
          <View
            style={[
              styles.freezeCard,
              {
                backgroundColor: isDark
                  ? "rgba(56, 189, 248, 0.08)"
                  : "rgba(56, 189, 248, 0.06)",
                borderColor: isDark
                  ? "rgba(56, 189, 248, 0.25)"
                  : "rgba(56, 189, 248, 0.2)",
              },
            ]}
          >
            <View style={styles.freezeIconWrap}>
              <FontAwesome5 name="snowflake" size={16} color="#0284C7" solid />
            </View>
            <View style={styles.freezeTextGroup}>
              <Text
                style={[
                  styles.freezeTitle,
                  { color: isDark ? "#E0F2FE" : "#0284C7" },
                ]}
              >
                Băng tuyết giữ chuỗi
              </Text>
              <Text
                style={[
                  styles.freezeDesc,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.65)"
                      : colors.textSecondary,
                  },
                ]}
              >
                {streakFreezeCount > 0
                  ? `Đang trang bị ${streakFreezeCount} lượt bảo vệ chuỗi.`
                  : "Chưa trang bị. Nghỉ 1 ngày sẽ mất chuỗi!"}
              </Text>
            </View>

            {streakFreezeCount === 0 && (
              <Pressable
                style={styles.shopButton}
                onPress={() => {
                  onClose();
                  router.push("/(tabs)/shop");
                }}
              >
                <Text style={styles.shopButtonText}>MUA</Text>
              </Pressable>
            )}
          </View>

          {/* CTA */}
          <GradientButton
            title="TIẾP TỤC HỌC →"
            onPress={onClose}
            style={{ width: "100%", marginTop: Spacing.four }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: Spacing.five,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    alignItems: "center",
  },
  flameWrap: {
    marginBottom: Spacing.two,
  },
  flameCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    shadowColor: Colors.streakActive,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  flameGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
  },
  streakNumber: {
    fontSize: 48,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: Colors.streakActive,
    lineHeight: 56,
  },
  streakSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  calendarCard: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  calendarTitle: {
    fontSize: 10,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
  },
  dayLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
  },
  dayLabelToday: {
    fontWeight: FontWeights.extrabold,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  freezeCard: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  freezeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  freezeTextGroup: {
    flex: 1,
    gap: 2,
  },
  freezeTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  freezeDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  shopButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: "#38BDF8",
    borderRadius: BorderRadius.sm,
  },
  shopButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
  },
});
