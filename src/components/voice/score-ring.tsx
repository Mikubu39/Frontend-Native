/**
 * ScoreRing - Pronunciation score circular display (e.g. 67/100).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleProgress } from '@/components/ui/circle-progress';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface ScoreRingProps {
  score: number; // 0 to 100
}

export function ScoreRing({ score }: ScoreRingProps) {
  return (
    <View style={styles.container}>
      <CircleProgress
        progress={score / 100}
        size={200}
        strokeWidth={14}
        color={Colors.accent}
        label={String(score)}
        sublabel="out of 100"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
  },
});
