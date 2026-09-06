import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { Spacing } from "@/constants/theme";

const QUESTION_MASCOTS = [
  require("@/assets/animations/character1.json"),
  require("@/assets/animations/character2.json"),
  require("@/assets/animations/character3.json"),
];

interface QuestionMascotProps {
  seed: number;
}

export function QuestionMascot({ seed }: QuestionMascotProps) {
  const currentMascot = useMemo(
    () => QUESTION_MASCOTS[seed % QUESTION_MASCOTS.length],
    [seed],
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
      style={styles.mascotContainer}
    >
      <LottieView source={currentMascot} autoPlay loop style={styles.lottie} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  lottie: {
    width: 100,
    height: 125,
  },
});
