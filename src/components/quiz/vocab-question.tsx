/**
 * VocabQuestion - Image + multiple choice answers.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AudioButton } from '@/components/ui/audio-button';
import type { VocabQuestion as VocabQuestionType } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface VocabQuestionProps {
  question: VocabQuestionType;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
}

export function VocabQuestionCard({ question, selectedAnswer, onSelectAnswer }: VocabQuestionProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: question.imageUrl }} style={styles.image} />

      <View style={styles.audioRow}>
        <AudioButton variant="speaker" size="small" onPress={() => {}} />
      </View>

      <Text style={styles.instruction}>{question.instruction}</Text>

      <View style={styles.answers}>
        {question.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;
          return (
            <TouchableOpacity
              key={answer.id}
              style={[styles.answerCard, isSelected && styles.answerSelected]}
              onPress={() => onSelectAnswer(answer.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                {answer.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  image: {
    width: 200,
    height: 140,
    borderRadius: BorderRadius.lg,
    resizeMode: 'cover',
  },
  audioRow: {
    alignSelf: 'flex-end',
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  answers: {
    width: '100%',
    gap: Spacing.three,
  },
  answerCard: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.accentPale,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  answerText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  answerTextSelected: {
    color: Colors.textOnDark,
  },
});
