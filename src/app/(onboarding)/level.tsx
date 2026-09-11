/**
 * Level Selection Screen - "What is your level?"
 */

import React, { useRef } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LevelSelector } from "@/components/onboarding/level-selector";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useOptionalAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function LevelScreen() {
  const router = useRouter();
  const { state, setLevel, reset } = useOnboarding();
  // Optional: cho phép render trong test không có AuthProvider bọc quanh,
  // giống pattern đã dùng ở tutorial-context.tsx.
  const auth = useOptionalAuth();
  const { colors } = useTheme();
  // Chặn bấm 2 lần liên tiếp mở 2 phiên bài kiểm tra đầu vào song song.
  const continuedRef = useRef(false);

  const handleContinue = () => {
    if (continuedRef.current) return;
    continuedRef.current = true;

    if (state.selectedLevel === "starter") {
      // "Tôi chưa biết gì" — không cần làm bài kiểm tra đầu vào, onboarding
      // coi như đã xong ngay tại đây.
      auth?.completeOnboarding();
      reset();
      router.replace("/(tabs)");
    } else {
      router.push("/(onboarding)/placement");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ProgressBar progress={0.8} />

      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Trình độ của bạn là gì?
        </Text>
        <LevelSelector
          selectedLevel={state.selectedLevel}
          onSelect={setLevel}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
        <GradientButton
          testID="level-continue-btn"
          title={
            state.selectedLevel === "starter"
              ? "BẮT ĐẦU HỌC"
              : "LÀM BÀI KIỂM TRA ĐẦU VÀO"
          }
          onPress={handleContinue}
          disabled={!state.selectedLevel}
          style={styles.button}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.six,
    gap: Spacing.six,
  },
  content: {
    flex: 1,
    gap: Spacing.seven,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
  },
  button: {
    marginBottom: Spacing.four,
  },
});
