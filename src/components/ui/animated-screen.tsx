/**
 * AnimatedScreen - Wrapper that adds smooth entering animations to screen content.
 * Provides fluid fade-in + slide effects with refined spring physics.
 *
 * For tab screens (which persist once mounted and never re-animate), pass
 * `skipEntering` to avoid the first-frame stutter that Reanimated entering
 * animations cause on Android.
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { AnimationPresets } from "@/constants/theme";

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Animation variant: 'fade' | 'slideUp' | 'fadeSlide' | 'fadeDown' */
  variant?: "fade" | "slideUp" | "fadeSlide" | "fadeDown";
  /** Duration in ms (default: 300) */
  duration?: number;
  /** Skip the entering animation entirely — use for tab screens that persist. */
  skipEntering?: boolean;
}

export function AnimatedScreen({
  children,
  style,
  variant = "fade",
  duration = 300,
  skipEntering = false,
}: AnimatedScreenProps) {
  if (skipEntering) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  const getEnteringAnimation = () => {
    const { damping, stiffness } = AnimationPresets.spring;

    switch (variant) {
      case "slideUp":
        return SlideInUp.duration(duration)
          .springify()
          .damping(damping)
          .stiffness(stiffness);
      case "fadeDown":
      case "fadeSlide":
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
