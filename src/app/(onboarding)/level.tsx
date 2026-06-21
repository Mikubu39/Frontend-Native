/**
 * Level Selection Screen - "What is your level?"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LevelSelector } from '@/components/onboarding/level-selector';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useOnboarding } from '@/contexts/onboarding-context';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function LevelScreen() {
  const router = useRouter();
  const { state, setLevel } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={1} />

      <View style={styles.content}>
        <Text style={styles.title}>What is your level?</Text>
        <LevelSelector selectedLevel={state.selectedLevel} onSelect={setLevel} />
      </View>

      <GradientButton
        title="START LEARNING"
        onPress={() => router.replace('/(tabs)')}
        disabled={!state.selectedLevel}
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
