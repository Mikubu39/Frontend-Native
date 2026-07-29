import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import type { FlashcardQuestion } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { AudioButton } from '@/components/ui/audio-button';

interface FlashcardQuestionProps {
  question: FlashcardQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function FlashcardQuestionCard({ question, onAnswerChange }: FlashcardQuestionProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useSharedValue(0);

  const handleFlip = () => {
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    flipAnim.value = withSpring(nextFlipped ? 180 : 0, { damping: 15, stiffness: 100 });
    
    // We mark it as 'correct/done' when user has flipped it to see the back.
    if (nextFlipped) {
      onAnswerChange(true);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnim.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: flipAnim.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnim.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: flipAnim.value >= 90 ? 1 : 0,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{question.instruction}</Text>

      <TouchableOpacity activeOpacity={0.9} onPress={handleFlip} style={styles.cardContainer}>
        {/* Front */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <Text style={styles.frontText}>{question.frontText}</Text>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.backText}>{question.backText}</Text>
          {question.audioUrl && (
            <View style={styles.audioWrapper}>
              <AudioButton variant="speaker" size="small" onPress={() => {}} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      <Text style={styles.hint}>Chạm để lật thẻ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cardContainer: {
    width: 280,
    height: 380,
    position: 'relative',
    transform: [{perspective: 1000}],
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  cardFront: {
    backgroundColor: Colors.surface,
  },
  cardBack: {
    backgroundColor: Colors.accentPale,
  },
  frontText: {
    fontSize: 48,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  backText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  audioWrapper: {
    marginTop: Spacing.six,
  }
});
