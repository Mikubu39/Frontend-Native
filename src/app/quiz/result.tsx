/**
 * Quiz Result Screen - Shows score and category breakdown.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QuizResultCard } from '@/components/quiz/quiz-result-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useGamification } from '@/contexts/gamification-context';
import { Colors, Spacing } from '@/constants/theme';

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setEnergy, addExp } = useGamification();
  
  const correctCount = parseInt(params.correctCount as string || '0', 10);
  const wrongCount = parseInt(params.wrongCount as string || '0', 10);
  const expEarned = parseInt(params.expEarned as string || '0', 10);
  const starsEarned = parseInt(params.starsEarned as string || '0', 10);
  const status = params.status as string;
  const currentEnergyStr = params.currentEnergy as string;

  const isFailed = status === 'IN_PROGRESS';

  useEffect(() => {
    if (currentEnergyStr) {
      setEnergy(parseInt(currentEnergyStr, 10));
    }
    if (expEarned > 0) {
      addExp(expEarned);
    }
  }, []);

  const realResult = {
    totalQuestions: correctCount + wrongCount || 1,
    correctCount,
    wrongCount,
    correctCategories: [
      { name: `EXP Earned (+${expEarned})`, stars: starsEarned || (expEarned > 0 ? 3 : 0) }
    ],
    wrongCategories: [],
  };

  return (
    <LinearGradient
      colors={Colors.gradients.result}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <QuizResultCard result={realResult} isFailed={isFailed} />
        </View>

        <View style={styles.buttons}>
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <GradientButton
              title="Continue"
              onPress={() => router.replace('/(tabs)')}
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <GradientButton
              title="Try Again"
              variant="outline"
              onPress={() => router.back()}
            />
          </Animated.View>
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
