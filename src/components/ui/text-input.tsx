/**
 * TextInput - Styled input with animated focus border glow,
 * floating label, and error support.
 */

import React, { useState, useEffect } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows, AnimationPresets } from '@/constants/theme';

const AnimatedView = Animated.View;

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function StyledTextInput({ label, error, style, ...props }: StyledTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: AnimationPresets.duration.fast,
    });
  }, [isFocused]);

  const borderAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [Colors.inputBorder, Colors.primary]
    );

    return {
      borderColor,
      borderWidth: isFocused ? 2 : 1.5,
    };
  });

  const shadowAnimStyle = useAnimatedStyle(() => ({
    shadowOpacity: focusAnim.value * 0.15,
    shadowRadius: focusAnim.value * 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    elevation: focusAnim.value * 4,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AnimatedView style={[styles.inputWrapper, borderAnimStyle, shadowAnimStyle, error && styles.inputError]}>
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </AnimatedView>
      {error && (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>ⓘ</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  input: {
    height: 52,
    paddingHorizontal: Spacing.four,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.lg,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  errorIcon: {
    color: Colors.error,
    fontSize: FontSizes.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
