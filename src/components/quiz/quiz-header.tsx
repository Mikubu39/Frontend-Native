/**
 * QuizHeader — Theme-aware floating bar with segmented progress + hearts.
 */

import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface QuizHeaderProps {
  progress: number; // 0 to 1
  onClose: () => void;
  lessonType?: string;
  heartsRemaining?: number;
  /** Giây đã trôi qua (đã cộng phạt) — chỉ hiển thị khi lessonType === "TIMED_REVIEW". */
  elapsedSeconds?: number;
  /** Tăng lên mỗi lần bị phạt giờ, dùng để kích hoạt hiệu ứng nhấp nháy trên đồng hồ. */
  penaltyTick?: number;
  /** Số câu trả lời đúng liên tiếp trong bài học (combo streak). */
  comboCount?: number;
}

function HeartIcon({
  filled,
  index,
  total,
}: {
  filled: boolean;
  index: number;
  total: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!filled) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 6 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [filled, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons
        name={filled ? "heart" : "heart-outline"}
        size={19}
        color={filled ? Colors.secondary : `${Colors.secondary}44`}
      />
    </Animated.View>
  );
}

function TimerChip({
  seconds,
  penaltyTick,
  isDark,
}: {
  seconds: number;
  penaltyTick: number;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (penaltyTick > 0) {
      scale.value = withSequence(
        withSpring(1.25, { damping: 6 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [penaltyTick, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Animated.View
      style={[
        styles.timerChip,
        animStyle,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <Ionicons
        name="stopwatch-outline"
        size={15}
        color={penaltyTick > 0 ? Colors.secondary : Colors.accent}
      />
      <Animated.Text
        style={[
          styles.timerText,
          { color: isDark ? "rgba(255,255,255,0.85)" : Colors.textPrimary },
        ]}
      >
        {mm}:{ss}
      </Animated.Text>
    </Animated.View>
  );
}

function ComboChip({ count, isDark }: { count: number; isDark: boolean }) {
  const scale = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.35, { damping: 6 }),
      withSpring(1, { damping: 10 }),
    );
  }, [count, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.comboChip,
        animStyle,
        {
          backgroundColor: isDark
            ? `${Colors.streakActive}26`
            : `${Colors.streakActive}1f`,
          borderColor: isDark
            ? `${Colors.streakActive}73`
            : `${Colors.streakActive}59`,
        },
      ]}
    >
      <Ionicons name="flame" size={14} color={Colors.streakActive} />
      <Animated.Text style={styles.comboText}>{count}</Animated.Text>
    </Animated.View>
  );
}

function SegmentedProgressBar({
  progress,
  isDark,
}: {
  progress: number;
  isDark: boolean;
}) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%` as any,
  }));

  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.08)",
        },
      ]}
    >
      <Animated.View style={[styles.progressFill, fillStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Sheen highlight */}
        <View style={styles.progressSheen} />
      </Animated.View>
    </View>
  );
}

export function QuizHeader({
  progress,
  onClose,
  lessonType,
  heartsRemaining,
  elapsedSeconds,
  penaltyTick,
  comboCount,
}: QuizHeaderProps) {
  const { isDark } = useTheme();
  const showHearts =
    lessonType === "JUMP_TEST" && heartsRemaining !== undefined;
  const showTimer =
    lessonType === "TIMED_REVIEW" && elapsedSeconds !== undefined;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(10,10,20,0.0)"
            : "rgba(255,255,255,0.0)",
        },
      ]}
    >
      <View style={styles.topRow}>
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.closeBtn,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Đóng bài học"
          accessibilityRole="button"
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "rgba(255,255,255,0.7)" : Colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Segmented progress bar */}
        <View style={styles.progressWrapper}>
          <SegmentedProgressBar progress={progress} isDark={isDark} />
        </View>

        {/* Hearts (JUMP_TEST) / Timer (TIMED_REVIEW) / Combo Streak */}
        {showHearts ? (
          <View style={styles.heartsContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon
                key={i}
                filled={i < (heartsRemaining ?? 0)}
                index={i}
                total={3}
              />
            ))}
          </View>
        ) : showTimer ? (
          <TimerChip
            seconds={elapsedSeconds ?? 0}
            penaltyTick={penaltyTick ?? 0}
            isDark={isDark}
          />
        ) : comboCount && comboCount >= 3 ? (
          <ComboChip count={comboCount} isDark={isDark} />
        ) : (
          <View style={styles.closeBtnPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  progressWrapper: {
    flex: 1,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
  },
  progressSheen: {
    position: "absolute",
    top: 1,
    left: 4,
    right: 4,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 999,
  },
  heartsContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  timerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  comboChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  comboText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
    color: Colors.streakActive,
    fontVariant: ["tabular-nums"],
  },
});
