/**
 * QuizResultCard - "Good job!" result with categories breakdown.
 */

import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import type { QuizResult } from '@/types';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { BounceIn, FadeInUp } from 'react-native-reanimated';

interface QuizResultCardProps {
  result: QuizResult;
  isFailed?: boolean;
}

export function QuizResultCard({ result, isFailed }: QuizResultCardProps) {
  const scorePercentage = result.correctCount / result.totalQuestions;
  const isPerfect = scorePercentage === 1;
  const isGood = scorePercentage >= 0.7;
  const isAverage = scorePercentage >= 0.4;

  const animationSource = isFailed
    ? require('../../../assets/animations/confuse_mascot.json')
    : isPerfect
      ? require('../../../assets/animations/winner_mascot.json')
      : isGood
        ? require('../../../assets/animations/happy_mascot.json')
        : isAverage
          ? require('../../../assets/animations/hi_mascot.json')
          : require('../../../assets/animations/confuse_mascot.json');

  const titleText = isFailed
    ? 'Out of Hearts!'
    : isPerfect
      ? 'Perfect!'
      : isGood
        ? 'Great Job!'
        : isAverage
          ? 'Good Effort!'
          : 'Keep Trying!';

  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={styles.container}
    >
      <View style={styles.animationContainer}>
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <Animated.Text
        entering={BounceIn.delay(300)}
        style={styles.title}
      >
        {titleText}
      </Animated.Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Correct</Text>
          <Text style={[styles.scoreValue, styles.correctValue]}>{result.correctCount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Wrong</Text>
          <Text style={[styles.scoreValue, styles.wrongValue]}>{result.wrongCount}</Text>
        </View>
      </View>

      <View style={styles.categoriesList}>
        {result.correctCategories.map((cat, index) => (
          <Animated.View
            key={cat.name}
            entering={FadeInUp.delay(500 + index * 100)}
            style={styles.categoryRow}
          >
            <Text style={styles.categoryName}>{cat.name}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: cat.stars }).map((_, i) => (
                <Text key={i} style={styles.star}>⭐</Text>
              ))}
            </View>
          </Animated.View>
        ))}
      </View>

      {result.wrongCategories.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(800)}
          style={styles.wrongSection}
        >
          <Text style={styles.wrongTitle}>Need more practice:</Text>
          {result.wrongCategories.map((cat) => (
            <Text key={cat} style={styles.wrongCategory}>• {cat}</Text>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    gap: Spacing.five,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  animationContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Spacing.four,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.seven,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  scoreLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
  },
  correctValue: {
    color: Colors.success,
  },
  wrongValue: {
    color: Colors.error,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.lockedBg,
  },
  categoriesList: {
    gap: Spacing.three,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  star: {
    fontSize: 16,
  },
  wrongSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: Colors.lockedBg,
  },
  wrongTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.error,
  },
  wrongCategory: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
});
