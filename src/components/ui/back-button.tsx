/**
 * BackButton - Shared, accessible back-navigation affordance.
 *
 * Replaces the bare `<Text onPress={...}>←</Text>` back arrows scattered
 * across screens: those had no accessibility role/label and an undersized
 * touch target. This wraps `AnimatedPressable` for the app's standard press
 * feedback, uses the same `chevron-back` glyph as the rest of the app's back
 * affordances, and guarantees a >=44x44 hit area via `hitSlop`.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

const VISUAL_SIZE = 32;
const MIN_HIT_AREA = 44;
const HIT_SLOP = Math.ceil((MIN_HIT_AREA - VISUAL_SIZE) / 2);

interface BackButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({ onPress, size = 24, color, style }: BackButtonProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      pressScale={0.9}
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      hitSlop={HIT_SLOP}
      style={[styles.button, style]}
    >
      <Ionicons name="chevron-back" size={size} color={color ?? colors.text} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: VISUAL_SIZE,
    height: VISUAL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
