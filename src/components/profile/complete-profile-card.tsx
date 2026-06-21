/**
 * CompleteProfileCard - Yellow progress card with "Continue" action.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface CompleteProfileCardProps {
  completion: number; // 0 to 100
  onContinue: () => void;
}

export function CompleteProfileCard({ completion, onContinue }: CompleteProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Complete profile</Text>
        <Text style={styles.percentage}>{completion}%</Text>
      </View>
      <ProgressBar progress={completion / 100} color={Colors.primary} />
      <TouchableOpacity onPress={onContinue} activeOpacity={0.7}>
        <Text style={styles.continueText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.accentPale,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  percentage: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
  continueText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    alignSelf: 'flex-end',
  },
});
