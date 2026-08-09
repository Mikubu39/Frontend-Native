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
import { Colors, Spacing, FontSizes, FontWeights } from '@/constants/theme';
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
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isShowingRedoIntro, setIsShowingRedoIntro] = useState<boolean>(false);
  const [originalQuestionsLength, setOriginalQuestionsLength] = useState<number>(0);

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
        setOriginalQuestionsLength(mappedQuestions.length);
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
  const progress = originalQuestionsLength > 0 ? Math.min((currentIndex + 1) / originalQuestionsLength, 1) : 0;
  const isLastQuestion = currentIndex >= questions.length - 1;

  const lottieRef = useRef<LottieView>(null);
  const shakeOffset = useSharedValue(0);

  const getCorrectAnswerText = (q: QuizQuestion): string | null => {
    switch (q.type) {
      case 'vocab':
      case 'listening':
        return q.answers.find((a: any) => a.isCorrect)?.text || null;
      case 'picture':
        return q.images.find((a: any) => a.isCorrect)?.text || null;
      case 'kana':
        return q.correctOrder.join('');
      case 'fill-blank':
        return q.correctAnswer;
      case 'kanji-fill':
        return Object.values(q.correctFills).join(', ');
      case 'speaking':
        return q.textToSpeak;
      case 'flashcard':
        return q.backText;
      default:
        return null;
    }
  };

  const checkAnswer = () => {
    setHasSubmitted(true);
    if (currentIsCorrect) {
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

      if (lessonType !== 'JUMP_TEST') {
        setQuestions(prev => [...prev, { ...currentQuestion, isRedo: true } as any]);
      }
    }

    if (!(currentQuestion as any).isRedo) {
      if (currentIsCorrect) {
        setCorrectCount(prev => prev + 1);
      } else {
        setMistakeCount(prev => prev + 1);
      }
    }
  };

  const proceedToNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswerId(null);
    setCurrentIsCorrect(false);
    setHasInteracted(false);
    setHasSubmitted(false);
    setIsShowingRedoIntro(false);
  };

  const moveToNextQuestion = async () => {
    const isFailed = lessonType === 'JUMP_TEST' && heartsRemaining <= 0;

    if (isLastQuestion || isFailed) {
      setIsSubmitting(true);
      try {
        const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
        const response = await lessonAttemptApi.submitLesson(lessonId as string, {
          totalQuestions: originalQuestionsLength,
          totalCorrect: correctCount,
          totalMistakes: mistakeCount,
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
            correctCount: correctCount,
            wrongCount: mistakeCount,
            currentEnergy: response.currentEnergy,
            coinsEarned: response.coinsEarned
          }
        });
      } catch (error) {
        console.error("Failed to submit lesson:", error);
        setIsSubmitting(false);
      }
    } else {
      if (currentIndex === originalQuestionsLength - 1 && questions.length > originalQuestionsLength) {
        setIsShowingRedoIntro(true);
      } else {
        proceedToNext();
      }
    }
  };

  const handleAnswerSelection = (isCorrect: boolean) => {
    setCurrentIsCorrect(isCorrect);
    setHasInteracted(true);
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
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case 'picture':
        return (
          <PictureQuestionCard
            question={currentQuestion as any}
            selectedAnswerId={selectedAnswerId}
            hasSubmitted={hasSubmitted}
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

  if (isShowingRedoIntro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.redoIntroContainer}>
          <LottieView
            source={require('../../../assets/animations/school_mascot.json')}
            style={styles.redoIntroLottie}
            autoPlay={true}
            loop={true}
          />
          <Text style={styles.redoIntroTitle}>Cố lên nào!</Text>
          <Text style={styles.redoIntroText}>Hãy cùng ôn lại các lỗi sai của bạn nhé!</Text>
          <GradientButton 
            title="BẮT ĐẦU ÔN TẬP"
            onPress={proceedToNext}
            style={styles.redoIntroButton}
          />
        </View>
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
            <View pointerEvents={hasSubmitted ? "none" : "auto"}>
              {renderQuestionCard()}
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {hasSubmitted && !currentIsCorrect && (
          <View style={styles.correctAnswerBanner}>
            <Text style={styles.correctAnswerLabel}>Đáp án đúng:</Text>
            <Text style={styles.correctAnswerText}>{getCorrectAnswerText(currentQuestion) || 'Hãy xem lại bài học'}</Text>
          </View>
        )}
        {hasSubmitted && (
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
          title={isSubmitting ? 'ĐANG NỘP BÀI...' : (!hasSubmitted ? 'KIỂM TRA' : (isLastQuestion ? 'HOÀN THÀNH' : 'TIẾP TỤC'))}
          onPress={!hasSubmitted ? checkAnswer : moveToNextQuestion}
          disabled={!hasInteracted || isSubmitting}
          style={styles.nextButton}
          customColors={hasSubmitted ? (currentIsCorrect ? [Colors.success, '#388E3C'] : [Colors.error, '#D32F2F']) : undefined}
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
  redoIntroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
  },
  redoIntroLottie: {
    width: 250,
    height: 250,
    marginBottom: Spacing.six,
  },
  redoIntroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  redoIntroText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.eight,
    lineHeight: 24,
  },
  redoIntroButton: {
    width: '100%',
    maxWidth: 300,
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
  },
  correctAnswerBanner: {
    backgroundColor: '#FFEBEE',
    padding: Spacing.four,
    borderRadius: 12,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  correctAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B71C1C',
  }
});
