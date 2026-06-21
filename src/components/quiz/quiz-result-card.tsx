/**
 * QuizResultCard - "Good job!" result with categories breakdown.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { QuizResult } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface QuizResultCardProps {
  result: QuizResult;
}

export function QuizResultCard({ result }: QuizResultCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Good job!</Text>

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
        {result.correctCategories.map((cat) => (
          <View key={cat.name} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: cat.stars }).map((_, i) => (
                <Text key={i} style={styles.star}>⭐</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {result.wrongCategories.length > 0 && (
        <View style={styles.wrongSection}>
          <Text style={styles.wrongTitle}>Need more practice:</Text>
          {result.wrongCategories.map((cat) => (
            <Text key={cat} style={styles.wrongCategory}>• {cat}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    gap: Spacing.five,
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
