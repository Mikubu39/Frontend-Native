/**
 * OptionCard - Selectable card with animated selection feedback.
 * Scales + bounces on select with a checkmark entrance.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  AnimationPresets,
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: "default" | "accent";
}

export function OptionCard({
  title,
  subtitle,
  selected = false,
  onPress,
  variant = "default",
}: OptionCardProps) {
  const selectionAnim = useSharedValue(selected ? 1 : 0);
  const bounceScale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      selectionAnim.value = withSpring(1, AnimationPresets.springSnappy);
      bounceScale.value = withSequence(
        withTiming(0.95, { duration: 80 }),
        withSpring(1.02, AnimationPresets.springTab),
        withSpring(1, { damping: 20, stiffness: 200 }),
      );
      import("expo-haptics").then((Haptics) => {
        Haptics.selectionAsync().catch(() => {});
      });
    } else {
      selectionAnim.value = withSpring(0, AnimationPresets.springSnappy);
    }
  }, [selected]);

  const cardAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      ["transparent", Colors.accent],
    );
    const backgroundColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      [Colors.accentPale, Colors.accent],
    );

    return {
      borderColor,
      backgroundColor,
      borderBottomWidth: selected ? 2.5 : 4,
      transform: [
        { scale: bounceScale.value },
        { translateY: selected ? 1.5 : 0 },
      ],
    };
  });

  const isAccent = variant === "accent" || selected;

  return (
    <AnimatedPressable
      onPress={onPress}
      pressScale={0.95}
      disableAnimation={false}
      accessibilityRole="checkbox"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <Animated.View style={[styles.card, cardAnimStyle]}>
        <View style={styles.content}>
          <Text style={[styles.title, isAccent && styles.titleAccent]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, isAccent && styles.subtitleAccent]}>
              {subtitle}
            </Text>
          )}
        </View>
        {/* Checkmark */}
        {selected && (
          <Animated.View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  content: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    fontFamily: Fonts.rounded,
    textAlign: "center",
  },
  titleAccent: {
    color: Colors.textOnDark,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontFamily: Fonts.sans,
    textAlign: "center",
  },
  subtitleAccent: {
    color: "rgba(255,255,255,0.85)",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: Spacing.four,
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: FontWeights.extrabold,
  },
});
