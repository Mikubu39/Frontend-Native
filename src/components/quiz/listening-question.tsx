import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioButton } from '@/components/ui/audio-button';
import type { ListeningQuestion } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useAudio } from '@/hooks/use-audio';

interface ListeningQuestionProps {
  question: ListeningQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
}

export function ListeningQuestionCard({ question, selectedAnswer, onSelectAnswer }: ListeningQuestionProps) {
  const { isPlaying, play } = useAudio(question.audioUrl);

  useEffect(() => {
    play();
  }, [question, play]);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{question.instruction}</Text>

      <View style={styles.audioContainer}>
        <AudioButton variant="speaker" size="large" isPlaying={isPlaying} onPress={() => play()} />
        <Text style={styles.audioHint}>Chạm để nghe</Text>
      </View>

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
    gap: Spacing.eight,
    paddingHorizontal: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  audioContainer: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  audioHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
    alignItems: 'center',
  },
  answerSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  answerText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  answerTextSelected: {
    color: Colors.textOnDark,
  },
});
