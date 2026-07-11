/**
 * Quiz Ready Screen - Enhanced with animated entrance,
 * improved card design, and press animation on buttons.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { GradientButton } from '@/components/ui/gradient-button';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows, AnimationPresets } from '@/constants/theme';
import { LESSON_TIPS } from '@/data/quiz';

export default function QuizReadyScreen() {
  const router = useRouter();
  const { lessonId = 'lp1' } = useLocalSearchParams<{ lessonId: string }>();
  const [showTranslation1, setShowTranslation1] = useState(false);
  const [showTranslation2, setShowTranslation2] = useState(false);

  const tip = LESSON_TIPS[lessonId as keyof typeof LESSON_TIPS] || LESSON_TIPS.lp5;

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <AnimatedPressable onPress={() => router.back()} style={styles.backBtn} pressScale={0.9}>
        <Text style={styles.backText}>←</Text>
      </AnimatedPressable>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.flag}
      >
        <Text style={styles.flagEmoji}>💡</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.tipHeader}
      >
        <Text style={styles.tipSubtitle}>{tip.subtitle}</Text>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(350).duration(400)}
        style={styles.card}
      >
        {tip.formula ? (
          <View style={styles.formulaContainer}>
            <Text style={styles.formulaText}>{tip.formula}</Text>
          </View>
        ) : null}

        <Text style={styles.explanation}>
          {tip.explanation}
        </Text>

        <Text style={styles.sectionLabel}>Ví dụ thực hành:</Text>

        {tip.examples.map((ex, index) => {
          const isShow = index === 0 ? showTranslation1 : showTranslation2;
          const setIsShow = index === 0 ? setShowTranslation1 : setShowTranslation2;
          
          return (
            <AnimatedPressable 
              key={index}
              style={styles.exampleRow} 
              onPress={() => setIsShow(!isShow)}
              pressScale={0.98}
            >
              <View style={styles.exampleContent}>
                <Text style={styles.japaneseText}>{ex.japanese}</Text>
                <Text style={styles.translationText}>
                  {isShow ? ex.translation : 'タップして翻訳を表示 (Nhấp để xem dịch)'}
                </Text>
              </View>
              <View style={styles.speakerBtn}>
                <Text style={styles.speakerEmoji}>🔊</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={{ width: '100%' }}
      >
        <GradientButton
          title="BẮT ĐẦU LUYỆN TẬP"
          onPress={() => router.replace(`/quiz/q1?lessonId=${lessonId}`)}
          style={styles.button}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.five,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: Spacing.six,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  backText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  flag: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    ...Shadows.md,
  },
  flagEmoji: {
    fontSize: 28,
  },
  tipHeader: {
    alignItems: 'center',
    gap: 6,
  },
  tipSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  tipTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    width: '100%',
    ...Shadows.lg,
  },
  formulaContainer: {
    backgroundColor: Colors.cream,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },
  formulaText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
  },
  explanation: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.five,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
  },
  exampleContent: {
    flex: 1,
  },
  japaneseText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  translationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  speakerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
    ...Shadows.sm,
  },
  speakerEmoji: {
    fontSize: 18,
  },
  button: {
    width: '100%',
  },
});

