import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { FillBlankQuestion } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { JapaneseText } from '../ui/japanese-text';

interface FillBlankQuestionProps {
  question: FillBlankQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function FillBlankQuestionCard({ question, onAnswerChange }: FillBlankQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onAnswerChange(option === question.correctAnswer);
  };

  const renderSentence = () => {
    const parts = question.sentence.split('___');
    return (
      <View style={styles.sentenceContainer}>
        <JapaneseText text={parts[0]} style={styles.sentenceText} />
        <View style={[styles.blank, selectedOption && styles.blankFilled]}>
          <Text style={[styles.blankText, selectedOption && styles.blankTextFilled]}>
            {selectedOption || '     '}
          </Text>
        </View>
        <JapaneseText text={parts[1]} style={styles.sentenceText} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{question.instruction}</Text>

      {renderSentence()}

      <View style={styles.optionsGrid}>
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, isSelected && styles.optionSelected]}
              onPress={() => handleSelect(option)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
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
    gap: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: Spacing.four,
    gap: 8,
  },
  sentenceText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  blank: {
    minWidth: 60,
    borderBottomWidth: 3,
    borderBottomColor: Colors.textSecondary,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankFilled: {
    borderBottomColor: Colors.primary,
  },
  blankText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: 'transparent',
  },
  blankTextFilled: {
    color: Colors.primary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.four,
    width: '100%',
  },
  optionCard: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    minWidth: 100,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cream,
  },
  optionText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primaryDark,
  }
});
