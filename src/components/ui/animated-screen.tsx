/**
 * AnimatedScreen - Wrapper that adds smooth entering animations to screen content.
 * Provides fluid fade-in + slide effects with refined spring physics.
 */

import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from "react-native-reanimated";
import { AnimationPresets } from "@/constants/theme";

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Animation variant: 'fade' | 'slideUp' | 'fadeSlide' | 'fadeDown' */
  variant?: "fade" | "slideUp" | "fadeSlide" | "fadeDown";
  /** Duration in ms (default: 300) */
  duration?: number;
}

export function AnimatedScreen({
  children,
  style,
  variant = "fade",
  duration = 300,
}: AnimatedScreenProps) {
  const getEnteringAnimation = () => {
    const { damping, stiffness } = AnimationPresets.spring;

    switch (variant) {
      case "slideUp":
        return SlideInUp.duration(duration)
          .springify()
          .damping(damping)
          .stiffness(stiffness);
      case "fadeDown":
        return FadeIn.duration(duration); // Changed from FadeInDown to FadeIn for snappier load
      case "fadeSlide":
        return FadeIn.duration(duration); // Changed from FadeInDown to FadeIn for snappier load
      case "fade":
      default:
        return FadeIn.duration(duration);
    }
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      style={[styles.container, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
