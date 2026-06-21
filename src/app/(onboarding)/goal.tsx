/**
 * Goal Selection Screen - "What is your goal?"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoalSelector } from '@/components/onboarding/goal-selector';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useOnboarding } from '@/contexts/onboarding-context';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function GoalScreen() {
  const router = useRouter();
  const { state, setGoal } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={0.33} />

      <View style={styles.content}>
        <Text style={styles.title}>What is your goal?</Text>
        <GoalSelector selectedGoal={state.selectedGoal} onSelect={setGoal} />
      </View>

      <GradientButton
        title="NEXT"
        onPress={() => router.push('/(onboarding)/interests')}
        disabled={!state.selectedGoal}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: Spacing.six,
    gap: Spacing.six,
  },
  content: {
    flex: 1,
    gap: Spacing.seven,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  button: {
    marginBottom: Spacing.four,
  },
});
