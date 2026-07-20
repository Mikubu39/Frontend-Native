/**
 * GradientButton - Primary action button with gradient or solid color.
 * Enhanced with animated press scale effect for premium feel.
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
  type StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: GradientButtonProps) {
  if (variant === 'outline') {
    return (
      <AnimatedPressable
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        pressScale={0.96}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </AnimatedPressable>
    );
  }

  const gradientColors: [string, string] = variant === 'accent'
    ? [Colors.accent, Colors.accentLight]
    : variant === 'secondary'
    ? [Colors.secondary, Colors.secondaryLight]
    : [Colors.primary, Colors.primaryLight];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      pressScale={0.96}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, Shadows.glow(gradientColors[0])]}
      >
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  gradientText: {
    color: Colors.textOnDark,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  outlineButton: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});
