/**
 * PracticeResultCard - Màn hình chúc mừng sau khi nộp bài luyện tập.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { GradientButton } from "@/components/ui/gradient-button";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import {
  AlphabetPracticeSubmitResponse,
  isPracticePromoted,
} from "@/types/alphabet";

interface PracticeResultCardProps {
  result: AlphabetPracticeSubmitResponse;
  onFinish: () => void;
  onPracticeAgain: () => void;
}

export function PracticeResultCard({
  result,
  onFinish,
  onPracticeAgain,
}: PracticeResultCardProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(320)} style={styles.container}>
      <Animated.View entering={ZoomIn.delay(120)} style={styles.badge}>
        <Ionicons name="trophy" size={56} color="#FFFFFF" />
      </Animated.View>

      <Text style={[styles.title, { color: colors.text }]}>
        Hoàn thành bài luyện tập!
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {result.message}
      </Text>

      <View
        style={[
          styles.expBox,
          { backgroundColor: colors.card, borderColor: Colors.accent },
        ]}
      >
        <Ionicons name="flash" size={22} color={Colors.accent} />
        <Text style={styles.expValue}>+{result.expEarned} EXP</Text>
      </View>

      {isPracticePromoted(result) && result.newRankName && (
        <Animated.View entering={FadeInUp.delay(200)} style={styles.rankBox}>
          <Ionicons name="ribbon" size={20} color={Colors.secondary} />
          <Text style={styles.rankText}>Thăng hạng: {result.newRankName}!</Text>
        </Animated.View>
      )}

      <View style={styles.actions}>
        <GradientButton title="Luyện tiếp" onPress={onPracticeAgain} />
        <GradientButton
          title="Về bảng chữ cái"
          variant="outline"
          onPress={onFinish}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.glow(Colors.primary),
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  message: {
    fontSize: FontSizes.md,
    textAlign: "center",
  },
  expBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  expValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.accent,
  },
  rankBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "rgba(233, 30, 142, 0.12)",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.secondary,
  },
  actions: {
    width: "100%",
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
});
