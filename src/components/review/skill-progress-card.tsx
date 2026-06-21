/**
 * SkillProgressCard - Skill name + check dots (filled/empty).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SkillProgress } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface SkillProgressCardProps {
  skill: SkillProgress;
}

export function SkillProgressCard({ skill }: SkillProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{skill.name}</Text>
      <View style={styles.dots}>
        {Array.from({ length: skill.totalLessons }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < skill.completedLessons ? styles.dotCompleted : styles.dotEmpty,
            ]}
          >
            {i < skill.completedLessons && <Text style={styles.check}>✓</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    gap: Spacing.three,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.checkmark,
  },
  dotEmpty: {
    backgroundColor: Colors.lockedBg,
  },
  check: {
    color: Colors.textOnDark,
    fontSize: 14,
    fontWeight: FontWeights.bold,
  },
});
