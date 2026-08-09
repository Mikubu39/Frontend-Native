/**
 * PictureQuestionCard - Choose the correct picture based on word/audio.
 * Figma screen 14
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { AudioButton } from '../ui/audio-button';
import { useAudio } from '@/hooks/use-audio';
import type { PictureQuestion } from '@/types';

import { DualText } from '@/components/ui/dual-text';

interface PictureQuestionProps {
  question: PictureQuestion;
  selectedAnswerId: string | null;
  hasSubmitted?: boolean;
  onSelectAnswer: (answerId: string, isCorrect: boolean) => void;
}

export function PictureQuestionCard({ question, selectedAnswerId, hasSubmitted, onSelectAnswer }: PictureQuestionProps) {
  const { isPlaying, play } = useAudio(question.audioUrl);

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
        <DualText text={question.word} mainStyle={styles.wordText} align="flex-start" containerStyle={{ flexShrink: 1 }} />
      </View>

      <View style={styles.grid}>
        {question.images.map((img) => {
          const isSelected = selectedAnswerId === img.id;
          const isCorrectAnswer = img.isCorrect;

          let cardStyle: any[] = [styles.optionCard];
          let showCheck = false;
          let checkStyle: any = styles.checkBadge;
          let iconText = '✓';

          if (hasSubmitted) {
            if (isCorrectAnswer) {
              cardStyle.push(styles.optionCardCorrect);
              showCheck = true;
              checkStyle = styles.checkBadgeCorrect;
              iconText = '✓';
            } else if (isSelected) {
              cardStyle.push(styles.optionCardWrong);
              showCheck = true;
              checkStyle = styles.checkBadgeWrong;
              iconText = '✕';
            }
          } else {
            if (isSelected) {
              cardStyle.push(styles.optionCardSelected);
              showCheck = true;
              checkStyle = styles.checkBadge;
              iconText = '✓';
            }
          }

          return (
            <AnimatedPressable
              key={img.id}
              style={cardStyle}
              onPress={() => handleSelect(img.id, img.isCorrect)}
              pressScale={0.95}
            >
              {img.imageUrl && (
                <Image source={{ uri: img.imageUrl }} style={styles.image} />
              )}
              {showCheck && (
                <Animated.View entering={ZoomIn.duration(200).springify()} style={checkStyle}>
                  <Text style={styles.checkText}>{iconText}</Text>
                </Animated.View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
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
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
    width: '100%',
  },
  wordText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.three,
    width: '100%',
  },
  optionCard: {
    width: '47%',
    height: 110,
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
    resizeMode: 'contain',
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeCorrect: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeWrong: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCardCorrect: {
    borderColor: Colors.success,
    borderWidth: 3,
    backgroundColor: '#E8F5E9',
  },
  optionCardWrong: {
    borderColor: Colors.error,
    borderWidth: 3,
    backgroundColor: '#FFEBEE',
  },
  checkText: {
    color: Colors.textOnDark,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});

