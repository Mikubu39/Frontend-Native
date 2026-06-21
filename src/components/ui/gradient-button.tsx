/**
 * GradientButton - Primary action button with gradient or solid color.
 * Used across all screens (Sign up, NEXT, READY, etc.)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
      <TouchableOpacity
        style={[styles.outlineButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  const gradientColors: [string, string] = variant === 'accent'
    ? [Colors.accent, Colors.accentLight]
    : variant === 'secondary'
    ? [Colors.secondary, Colors.secondaryLight]
    : [Colors.primary, Colors.primaryLight];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <Text style={[styles.gradientText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: Colors.surface,
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
