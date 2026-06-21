/**
 * GoalSelector - Goal option cards for onboarding.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OptionCard } from '@/components/ui/option-card';
import { ONBOARDING_GOALS } from '@/data';
import type { OnboardingGoal } from '@/types';
import { Spacing } from '@/constants/theme';

interface GoalSelectorProps {
  selectedGoal: OnboardingGoal | null;
  onSelect: (goal: OnboardingGoal) => void;
}

export function GoalSelector({ selectedGoal, onSelect }: GoalSelectorProps) {
  return (
    <View style={styles.container}>
      {ONBOARDING_GOALS.map((goal) => (
        <OptionCard
          key={goal.id}
          title={goal.label}
          selected={selectedGoal === goal.id}
          onPress={() => onSelect(goal.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
});
