/**
 * Mistake Review Screen
 * Đồng bộ với giao diện Bài học (Quiz Layout).
 */

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { mistakesApi } from "@/services/api/mistakes";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import { QuizQuestion } from "@/types/quiz";
import {
  Colors,
  Fonts,
  Spacing,
  FontSizes,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { useGamification } from "@/contexts/gamification-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";

import {
  VocabQuestionCard,
  KanaQuestionCard,
  PictureQuestionCard,
  KanjiFillQuestionCard,
  MatchingQuestionCard,
  ListeningQuestionCard,
  SpeakingQuestionCard,
  QuizBottomBar,
  QuizHeader,
  QuestionMascot,
} from "@/components/quiz";

const QUESTION_MASCOTS = [
  require("@/assets/animations/character1.json"),
  require("@/assets/animations/character2.json"),
  require("@/assets/animations/character3.json"),
];

export default function MistakeReviewScreen() {
  const router = useRouter();
  const { setEnergy } = useGamification();
  const { showError } = useToast();
  const { colors, isDark } = useTheme();
  const { playCorrect, playIncorrect } = useSoundEffect();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: number; selectedOptionId: number }[]
  >([]);

  // Current question state
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false);

  // Results phase
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const res = await mistakesApi.startReview();
      if (res.questions && res.questions.length > 0) {
        setQuestions(mapApiQuestionsToQuizQuestions(res.questions));
      } else {
        setMessage(res.message || "Không có lỗi sai nào cần ôn tập.");
      }
    } catch {
      showError("Lỗi tải bài", "Không thể tải bài tập ôn lỗi sai lúc này.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getCorrectAnswerText = (q: QuizQuestion): string | null => {
    switch (q.type) {
      case "vocab":
      case "listening":
        return q.answers.find((a: any) => a.isCorrect)?.text || null;
      case "picture": {
        const correct = q.images.find((a: any) => a.isCorrect);
        return correct?.text || (correct as any)?.metadataJson?.label || null;
      }
      case "kana":
        return q.correctOrder.join("");
      case "fill-blank":
        return q.correctAnswer;
      case "kanji-fill":
        return Object.values(q.correctFills).join(", ");
      case "speaking":
        return q.textToSpeak;
      case "flashcard":
        return q.backText;
      default:
        return null;
    }
  };

  const checkAnswer = () => {
    setHasSubmitted(true);
    if (currentIsCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentIndex] as any;

    let optionId = selectedAnswerId ? Number(selectedAnswerId) : null;
    if (
      !optionId &&
      currentQ.originalOptions &&
      currentQ.originalOptions.length > 0
    ) {
      optionId = Number(currentQ.originalOptions[0].optionId);
    }
    if (!optionId && currentQ.answers && currentQ.answers.length > 0) {
      optionId = Number(currentQ.answers[0].id);
    }

    const newAnswers = [...answers];
    if (optionId) {
      newAnswers.push({
        questionId: Number(currentQ.id),
        selectedOptionId: optionId,
      });
    }
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((curr) => curr + 1);
      setSelectedAnswerId(null);
      setHasInteracted(false);
      setHasSubmitted(false);
      setCurrentIsCorrect(false);
    } else {
      submitReview(newAnswers);
    }
  };

  const submitReview = async (
    finalAnswers: { questionId: number; selectedOptionId: number }[],
  ) => {
    setSubmitting(true);
    try {
      const res = await mistakesApi.submitReview({ answers: finalAnswers });

      const correctCount = res.results.filter((r) => r.correct).length;
      setEnergy(res.currentEnergy);

      router.replace({
        pathname: "/quiz/result",
        params: {
          correctCount,
          wrongCount: res.results.length - correctCount,
          coinsEarned: res.energyRewarded, // Passing energy as coins Earned for UI if we want
          lessonType: "REVIEW_MISTAKES",
          status: "COMPLETED",
        },
      });
    } catch {
      showError("Lỗi nộp bài", "Có lỗi xảy ra khi nộp bài tập ôn tập.");
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSelection = (isCorrect: boolean) => {
    setCurrentIsCorrect(isCorrect);
    setHasInteracted(true);
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (message || questions.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>
          {message || "Không có lỗi sai nào"}
        </Text>
        <GradientButton
          title="Quay Lại"
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        />
      </SafeAreaView>
    );
  }

  if (showResults) return null; // handled by useEffect redirect

  const currentQuestion = questions[currentIndex];
  const bg = isDark ? Colors.dark.background : Colors.light.background;
  const progress =
    questions.length > 0
      ? Math.min((currentIndex + 1) / questions.length, 1)
      : 0;

  const currentMascot =
    QUESTION_MASCOTS[currentIndex % QUESTION_MASCOTS.length];

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case "vocab":
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            mascotSource={currentMascot}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find(
                (a) => a.id === answerId,
              );
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case "kana":
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, arrangedString) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case "picture":
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
      case "kanji-fill":
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, fills) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      case "matching":
        return (
          <MatchingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case "listening":
        return (
          <ListeningQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find(
                (a) => a.id === answerId,
              );
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case "speaking":
        return (
          <SpeakingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
            onSkipSpeaking={() => {
              const futureNonSpeaking = questions
                .slice(currentIndex + 1)
                .filter((q) => q.type !== "speaking");

              if (futureNonSpeaking.length === 0) {
                handleAnswerSelection(true);
              } else {
                setQuestions((prev) => {
                  const past = prev.slice(0, currentIndex);
                  return [...past, ...futureNonSpeaking];
                });
                setSelectedAnswerId(null);
                setHasInteracted(false);
                setHasSubmitted(false);
              }
            }}
          />
        );
      default:
        return <Text>Loại câu hỏi không được hỗ trợ</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <QuizHeader
        progress={progress}
        onClose={() => router.back()}
        lessonType="REVIEW"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(300).springify()}
          exiting={FadeOutLeft.duration(200)}
          style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}
        >
          <View pointerEvents={hasSubmitted ? "none" : "auto"}>
            {currentQuestion.type !== "vocab" && (
              <QuestionMascot seed={currentIndex} />
            )}
            {renderQuestionCard()}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: bg }]}>
        <QuizBottomBar
          hasInteracted={hasInteracted}
          hasSubmitted={hasSubmitted}
          isSubmitting={submitting}
          isCorrect={currentIsCorrect}
          correctAnswerText={getCorrectAnswerText(currentQuestion)}
          onCheck={checkAnswer}
          onNext={handleNext}
          isLastQuestion={currentIndex === questions.length - 1}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center", padding: 20 },
  messageText: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    textAlign: "center",
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  bottomBar: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
  },
});
