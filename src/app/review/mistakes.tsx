/**
 * Mistake Review Screen
 * Follows Mistake Bank API: Loads questions without answers, user answers them all, then we submit and show results.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInUp,
} from "react-native-reanimated";
import { mistakesApi } from "@/services/api/mistakes";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import { QuizQuestion } from "@/types/quiz";
import { MistakeResultItem } from "@/types/api";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { useGamification } from "@/contexts/gamification-context";
import { useToast } from "@/contexts/toast-context";

// Import all question cards
import {
  VocabQuestionCard,
  KanaQuestionCard,
  PictureQuestionCard,
  KanjiFillQuestionCard,
  MatchingQuestionCard,
  FlashcardQuestionCard,
  FillBlankQuestionCard,
  ListeningQuestionCard,
  SpeakingQuestionCard,
} from "@/components/quiz";

export default function MistakeReviewScreen() {
  const router = useRouter();
  const { setEnergy } = useGamification();
  const { showError } = useToast();

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

  // Results phase
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<MistakeResultItem[]>([]);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [energyRewarded, setEnergyRewarded] = useState(0);
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
    } catch (e: any) {
      showError("Lỗi tải bài", "Không thể tải bài tập ôn lỗi sai lúc này.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentIndex] as any;

    // Attempt to extract optionId
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
      setResults(res.results);
      setResolvedCount(res.resolvedCount);
      setEnergyRewarded(res.energyRewarded);
      setEnergy(res.currentEnergy);
      setShowResults(true);
    } catch (e) {
      showError("Lỗi nộp bài", "Có lỗi xảy ra khi nộp bài tập ôn tập.");
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (message || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.messageText}>
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

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết Quả Ôn Tập</Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultList}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Đã xóa nợ (Resolved): {resolvedCount} câu
            </Text>
            {energyRewarded > 0 ? (
              <Text style={styles.energyText}>
                + {energyRewarded} ⚡ Năng lượng
              </Text>
            ) : (
              <Text style={styles.energyTextDesc}>
                Đã hết lượt thưởng năng lượng hôm nay.
              </Text>
            )}
          </View>

          {results.map((res, idx) => (
            <Animated.View
              key={idx}
              entering={FadeInUp.delay(idx * 100)}
              style={styles.resultCard}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.qNum}>Câu {idx + 1}</Text>
                <View
                  style={[
                    styles.badge,
                    res.correct ? styles.badgeCorrect : styles.badgeWrong,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {res.correct ? "ĐÚNG" : "SAI"}
                  </Text>
                </View>
                {res.resolved && (
                  <View style={[styles.badge, styles.badgeResolved]}>
                    <Text style={styles.badgeText}>🎉 ĐÃ XÓA NỢ</Text>
                  </View>
                )}
              </View>
              {/* Optional: We could display question content here if we map it back */}
              {!res.correct && (
                <Text style={styles.correctAnswerInfo}>
                  Đáp án đúng ID: {res.correctOptionId}
                </Text>
              )}
            </Animated.View>
          ))}
        </ScrollView>
        <View style={styles.bottomBar}>
          <GradientButton title="Hoàn Thành" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case "vocab":
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              setHasInteracted(true);
            }}
          />
        );
      case "kana":
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, arrangedString) => {
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case "picture":
        return (
          <PictureQuestionCard
            question={currentQuestion as any}
            selectedAnswerId={selectedAnswerId}
            hasSubmitted={false}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              setHasInteracted(true);
            }}
          />
        );
      case "kanji-fill":
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, fills) => {
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      case "matching":
        return (
          <MatchingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              setHasInteracted(true);
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
              setHasInteracted(true);
            }}
          />
        );
      case "speaking":
        return (
          <SpeakingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              setHasInteracted(true);
            }}
          />
        );
      default:
        return <Text>Unsupported question type</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Câu {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(300).springify()}
          exiting={FadeOutLeft.duration(200)}
          style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}
        >
          {renderQuestionCard()}
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <GradientButton
          title={
            submitting
              ? "ĐANG CHẤM ĐIỂM..."
              : currentIndex === questions.length - 1
                ? "NỘP BÀI"
                : "CÂU TIẾP THEO"
          }
          onPress={handleNext}
          disabled={!hasInteracted || submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  centered: { justifyContent: "center", alignItems: "center", padding: 20 },
  messageText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "bold",
  },
  header: {
    padding: Spacing.four,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  progressText: {
    fontSize: FontSizes.md,
    fontWeight: "bold",
    color: Colors.textSecondary,
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
    backgroundColor: Colors.cream,
  },
  resultList: { padding: Spacing.four },
  summaryBox: {
    backgroundColor: "#FFF",
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.four,
    alignItems: "center",
    ...Shadows.sm,
  },
  summaryText: {
    fontSize: FontSizes.lg,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  energyText: {
    fontSize: FontSizes.md,
    fontWeight: "bold",
    color: "#F59E0B",
    marginTop: Spacing.two,
  },
  energyTextDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.two,
  },
  resultCard: {
    backgroundColor: "#FFF",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  qNum: { fontWeight: "bold", fontSize: FontSizes.md, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeCorrect: { backgroundColor: Colors.success },
  badgeWrong: { backgroundColor: Colors.error },
  badgeResolved: { backgroundColor: "#8B5CF6" },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  correctAnswerInfo: {
    marginTop: Spacing.two,
    fontSize: FontSizes.sm,
    color: Colors.error,
    fontWeight: "bold",
  },
});
