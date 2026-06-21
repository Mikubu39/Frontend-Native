/**
 * KanaQuestionCard - Arranging kana character tiles.
 * Figma screen 13
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import type { KanaQuestion } from '@/types';

interface KanaQuestionProps {
  question: KanaQuestion;
  onAnswerChange: (isCorrect: boolean, arrangedString: string) => void;
}

export function KanaQuestionCard({ question, onAnswerChange }: KanaQuestionProps) {
  const [arranged, setArranged] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(question.characters);

  useEffect(() => {
    // Reset when question changes
    setArranged([]);
    setBank(question.characters);
  }, [question]);

  const selectTile = (char: string) => {
    const newArranged = [...arranged, char];
    setArranged(newArranged);
    
    // Remove one instance of char from bank
    const idx = bank.indexOf(char);
    if (idx > -1) {
      const newBank = [...bank];
      newBank.splice(idx, 1);
      setBank(newBank);
    }

    validate(newArranged);
  };

  const removeTile = (char: string, index: number) => {
    const newArranged = [...arranged];
    newArranged.splice(index, 1);
    setArranged(newArranged);
    
    setBank([...bank, char]);
    validate(newArranged);
  };

  const validate = (currentArranged: string[]) => {
    const isCorrect = currentArranged.length === question.correctOrder.length &&
      currentArranged.every((char, i) => char === question.correctOrder[i]);
    onAnswerChange(isCorrect, currentArranged.join(''));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.instruction}>{question.instruction}</Text>
      
      {question.imageUrl && (
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
      )}

      {/* Arranged preview */}
      <View style={styles.previewContainer}>
        {arranged.length === 0 ? (
          <Text style={styles.placeholderText}>Tap tiles below to arrange</Text>
        ) : (
          arranged.map((char, index) => (
            <TouchableOpacity
              key={`arranged-${index}`}
              style={styles.tile}
              onPress={() => removeTile(char, index)}
            >
              <Text style={styles.tileText}>{char}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* Character bank */}
      <Text style={styles.label}>Character Tiles:</Text>
      <View style={styles.bankContainer}>
        {bank.map((char, index) => (
          <TouchableOpacity
            key={`bank-${index}`}
            style={styles.bankTile}
            onPress={() => selectTile(char)}
          >
            <Text style={styles.bankTileText}>{char}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  instruction: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.four,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  image: {
    width: 200,
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.six,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 64,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    width: '100%',
    padding: Spacing.three,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
  },
  tile: {
    width: 50,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tileText: {
    color: Colors.textOnDark,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.four,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  bankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  bankTile: {
    width: 50,
    height: 50,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankTileText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
});
