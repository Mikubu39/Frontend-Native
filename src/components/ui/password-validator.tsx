/**
 * PasswordValidator - Checklist showing password requirements.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface PasswordValidatorProps {
  password: string;
}

const RULES = [
  { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'An uppercase character', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordValidator({ password }: PasswordValidatorProps) {
  return (
    <View style={styles.container}>
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <View key={rule.label} style={styles.row}>
            <View style={[styles.checkCircle, passed && styles.checkCirclePassed]}>
              {passed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.label, passed && styles.labelPassed]}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCirclePassed: {
    backgroundColor: Colors.checkmark,
    borderColor: Colors.checkmark,
  },
  checkMark: {
    color: Colors.textOnDark,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  label: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  labelPassed: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
});
