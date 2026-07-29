/**
 * Quiz Screen - Handles all 4 question types dynamically.
 * Figma screen 12, 13, 14, 31
 */

import {
  FillBlankQuestionCard,
  FlashcardQuestionCard,
  KanaQuestionCard,
  KanjiFillQuestionCard,
  ListeningQuestionCard,
  MatchingQuestionCard,
  PictureQuestionCard,
  QuizHeader,
  SpeakingQuestionCard,
  VocabQuestionCard,
} from '@/components/quiz';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, Spacing } from '@/constants/theme';
import { useGamification } from '@/contexts/gamification-context';
import { lessonAttemptApi } from '@/services/api/lessons';
import type { QuizQuestion } from '@/types/quiz';
import { mapApiQuestionsToQuizQuestions } from '@/utils/quiz-mapper';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen() {
  const router = useRouter();
  const { lessonId = 'lp1' } = useLocalSearchParams<{ lessonId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const startTime = useRef(Date.now());
  const { deductEnergy } = useGamification();

  const [lessonType, setLessonType] = useState<string>('NORMAL');
  const [isReplay, setIsReplay] = useState<boolean>(false);
  const [heartsRemaining, setHeartsRemaining] = useState<number>(3);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await lessonAttemptApi.startLesson(lessonId as string);
        const mappedQuestions = mapApiQuestionsToQuizQuestions(response.questions);
        setQuestions(mappedQuestions);
        setLessonType(response.lessonType);
        setIsReplay(response.isReplay);

        if (response.totalEnergyDeducted > 0) {
          deductEnergy(response.totalEnergyDeducted);
        }

        startTime.current = Date.now();
      } catch (error) {
        console.error("Failed to start lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [lessonId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const isLastQuestion = currentIndex >= questions.length - 1;

  const lottieRef = useRef<LottieView>(null);
  const shakeOffset = useSharedValue(0);

  const handleNext = async () => {
    const finalCorrectCount = correctCount + (currentIsCorrect ? 1 : 0);
    const finalMistakeCount = mistakeCount + (!currentIsCorrect ? 1 : 0);
    const isFailed = lessonType === 'JUMP_TEST' && heartsRemaining <= 0;

    if (isLastQuestion || isFailed) {
      setIsSubmitting(true);
      try {
        const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
        const response = await lessonAttemptApi.submitLesson(lessonId as string, {
          totalQuestions: questions.length,
          totalCorrect: finalCorrectCount,
          totalMistakes: finalMistakeCount,
          timeTakenSeconds: timeTaken,
          heartsRemaining: heartsRemaining,
          isReplay: isReplay
        });

        router.replace({
          pathname: '/quiz/result',
          params: {
            status: response.status,
            expEarned: response.expEarned,
            starsEarned: response.starsEarned,
            correctCount: finalCorrectCount,
            wrongCount: finalMistakeCount,
            currentEnergy: response.currentEnergy
          }
        });
      } catch (error) {
        console.error("Failed to submit lesson:", error);
        setIsSubmitting(false);
      }
    } else {
      setCorrectCount(finalCorrectCount);
      setMistakeCount(finalMistakeCount);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      lottieRef.current?.play();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
      lottieRef.current?.play();
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      if (lessonType === 'JUMP_TEST') {
        setHeartsRemaining(prev => Math.max(0, prev - 1));
      }
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
      case 'matching':
        return (
          <MatchingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case 'flashcard':
        return (
          <FlashcardQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case 'listening':
        return (
          <ListeningQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find((a) => a.id === answerId);
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case 'speaking':
        return (
          <SpeakingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: Colors.textSecondary }}>Không tìm thấy câu hỏi nào.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <QuizHeader
        progress={progress}
        onClose={() => router.back()}
        lessonType={lessonType}
        heartsRemaining={heartsRemaining}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, shakeStyle]}>
          <Animated.View
            key={currentIndex}
            entering={FadeInRight.duration(300).springify()}
            exiting={FadeOutLeft.duration(200)}
            style={{ width: '100%' }}
          >
            {renderQuestionCard()}
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {hasInteracted && (
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={currentIsCorrect ? require('../../../assets/animations/happy_mascot.json') : require('../../../assets/animations/confuse_mascot.json')}
              style={styles.lottie}
              autoPlay={true}
              loop={false}
            />
          </View>
        )}
        <GradientButton
          title={isSubmitting ? 'ĐANG NỘP BÀI...' : (isLastQuestion ? 'HOÀN THÀNH' : 'TIẾP TỤC')}
          onPress={handleNext}
          disabled={!hasInteracted || isSubmitting}
          style={styles.nextButton}
          customColors={hasInteracted ? (currentIsCorrect ? [Colors.success, '#388E3C'] : [Colors.error, '#D32F2F']) : undefined}
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
