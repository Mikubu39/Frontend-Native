/**
 * Quiz Result Screen — Impeccable redesign.
 * Theme-aware cinematic result reveal.
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { QuizResultCard } from "@/components/quiz/quiz-result-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { Colors, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setEnergy, addExp, fetchGamificationData } = useGamification();
  const { isDark } = useTheme();

  const correctCount = parseInt((params.correctCount as string) || "0", 10);
  const wrongCount = parseInt((params.wrongCount as string) || "0", 10);
  const expEarned = parseInt((params.expEarned as string) || "0", 10);
  const starsEarned = parseInt((params.starsEarned as string) || "0", 10);
  const coinsEarned = parseInt((params.coinsEarned as string) || "0", 10);
  const status = params.status as string;
  const currentEnergyStr = params.currentEnergy as string;

  const isFailed = status === "IN_PROGRESS";

  useEffect(() => {
    if (currentEnergyStr) {
      setEnergy(parseInt(currentEnergyStr, 10));
    }
    if (expEarned > 0) {
      addExp(expEarned);
    }
    fetchGamificationData();

    if (params.isPromoted === "true" && params.newRankName) {
      setTimeout(() => {
        Alert.alert(
          "🎉 THĂNG HẠNG! 🎉",
          `Chúc mừng bạn đã xuất sắc thăng hạng lên ${params.newRankName}!`,
        );
      }, 500);
    }
  }, []);

  const handleContinue = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastShown = await AsyncStorage.getItem("lastStreakExtendedDate");

      if (lastShown !== today && expEarned > 0) {
        await AsyncStorage.setItem("lastStreakExtendedDate", today);
        router.push("/lesson/streak-extended");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      router.replace("/(tabs)");
    }
  };

  const realResult = {
    totalQuestions: correctCount + wrongCount || 1,
    correctCount,
    wrongCount,
    correctCategories: [
      {
        name: `+${expEarned} EXP${coinsEarned > 0 ? `, +${coinsEarned} Coin` : ""}`,
        stars: starsEarned || (expEarned > 0 ? 3 : 0),
      },
    ],
    wrongCategories: [],
  };

  // Cinematic gradient — dark mode: deep violet sweep; light mode: soft lavender
  const gradientColors: [string, string, string] = isDark
    ? isFailed
      ? ["#1A0A0A", "#3B0F0F", "#1A0A0A"]
      : ["#0A0A14", "#1B0A2E", "#0A0A14"]
    : isFailed
    ? ["#FFF1F2", "#FFE4E6", "#FFF1F2"]
    : ["#F5F3FF", "#EDE9FE", "#F5F3FF"];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Subtle ambient orbs */}
      <View
        style={[
          styles.orb1,
          {
            backgroundColor: isFailed
              ? Colors.error
              : Colors.primary,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.orb2,
          {
            backgroundColor: isFailed
              ? "#FF6B6B"
              : Colors.secondary,
          },
        ]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <QuizResultCard result={realResult} isFailed={isFailed} />
        </View>

        <View style={styles.buttons}>
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <GradientButton title="Tiếp Tục" onPress={handleContinue} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <GradientButton
              title="Thử Lại"
              variant="outline"
              onPress={() => router.back()}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
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
