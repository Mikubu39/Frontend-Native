/**
 * QuizResultCard — Impeccable redesign.
 * Theme-aware result card with gradient score display.
 */

import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { HANKO_LANDING_MS, HankoStamp } from "@/components/ui/hanko-stamp";
import {
  MotionDuration,
  MotionEasing,
  MotionStagger,
} from "@/constants/motion";
import type { QuizResult } from "@/types";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

/**
 * The screen's timeline, in ms from mount.
 *
 * Every beat hangs off `impact` — the instant the seal meets the paper —
 * because that is the event this screen is about. Previously the title bounced
 * in at 300ms while the seal did not land until 640ms, so the payoff arrived
 * after the reaction to it and the whole screen read as unrelated pieces
 * animating on their own schedules.
 */
const SEAL_START = 180;
export const RESULT_IMPACT_MS = SEAL_START + HANKO_LANDING_MS;
const BEAT = {
  seal: SEAL_START,
  title: RESULT_IMPACT_MS,
  badge: RESULT_IMPACT_MS + MotionStagger,
  score: RESULT_IMPACT_MS + MotionStagger * 2,
  reward: RESULT_IMPACT_MS + MotionStagger * 3,
  wrong: RESULT_IMPACT_MS + MotionStagger * 4,
};

interface QuizResultCardProps {
  result: QuizResult;
  isFailed?: boolean;
}

