/**
 * VocabQuestion - Image + multiple choice answers.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AudioButton } from '@/components/ui/audio-button';
import type { VocabQuestion as VocabQuestionType } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface VocabQuestionProps {
  question: VocabQuestionType;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
}

import { DualText } from '@/components/ui/dual-text';

export function VocabQuestionCard({ question, selectedAnswer, onSelectAnswer }: VocabQuestionProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <View style={styles.container}>
      {question.imageUrl ? (
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.audioRow}>
        <AudioButton variant="speaker" size="small" onPress={() => {}} />
      </View>

      {question.word ? (
        <Pressable 
          onLongPress={() => setShowHint(true)} 
          onPressOut={() => setShowHint(false)}
          delayLongPress={200}
        >
          <View style={styles.wordContainer}>
            {showHint && question.hint && (
              <View style={styles.tooltipContainer}>
                <View style={styles.tooltipBody}>
                  <Text style={styles.tooltipText}>{question.hint}</Text>
                </View>
                <View style={styles.tooltipArrow} />
              </View>
            )}
            <DualText 
              text={question.word} 
              hint={question.hint}
              mainStyle={styles.word}
            />
          </View>
        </Pressable>
      ) : null}

      <Text style={styles.instruction}>{question.instruction}</Text>

      <View style={styles.answers}>
        {question.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;
          return (
            <AnimatedPressable
              key={answer.id}
              style={[styles.answerCard, isSelected && styles.answerSelected]}
              onPress={() => onSelectAnswer(answer.id)}
              pressScale={0.97}
            >
              <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                {answer.text}
              </Text>
            </AnimatedPressable>
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
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  wordContainer: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 10,
  },
  word: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  wordHintable: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: Colors.textSecondary,
  },
  tooltipContainer: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 20,
    width: 200,
  },
  tooltipBody: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.secondary,
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

