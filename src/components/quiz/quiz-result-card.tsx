/**
 * QuizResultCard — Impeccable redesign.
 * Theme-aware result card with gradient score display.
 */

import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import type { QuizResult } from "@/types";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { BounceIn, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface QuizResultCardProps {
  result: QuizResult;
  isFailed?: boolean;
}

export function QuizResultCard({ result, isFailed }: QuizResultCardProps) {
  const { colors, isDark } = useTheme();
  const scorePercentage = result.correctCount / result.totalQuestions;
  const isPerfect = scorePercentage === 1;
  const isGood = scorePercentage >= 0.7;
  const isAverage = scorePercentage >= 0.4;

  const animationSource = isFailed
    ? require("../../../assets/animations/confuse_mascot.json")
    : isPerfect
      ? require("../../../assets/animations/winner_mascot.json")
      : isGood
        ? require("../../../assets/animations/happy_mascot.json")
        : isAverage
          ? require("../../../assets/animations/hi_mascot.json")
          : require("../../../assets/animations/confuse_mascot.json");

  const titleText = isFailed
    ? "Hết mạng!"
    : isPerfect
      ? "Hoàn hảo!"
      : isGood
        ? "Xuất sắc!"
        : isAverage
          ? "Cố lên nhé!"
          : "Thử thêm lần nữa!";

  const titleColor = isFailed
    ? Colors.error
    : isPerfect
      ? Colors.accent
      : isGood
        ? Colors.success
        : Colors.primary;

  const cardBg = isDark
    ? "rgba(255,255,255,0.06)"
    : Colors.light.card;
  const cardBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : Colors.light.border;

  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      {/* Lottie mascot */}
      <View style={styles.animationContainer}>
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Title */}
      <Animated.Text
        entering={BounceIn.delay(300)}
        style={[styles.title, { color: titleColor }]}
      >
        {titleText}
      </Animated.Text>

      {/* Score row */}
      <View
        style={[
          styles.scoreRow,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.04)"
              : Colors.light.backgroundElement,
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.scoreBlock}>
          <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
          <Text style={[styles.scoreValue, styles.correctValue]}>
            {result.correctCount}
          </Text>
          <Text style={[styles.scoreLabel, { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary }]}>
            Đúng
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : Colors.light.border },
          ]}
        />

        <View style={styles.scoreBlock}>
          <Ionicons name="close-circle" size={20} color="#F87171" />
          <Text style={[styles.scoreValue, styles.wrongValue]}>
            {result.wrongCount}
          </Text>
          <Text style={[styles.scoreLabel, { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary }]}>
            Sai
          </Text>
        </View>
      </View>

      {/* Category rewards */}
      <View style={styles.categoriesList}>
        {result.correctCategories.map((cat, index) => (
          <Animated.View
            key={cat.name}
            entering={FadeInUp.delay(500 + index * 100)}
            style={[
              styles.categoryRow,
              {
                backgroundColor: isDark
                  ? "rgba(255,215,0,0.07)"
                  : Colors.accent + "11",
                borderColor: isDark
                  ? "rgba(255,215,0,0.15)"
                  : Colors.accent + "33",
              },
            ]}
          >
            <Text
              style={[
                styles.categoryName,
                { color: isDark ? "rgba(255,255,255,0.85)" : Colors.textPrimary },
              ]}
            >
              {cat.name}
            </Text>
            <View style={styles.starsRow}>
              {Array.from({ length: cat.stars }).map((_, i) => (
                <Text key={i} style={styles.star}>
                  ⭐
                </Text>
              ))}
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Wrong categories */}
      {result.wrongCategories.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(800)}
          style={[
            styles.wrongSection,
            {
              borderTopColor: isDark
                ? "rgba(255,255,255,0.08)"
                : Colors.light.border,
            },
          ]}
        >
          <Text style={styles.wrongTitle}>Cần luyện thêm:</Text>
          {result.wrongCategories.map((cat) => (
            <Text
              key={cat}
              style={[
                styles.wrongCategory,
                { color: isDark ? "rgba(255,255,255,0.65)" : Colors.textPrimary },
              ]}
            >
              • {cat}
            </Text>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.five,
  },
  animationContainer: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -Spacing.four,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.four,
    gap: Spacing.seven,
  },
  scoreBlock: {
    alignItems: "center",
    gap: Spacing.one,
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  scoreValue: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
  },
  correctValue: {
    color: "#4ADE80",
  },
  wrongValue: {
    color: "#F87171",
  },
  divider: {
    width: 1,
    height: 50,
  },
  categoriesList: {
    gap: Spacing.two,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  star: {
    fontSize: 16,
  },
  wrongSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
  },
  wrongTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.error,
  },
  wrongCategory: {
    fontSize: FontSizes.md,
  },
});
