import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioButton } from '@/components/ui/audio-button';
import { DualText } from '@/components/ui/dual-text';
import { useAudio } from '@/hooks/use-audio';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import type { KanaQuestion } from '@/types';

interface KanaQuestionProps {
  question: KanaQuestion;
  onAnswerChange: (isCorrect: boolean, arrangedString: string) => void;
}

export function KanaQuestionCard({ question, onAnswerChange }: KanaQuestionProps) {
  const [arranged, setArranged] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(question.characters);
  const { isPlaying, play } = useAudio(question.audioUrl);

  const isListening = !!question.audioUrl || question.instruction?.toLowerCase().includes('nghe');

  useEffect(() => {
    // Reset when question changes
    setArranged([]);
    setBank(question.characters);
    if (question.audioUrl) {
      play();
    }
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
      
      {isListening ? (
        <View style={{ marginBottom: Spacing.four, alignItems: 'center' }}>
          <AudioButton isPlaying={isPlaying} variant="speaker" size="medium" onPress={play} />
        </View>
      ) : null}

      {question.imageUrl && (
        <Image source={{ uri: question.imageUrl }} style={styles.image} />
      )}

      {/* Arranged preview */}
      <View style={styles.previewContainer}>
        {arranged.length === 0 ? (
          <Text style={styles.placeholderText}>Chạm vào các từ bên dưới để sắp xếp</Text>
        ) : (
          arranged.map((char, index) => (
            <TouchableOpacity
              key={`arranged-${index}`}
              style={styles.tile}
              onPress={() => removeTile(char, index)}
              activeOpacity={0.7}
            >
              <DualText
                text={char}
                mainStyle={styles.tileText}
                subStyle={styles.tileSubText}
              />
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* Character bank */}
      <Text style={styles.label}>Các từ chọn:</Text>
      <View style={styles.bankContainer}>
        {bank.map((char, index) => (
          <TouchableOpacity
            key={`bank-${index}`}
            style={styles.bankTile}
            onPress={() => selectTile(char)}
            activeOpacity={0.7}
          >
            <DualText
              text={char}
              mainStyle={styles.bankTileText}
              subStyle={styles.bankTileSubText}
            />
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
    padding: Spacing.five,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  instruction: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.four,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    width: '100%',
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    fontStyle: 'italic',
  },
  tile: {
    minWidth: 52,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
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
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  tileSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.three,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.two,
  },
  bankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.two,
  },
  bankTile: {
    minWidth: 52,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankTileText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  bankTileSubText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
});

