/**
 * OptionCard - Selectable card with animated selection feedback.
 * Scales + bounces on select with a checkmark entrance and 3D Duolingo border.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  AnimationPresets,
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

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
}: OptionCardProps) {
  const { colors, isDark } = useTheme();
  const selectionAnim = useSharedValue(selected ? 1 : 0);
  const bounceScale = useSharedValue(1);

  const unselectedBg = colors.card;
  const unselectedBorder = colors.border;
  const selectedBg = isDark ? Colors.primary + "30" : "#E8EAF4";
  const selectedBorder = Colors.primary;

  useEffect(() => {
    if (selected) {
      selectionAnim.value = withSpring(1, AnimationPresets.springSnappy);
      bounceScale.value = withSequence(
        withTiming(0.96, { duration: 70 }),
        withSpring(1.02, AnimationPresets.springTab),
        withSpring(1, { damping: 20, stiffness: 200 }),
      );
      Haptics.selectionAsync().catch(() => {});
    } else {
      selectionAnim.value = withSpring(0, AnimationPresets.springSnappy);
    }
  }, [selected, bounceScale, selectionAnim]);

  const cardAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      [unselectedBorder, selectedBorder],
    );
    const backgroundColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      [unselectedBg, selectedBg],
    );

    return {
      borderColor,
      backgroundColor,
      borderBottomWidth: selected ? 3.5 : 3.5,
      transform: [
        { scale: bounceScale.value },
        { translateY: selected ? 1 : 0 },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      pressScale={0.96}
      disableAnimation={false}
      accessibilityRole="checkbox"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <Animated.View style={[styles.card, cardAnimStyle]}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: selected
                  ? isDark
                    ? "#FFFFFF"
                    : Colors.primaryDark
                  : colors.text,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: selected
                    ? isDark
                      ? "rgba(255,255,255,0.85)"
                      : Colors.primary
                    : colors.textSecondary,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {/* Checkmark */}
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
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
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "flex-start",
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.sans,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.three,
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: FontWeights.extrabold,
  },
});
