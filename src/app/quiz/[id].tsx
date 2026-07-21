/**
 * Quiz Screen - Handles all 4 question types dynamically.
 * Figma screen 12, 13, 14, 31
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing } from '@/constants/theme';
import {
  QuizHeader,
  VocabQuestionCard,
  KanaQuestionCard,
  PictureQuestionCard,
  KanjiFillQuestionCard,
} from '@/components/quiz';
import { GradientButton } from '@/components/ui/gradient-button';
import { LESSON_QUESTIONS } from '@/data/quiz';
import type { QuizQuestion } from '@/types';

export default function QuizScreen() {
  const router = useRouter();
  const { lessonId = 'lp1' } = useLocalSearchParams<{ lessonId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const questions: QuizQuestion[] = LESSON_QUESTIONS[lessonId as keyof typeof LESSON_QUESTIONS] || LESSON_QUESTIONS.lp5;

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const isLastQuestion = currentIndex >= questions.length - 1;

  const lottieRef = useRef<LottieView>(null);
  const shakeOffset = useSharedValue(0);

  const handleNext = () => {
    if (isLastQuestion) {
      router.replace('/quiz/result');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setCurrentIsCorrect(false);
      setHasInteracted(false);
    }
  };

  const handleAnswerSelection = (isCorrect: boolean) => {
    setCurrentIsCorrect(isCorrect);
    setHasInteracted(true);
    
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      lottieRef.current?.play();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      lottieRef.current?.play();
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }));

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case 'vocab':
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find((a) => a.id === answerId);
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case 'kana':
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, arrangedString) => {
              if (arrangedString.length > 0 && !hasInteracted) {
                 handleAnswerSelection(isCorrect);
              } else if (arrangedString.length === 0) {
                 setHasInteracted(false);
              }
            }}
          />
        );
      case 'picture':
        return (
          <PictureQuestionCard
            question={currentQuestion}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={(answerId, isCorrect) => {
              setSelectedAnswerId(answerId);
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case 'kanji-fill':
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, fills) => {
              setCurrentIsCorrect(isCorrect);
              // Interacted if at least one blank has a value
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      <QuizHeader progress={progress} onClose={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, shakeStyle]}>
          {renderQuestionCard()}
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {hasInteracted && (
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={currentIsCorrect ? require('../../../assets/animations/happy_mascot.json') : require('../../../assets/animations/confuse_mascot.json')}
              style={styles.lottie}
              autoPlay={false}
              loop={false}
            />
          </View>
        )}
        <GradientButton
          title={isLastQuestion ? 'FINISH' : 'NEXT'}
          onPress={handleNext}
          disabled={!hasInteracted}
          style={styles.nextButton}
          colors={hasInteracted ? (currentIsCorrect ? [Colors.success, '#388E3C'] : [Colors.error, '#D32F2F']) : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
    backgroundColor: Colors.cream,
  },
  nextButton: {
    width: '100%',
  },
  lottieContainer: {
    position: 'absolute',
    top: -120,
    left: 20,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  lottie: {
    width: '100%',
    height: '100%',
  }
});
