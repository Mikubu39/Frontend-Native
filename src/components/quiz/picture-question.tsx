/**
 * PictureQuestionCard - Choose the correct picture based on word/audio.
 * Figma screen 14
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { AudioButton } from '../ui/audio-button';
import { useAudio } from '@/hooks/use-audio';
import type { PictureQuestion } from '@/types';

interface PictureQuestionProps {
  question: PictureQuestion;
  selectedAnswerId: string | null;
  onSelectAnswer: (answerId: string, isCorrect: boolean) => void;
}

export function PictureQuestionCard({ question, selectedAnswerId, onSelectAnswer }: PictureQuestionProps) {
  const { isPlaying, play } = useAudio();

  useEffect(() => {
    // Automatically play sound on mount / question change
    play();
  }, [question]);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    onSelectAnswer(optionId, isCorrect);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.instruction}>{question.instruction}</Text>
      
      <View style={styles.audioRow}>
        <AudioButton isPlaying={isPlaying} onPress={play} size="medium" />
        <Text style={styles.wordText}>{question.word}</Text>
      </View>

      <View style={styles.grid}>
        {question.images.map((img) => {
          const isSelected = selectedAnswerId === img.id;
          return (
            <TouchableOpacity
              key={img.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => handleSelect(img.id, img.isCorrect)}
              activeOpacity={0.8}
            >
              {img.imageUrl && (
                <Image source={{ uri: img.imageUrl }} style={styles.image} />
              )}
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const cardPadding = 24 * 2;
const gridGap = 12;
const imageSize = (Math.min(windowWidth, 400) - cardPadding - gridGap) / 2;

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
    marginBottom: Spacing.five,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.six,
    width: '100%',
  },
  wordText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gridGap,
    justifyContent: 'center',
    width: '100%',
  },
  optionCard: {
    width: imageSize,
    height: imageSize,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.creamDark,
    backgroundColor: Colors.cream,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: Colors.checkmark,
    borderWidth: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.checkmark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: Colors.textOnDark,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
