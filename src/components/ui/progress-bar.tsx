/**
 * ProgressBar - Stepped progress indicator for onboarding/quiz.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = Colors.accent,
  trackColor = Colors.lockedBg,
  height = 10,
}: ProgressBarProps) {
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