export function QuizResultCard({ result, isFailed }: QuizResultCardProps) {
  const { isDark } = useTheme();
  const total = result.totalQuestions || 1;
  const correct = result.correctCount;
  const wrong = result.wrongCount;
  const scorePercentage = correct / total;

  // Tiers logic:
  // 1. Hoàn hảo: 100% đúng, 0 câu sai
  const isPerfect = scorePercentage === 1 && wrong === 0;
  // 2. Xuất sắc: Tỉ lệ >= 80% VÀ chỉ sai tối đa 1 câu (như 4/5 hoặc 9/10).
  // Làm sai từ 2 câu trở lên tuyệt đối không được xếp vào nhóm này.
  const isMastery = !isPerfect && scorePercentage >= 0.8 && wrong <= 1;
  // 3. Đạt chuẩn: Tỉ lệ >= 70% (như 5/7 hoặc 7/10)
  const isPassed = !isPerfect && !isMastery && scorePercentage >= 0.7;
  // 4. Cần cố gắng: Tỉ lệ 50% - 69% (như sai 2/5 câu, đạt 60%)
  const isNeedPractice =
    !isPerfect && !isMastery && !isPassed && scorePercentage >= 0.5;

  const titleText = isFailed
    ? "Hết mạng!"
    : isPerfect
      ? "Xuất sắc hoàn hảo!"
      : isMastery
        ? "Làm rất tốt!"
        : isPassed
          ? "Hoàn thành bài học!"
          : isNeedPractice
            ? "Cần luyện tập thêm!"
            : "Đừng nản lòng nhé!";

  const titleColor = isFailed
    ? Colors.error
    : isPerfect
      ? Colors.secondary
      : isMastery
        ? Colors.success
        : isPassed
          ? isDark
            ? "#F9FAFB"
            : Colors.textPrimary
          : isNeedPractice
            ? Colors.warning
            : Colors.error;

  const sealText = isPerfect
    ? "HOÀN HẢO • 大吉"
    : isMastery
      ? "XUẤT SẮC • 皆伝"
      : isPassed
        ? "ĐẠT CHUẨN • 合格"
        : isNeedPractice
          ? "CỐ GẮNG • 努力"
          : "THỬ LẠI • 再挑戦";

  const sealColor =
    isFailed || (!isPerfect && !isMastery && !isPassed && !isNeedPractice)
      ? Colors.error
      : isNeedPractice
        ? Colors.warning
        : isPassed
          ? Colors.primary
          : Colors.secondary;

  // Con số kết quả phải đọc được trên CẢ hai nền. Cặp màu sáng chỉ hợp nền
  // tối; trên giấy kem chúng tụt xuống 1.36:1 và 2.15:1.
  const correctTone = isDark ? "#4ADE80" : Colors.successInk;
  const wrongTone = isDark ? "#F87171" : Colors.errorInk;

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : Colors.light.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : Colors.light.border;

  return (
    <Animated.View
      entering={FadeInUp.duration(MotionDuration.press).easing(
        MotionEasing.paper,
      )}
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      {/* Central Hero: HankoStamp for completed lessons, Confused Mascot for failed attempts */}
      {isFailed ? (
        <View style={styles.animationContainer}>
          <LottieView
            source={require("../../../assets/animations/confuse_mascot.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      ) : (
        <View style={styles.stampHeroContainer}>
          <HankoStamp size={108} delay={BEAT.seal} color={sealColor} />
          <Animated.View
            entering={FadeInDown.delay(BEAT.badge)
              .duration(MotionDuration.press)
              .easing(MotionEasing.ink)}
            style={[
              styles.sealBadge,
              {
                backgroundColor: isDark ? `${sealColor}26` : `${sealColor}12`,
                borderColor: isDark ? `${sealColor}55` : `${sealColor}33`,
              },
            ]}
          >
            <Text style={[styles.sealBadgeText, { color: sealColor }]}>
              {sealText}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Title */}
      <Animated.Text
        entering={FadeInDown.delay(BEAT.title)
          .duration(MotionDuration.press)
          .easing(MotionEasing.ink)}
        style={[styles.title, { color: titleColor }]}
      >
        {titleText}
      </Animated.Text>

      {/* Score row */}
      <Animated.View
        entering={FadeInDown.delay(BEAT.score)
          .duration(MotionDuration.press)
          .easing(MotionEasing.ink)}
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
          <Ionicons name="checkmark-circle" size={20} color={correctTone} />
          <Text style={[styles.scoreValue, { color: correctTone }]}>
            {result.correctCount}
          </Text>
          <Text
            style={[
              styles.scoreLabel,
              {
                color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary,
              },
            ]}
          >
            Đúng
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : Colors.light.border,
            },
          ]}
        />

        <View style={styles.scoreBlock}>
          <Ionicons name="close-circle" size={20} color={wrongTone} />
          <Text style={[styles.scoreValue, { color: wrongTone }]}>
            {result.wrongCount}
          </Text>
          <Text
            style={[
              styles.scoreLabel,
              {
                color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary,
              },
            ]}
          >
            Sai
          </Text>
        </View>
      </Animated.View>

      {/* Category rewards */}
      <View style={styles.categoriesList}>
        {result.correctCategories.map((cat, index) => (
          <Animated.View
            key={cat.name}
            entering={FadeInDown.delay(BEAT.reward + index * MotionStagger)
              .duration(MotionDuration.press)
              .easing(MotionEasing.ink)}
            style={[
              styles.categoryRow,
              {
                backgroundColor: isDark
                  ? "rgba(196,146,46,0.12)"
                  : Colors.accent + "11",
                borderColor: isDark
                  ? "rgba(196,146,46,0.25)"
                  : Colors.accent + "33",
              },
            ]}
          >
            <Text
              style={[
                styles.categoryName,
                {
                  color: isDark ? "rgba(255,255,255,0.85)" : Colors.textPrimary,
                },
              ]}
            >
              {cat.name}
            </Text>
            {cat.stars > 0 && (
              <View style={styles.starsRow} testID="stars-row">
                {Array.from({ length: cat.stars }).map((_, i) => (
                  <Text key={i} style={styles.star}>
                    ⭐
                  </Text>
                ))}
              </View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Wrong categories */}
      {result.wrongCategories.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(BEAT.wrong)
            .duration(MotionDuration.press)
            .easing(MotionEasing.ink)}
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
                {
                  color: isDark ? "rgba(255,255,255,0.65)" : Colors.textPrimary,
                },
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
  stampHeroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  sealBadge: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
  sealBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    fontFamily: Fonts.rounded,
    letterSpacing: 1.2,
    color: Colors.secondary,
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
    fontFamily: Fonts.rounded,
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
    fontFamily: Fonts.rounded,
  },
  scoreValue: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    fontFamily: Fonts.rounded,
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
    fontFamily: Fonts.rounded,
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
    fontFamily: Fonts.rounded,
    color: Colors.error,
  },
  wrongCategory: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.rounded,
  },
});
