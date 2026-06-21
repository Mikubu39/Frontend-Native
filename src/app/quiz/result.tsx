/**
 * Quiz Result Screen - Shows score and category breakdown.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { QuizResultCard } from '@/components/quiz/quiz-result-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, Spacing } from '@/constants/theme';

const MOCK_RESULT = {
  totalQuestions: 20,
  correctCount: 16,
  wrongCount: 4,
  correctCategories: [
    { name: 'Vocabulary', stars: 3 },
    { name: 'Grammar', stars: 2 },
    { name: 'Reading', stars: 3 },
  ],
  wrongCategories: ['Kanji writing'],
};

export default function QuizResultScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={Colors.gradients.result}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <QuizResultCard result={MOCK_RESULT} />
        </View>

        <View style={styles.buttons}>
          <GradientButton
            title="Continue"
            onPress={() => router.replace('/(tabs)')}
          />
          <GradientButton
            title="Try Again"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: 'center',
    gap: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  buttons: {
    gap: Spacing.four,
  },
});
