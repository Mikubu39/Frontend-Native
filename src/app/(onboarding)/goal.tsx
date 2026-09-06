/**
 * Goal Selection Screen - "What is your goal?"
 */

import React from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalSelector } from "@/components/onboarding/goal-selector";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useTheme } from "@/contexts/theme-context";
import { FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function GoalScreen() {
  const router = useRouter();
  const { state, setGoal } = useOnboarding();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ProgressBar progress={0.33} />

      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Mục tiêu của bạn là gì?
        </Text>
        <GoalSelector selectedGoal={state.selectedGoal} onSelect={setGoal} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
        <GradientButton
          title="TIẾP TỤC"
          onPress={() => router.push("/(onboarding)/interests")}
          disabled={!state.selectedGoal}
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
