/**
 * QuizHeader — Theme-aware floating bar with segmented progress + hearts.
 */

import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface QuizHeaderProps {
  progress: number; // 0 to 1
  onClose: () => void;
  lessonType?: string;
  heartsRemaining?: number;
}

function HeartIcon({ filled, index, total }: { filled: boolean; index: number; total: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!filled) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 6 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [filled]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <FontAwesome5
        name="heart"
        size={18}
        color={filled ? "#FF4B6E" : "rgba(255,75,110,0.22)"}
        solid={filled}
      />
    </Animated.View>
  );
}

function SegmentedProgressBar({ progress, isDark }: { progress: number; isDark: boolean }) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

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
}: QuizHeaderProps) {
  const { colors, isDark } = useTheme();
  const showHearts =
    lessonType === "JUMP_TEST" && heartsRemaining !== undefined;

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

        {/* Hearts (JUMP_TEST only) */}
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
});
