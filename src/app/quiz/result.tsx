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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuizResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setEnergy, addExp, fetchGamificationData } = useGamification();
  
  const correctCount = parseInt(params.correctCount as string || '0', 10);
  const wrongCount = parseInt(params.wrongCount as string || '0', 10);
  const expEarned = parseInt(params.expEarned as string || '0', 10);
  const starsEarned = parseInt(params.starsEarned as string || '0', 10);
  const coinsEarned = parseInt(params.coinsEarned as string || '0', 10);
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
    // Lấy dữ liệu mới nhất (gồm cả streak) từ backend
    fetchGamificationData();
  }, []);

  const handleContinue = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastShown = await AsyncStorage.getItem('lastStreakExtendedDate');
      
      // Nếu hôm nay chưa hiển thị màn hình chúc mừng streak và có expEarned > 0 (bài học thành công)
      if (lastShown !== today && expEarned > 0) {
        await AsyncStorage.setItem('lastStreakExtendedDate', today);
        router.push('/lesson/streak-extended');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      router.replace('/(tabs)');
    }
  };

  const realResult = {
    totalQuestions: correctCount + wrongCount || 1,
    correctCount,
    wrongCount,
    correctCategories: [
      { name: `+${expEarned} EXP${coinsEarned > 0 ? `, +${coinsEarned} Coin` : ''}`, stars: starsEarned || (expEarned > 0 ? 3 : 0) }
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
              onPress={handleContinue}
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
