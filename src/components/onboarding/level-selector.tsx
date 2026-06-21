/**
 * LevelSelector - Level selection cards + dropdown for onboarding.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ONBOARDING_LEVELS } from '@/data';
import type { OnboardingLevelId } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface LevelSelectorProps {
  selectedLevel: OnboardingLevelId | null;
  onSelect: (level: OnboardingLevelId) => void;
}

export function LevelSelector({ selectedLevel, onSelect }: LevelSelectorProps) {
  return (
    <View style={styles.container}>
      {ONBOARDING_LEVELS.map((level) => {
        const isSelected = selectedLevel === level.id;
        return (
          <TouchableOpacity
            key={level.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(level.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.title, isSelected && styles.titleSelected]}>{level.title}</Text>
            <Text style={styles.description}>{level.description}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.dropdownCard, selectedLevel === 'jlpt' && styles.cardSelected]}
        onPress={() => onSelect('jlpt')}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>Choose your current level</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
  },
  card: {
    padding: Spacing.six,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
    gap: Spacing.two,
  },
  cardSelected: {
    backgroundColor: Colors.accent,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  titleSelected: {
    color: Colors.textOnDark,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    opacity: 0.8,
  },
  dropdownCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
  },
  dropdownText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  dropdownArrow: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
