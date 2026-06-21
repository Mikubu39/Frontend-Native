/**
 * WeekList - Yellow week rows with arrow buttons.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReviewWeek } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface WeekListProps {
  weeks: ReviewWeek[];
  onWeekPress: (week: ReviewWeek) => void;
}

export function WeekList({ weeks, onWeekPress }: WeekListProps) {
  return (
    <View style={styles.container}>
      {weeks.map((week) => (
        <TouchableOpacity
          key={week.id}
          style={styles.row}
          onPress={() => onWeekPress(week)}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>{week.label}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.accentPale,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.xl,
    gap: Spacing.four,
  },
  label: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  arrow: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
});
