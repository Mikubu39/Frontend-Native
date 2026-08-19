/**
 * GradientButton - Primary action button with gradient or solid color.
 * Enhanced with animated press scale effect for premium feel.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "accent";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  customColors?: [string, string];
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function GradientButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  customColors,
  accessibilityLabel,
  accessibilityHint,
}: GradientButtonProps) {
  if (variant === "outline") {
    return (
      <AnimatedPressable
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        pressScale={0.96}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </AnimatedPressable>
    );
  }

  const gradientColors: [string, string] =
    customColors ||
    (variant === "accent"
      ? [Colors.accent, Colors.accentLight]
      : variant === "secondary"
        ? [Colors.secondary, Colors.secondaryLight]
        : [Colors.primary, Colors.primaryLight]);

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      pressScale={0.96}
      style={[disabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, Shadows.glow(gradientColors[0])]}
      >
        <View style={styles.glassmorphismSheen} />
        {loading ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <Text style={[styles.gradientText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    overflow: "hidden",
  },
  glassmorphismSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderTopColor: "rgba(255, 255, 255, 0.6)",
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
    borderRightColor: "rgba(255, 255, 255, 0.1)",
    borderBottomColor: "rgba(0, 0, 0, 0.15)",
  },
  gradientText: {
    color: Colors.textOnDark,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    fontFamily: Fonts.rounded,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  outlineButton: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  disabled: {
    opacity: 0.5,
  },
});
