/**
 * LessonGrid - 2-column grid for lesson detail screen.
 * Shows sub-items like "Hiragana 1-20", "Writing Hiragana", etc.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { LessonSubItem } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface LessonGridProps {
  items: LessonSubItem[];
  onItemPress: (item: LessonSubItem) => void;
  overallQuiz?: LessonSubItem;
  onQuizPress?: (item: LessonSubItem) => void;
}

export function LessonGrid({ items, onItemPress, overallQuiz, onQuizPress }: LessonGridProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item) => {
          const isLocked = item.status === 'locked';
          const isCompleted = item.status === 'completed';
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                isLocked && styles.cardLocked,
                isCompleted && styles.cardCompleted,
              ]}
              onPress={() => !isLocked && onItemPress(item)}
              disabled={isLocked}
              activeOpacity={0.7}
            >
              <Text style={[styles.cardTitle, isLocked && styles.textLocked]}>
                {item.title}
              </Text>
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {overallQuiz && (
        <TouchableOpacity
          style={[
            styles.quizButton,
            overallQuiz.status === 'locked' && styles.quizLocked,
          ]}
          onPress={() => onQuizPress?.(overallQuiz)}
          disabled={overallQuiz.status === 'locked'}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.quizText,
            overallQuiz.status === 'locked' && styles.textLocked,
          ]}>
            {overallQuiz.title}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    justifyContent: 'center',
  },
  card: {
    width: '44%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  cardLocked: {
    backgroundColor: Colors.lockedBg,
    borderColor: Colors.locked,
    opacity: 0.7,
  },
  cardCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  textLocked: {
    color: Colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    fontSize: 18,
    color: Colors.textOnDark,
  },
  lockIcon: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    fontSize: 14,
  },
  quizButton: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
  },
  quizLocked: {
    backgroundColor: Colors.lockedBg,
    borderColor: Colors.locked,
    opacity: 0.7,
  },
  quizText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
