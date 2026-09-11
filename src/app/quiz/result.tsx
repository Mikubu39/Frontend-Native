/**
 * Quiz Result Screen — Impeccable redesign.
 * Theme-aware cinematic result reveal.
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  QuizResultCard,
  RESULT_IMPACT_MS,
} from "@/components/quiz/quiz-result-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { PromotionModal } from "@/components/gamification";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import {
  MotionDuration,
  MotionEasing,
  MotionStagger,
} from "@/constants/motion";
import { Colors, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** The last two beats of the result timeline, picking up where the card ends. */
function buttonEntrance(index: number) {
  return FadeInDown.delay(RESULT_IMPACT_MS + MotionStagger * (5 + index))
    .duration(MotionDuration.press)
    .easing(MotionEasing.paper);
}

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fetchGamificationData, newlyUnlockedAchievements } =
    useGamification();
  const { isDark } = useTheme();
  const { playLessonComplete, playIncorrect } = useSoundEffect();
  const [showPromotionModal, setShowPromotionModal] = React.useState(false);

  const correctCount = parseInt((params.correctCount as string) || "0", 10);
  const wrongCount = parseInt((params.wrongCount as string) || "0", 10);
  const expEarned = parseInt((params.expEarned as string) || "0", 10);
  const starsEarned = parseInt((params.starsEarned as string) || "0", 10);
  const coinsEarned = parseInt((params.coinsEarned as string) || "0", 10);
  const energyRewarded = parseInt((params.energyRewarded as string) || "0", 10);
  const status = params.status as string;
  const lessonType = (params.lessonType as string) || "NORMAL";
  const remainingCount = parseInt((params.remainingCount as string) || "0", 10);

  const isFailed = status === "IN_PROGRESS";
  const isTimedReview = lessonType === "TIMED_REVIEW";
  const stars = isTimedReview ? Math.max(0, starsEarned) : 0;

  // Ôn từ vựng / ôn lỗi sai bị cap theo phiên (20 từ, 10 lỗi) — còn dư thì mời
  // ôn tiếp ngay tại đây thay vì bắt người dùng tự quay lại tab Review rồi
  // bấm lại từ đầu để dọn nốt backlog.
  const isReviewSession =
    lessonType === "REVIEW_VOCAB" || lessonType === "REVIEW_MISTAKES";
  const hasMoreToReview = isReviewSession && remainingCount > 0;

  useEffect(() => {
    fetchGamificationData();

    if (params.isPromoted === "true" && params.newRankName) {
      setShowPromotionModal(true);
    }

    if (isFailed) {
      playIncorrect();
      return;
    }

    // Fire the fanfare when the seal lands, not on mount. Playing it at t=0
    // left ~400ms of silent animation followed by a sound with nothing on
    // screen to match it, which is most of why the payoff felt flat.
    const t = setTimeout(playLessonComplete, RESULT_IMPACT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueReview = () => {
    router.replace(
      lessonType === "REVIEW_VOCAB" ? "/review/vocabulary" : "/review/mistakes",
    );
  };

  const handleContinue = async () => {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const lastShown = await AsyncStorage.getItem("lastStreakExtendedDate");

      const hasNewAchievements =
        newlyUnlockedAchievements && newlyUnlockedAchievements.length > 0;
      const shouldShowStreak = lastShown !== today && expEarned > 0;

      if (hasNewAchievements) {
        if (shouldShowStreak) {
          await AsyncStorage.setItem("pendingStreakExtended", "true");
        }
        router.push("/profile/achievement-unlocked");
      } else if (shouldShowStreak) {
        await AsyncStorage.setItem("lastStreakExtendedDate", today);
        router.push("/lesson/streak-extended");
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      router.replace("/(tabs)");
    }
  };

  const rewardLabel =
    lessonType === "REVIEW_MISTAKES"
      ? energyRewarded > 0
        ? `+${energyRewarded} ⚡ Năng lượng`
        : "Đã hoàn thành ôn lỗi"
      : lessonType === "REVIEW_VOCAB"
        ? `Đã ôn tập ${correctCount} từ vựng`
        : `+${expEarned} EXP${coinsEarned > 0 ? `, +${coinsEarned} Coin` : ""}`;

  const realResult = {
    totalQuestions: correctCount + wrongCount || 1,
    correctCount,
    wrongCount,
    correctCategories: [
      {
        name: rewardLabel,
        stars: stars,
      },
    ],
    wrongCategories: [],
  };

  // Cinematic gradient — dark mode: indigo-night sweep; light mode: washi wash
  const gradientColors: [string, string, string] = isDark
    ? isFailed
      ? ["#1A0A0A", "#3B0F0F", "#1A0A0A"]
      : ["#15161F", "#1B1D2B", "#15161F"]
    : isFailed
      ? ["#FFF1F2", "#FFE4E6", "#FFF1F2"]
      : ["#F7EFDE", "#EFE2C4", "#F7EFDE"];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Reveal like a celebration, not a lateral page push */}
      <Stack.Screen
        options={{ animation: "fade_from_bottom", animationDuration: 350 }}
      />

      {/* Subtle ambient orbs */}
      <View
        style={[
          styles.orb1,
          {
            backgroundColor: isFailed ? Colors.error : Colors.primary,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.orb2,
          {
            backgroundColor: isFailed ? "#FF6B6B" : Colors.secondary,
          },
        ]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <QuizResultCard result={realResult} isFailed={isFailed} />
        </View>

        <View style={styles.buttons}>
          {hasMoreToReview ? (
            <>
              <Animated.View entering={buttonEntrance(0)}>
                <GradientButton
                  title={`Ôn Tiếp (${remainingCount})`}
                  onPress={handleContinueReview}
                />
              </Animated.View>
              <Animated.View entering={buttonEntrance(1)}>
                <GradientButton
                  title="Về Trang Chủ"
                  variant="outline"
                  onPress={handleContinue}
                />
              </Animated.View>
            </>
          ) : (
            <>
              <Animated.View entering={buttonEntrance(0)}>
                <GradientButton title="Tiếp Tục" onPress={handleContinue} />
              </Animated.View>
              <Animated.View entering={buttonEntrance(1)}>
                <GradientButton
                  title="Thử Lại"
                  variant="outline"
                  onPress={() => router.back()}
                />
              </Animated.View>
            </>
          )}
        </View>
      </SafeAreaView>

      <PromotionModal
        visible={showPromotionModal}
        newRankName={(params.newRankName as string) || ""}
        onClose={() => setShowPromotionModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  orb1: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.1,
  },
  orb2: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    opacity: 0.08,
  },
  container: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: "center",
    gap: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  buttons: {
    gap: Spacing.three,
  },
});
