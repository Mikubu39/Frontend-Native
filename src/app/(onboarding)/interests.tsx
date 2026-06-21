/**
 * Interest Selection Screen - "What are your interests?"
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InterestGrid } from '@/components/onboarding/interest-grid';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useOnboarding } from '@/contexts/onboarding-context';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function InterestsScreen() {
  const router = useRouter();
  const { state, toggleInterest } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={0.66} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are your interests?</Text>
        <InterestGrid
          selectedInterests={state.selectedInterests}
          onToggle={toggleInterest}
        />
      </ScrollView>

      <GradientButton
        title="NEXT"
        onPress={() => router.push('/(onboarding)/level')}
        disabled={state.selectedInterests.length === 0}
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
    gap: Spacing.five,
  },
  scroll: {
    gap: Spacing.seven,
    paddingBottom: Spacing.four,
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
