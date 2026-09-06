/**
 * Interest Selection Screen - "What are your interests?"
 */

import React from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { InterestGrid } from "@/components/onboarding/interest-grid";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useTheme } from "@/contexts/theme-context";
import { FontSizes, FontWeights, Spacing } from "@/constants/theme";

export default function InterestsScreen() {
  const router = useRouter();
  const { state, toggleInterest } = useOnboarding();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ProgressBar progress={0.66} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={styles.animatedContent}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Sở thích của bạn là gì?
          </Text>
          <InterestGrid
            selectedInterests={state.selectedInterests}
            onToggle={toggleInterest}
          />
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
        <GradientButton
          title="TIẾP TỤC"
          onPress={() => router.push("/(onboarding)/level")}
          disabled={state.selectedInterests.length === 0}
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
    gap: Spacing.five,
  },
  scroll: {
    paddingBottom: Spacing.four,
  },
  animatedContent: {
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
