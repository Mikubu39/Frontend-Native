/**
 * TextInput - Styled input with label and error support.
 * Matches the yellow-bordered inputs in Figma auth screens.
 */

import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function StyledTextInput({ label, error, style, ...props }: StyledTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
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
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
  },
  inputFocused: {
    borderColor: Colors.inputBorderFocus,
    borderWidth: 2,
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
