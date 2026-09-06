/**
 * Placement Test Screen — Bài kiểm tra đầu vào.
 *
 * Dò nhị phân qua các Topic (qua API thật `/api/v1/placement`) để tìm điểm xuất phát
 * phù hợp: mỗi vòng hỏi vài câu rút mẫu từ đúng ngân hàng câu hỏi "Thi vượt" (JUMP_TEST)
 * của 1 Topic đang được đo — không phải bộ câu hỏi tĩnh riêng cho onboarding.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import {
  QuizHeader,
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
import { GradientButton } from "@/components/ui/gradient-button";
import { Spacing, FontSizes, FontWeights, Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { placementApi } from "@/services/api/placement";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import type { QuizQuestion } from "@/types/quiz";
import type { PlacementRoundResponse } from "@/types/api";

type Phase = "loading" | "question" | "result" | "skipped";

export default function PlacementScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [phase, setPhase] = useState<Phase>("loading");
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [probeTopicTitle, setProbeTopicTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<
    { questionId: number; selectedOptionId: number }[]
  >([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSubmittingRound, setIsSubmittingRound] = useState(false);

  const [resultTopicTitle, setResultTopicTitle] = useState<string | null>(null);
  const [expEarned, setExpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const applyRound = (round: PlacementRoundResponse) => {
    setAttemptId(round.attemptId);
    if (round.finished) {
      setResultTopicTitle(round.resultTopicTitle ?? null);
      setExpEarned(round.expEarned ?? 0);
      setCoinsEarned(round.coinsEarned ?? 0);
      setPhase("result");
      return;
    }
    setRoundNumber(round.roundNumber ?? 1);
    setProbeTopicTitle(round.probeTopicTitle ?? "");
    setQuestions(mapApiQuestionsToQuizQuestions(round.questions ?? []));
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedAnswerId(null);
    setHasInteracted(false);
    setPhase("question");
  };

  useEffect(() => {
    (async () => {
      try {
        const round = await placementApi.start();
        applyRound(round);
      } catch (error) {
        // Không đủ điều kiện (đã có tiến trình học) hoặc lỗi mạng — không chặn
        // onboarding, cứ để user vào thẳng màn học như trường hợp "starter".
        console.error("Placement start failed:", error);
        setPhase("skipped");
      }
    })();
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const isLastQuestionOfRound = currentIndex >= questions.length - 1;

  const handleAnswerSelection = () => {
    setHasInteracted(true);
  };

  const goNext = async () => {
    const optionId = Number(selectedAnswerId);
    const nextAnswers =
      selectedAnswerId !== null && Number.isFinite(optionId)
        ? [
            ...answers,
            {
              questionId: Number(currentQuestion.id),
              selectedOptionId: optionId,
            },
          ]
        : answers;
    setAnswers(nextAnswers);

    if (!isLastQuestionOfRound) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setHasInteracted(false);
      return;
    }

    if (attemptId == null) return;
    setIsSubmittingRound(true);
    try {
      const round = await placementApi.answer(attemptId, {
        answers: nextAnswers,
      });
      applyRound(round);
    } catch (error) {
      console.error("Placement answer failed:", error);
      setPhase("skipped");
    } finally {
      setIsSubmittingRound(false);
    }
  };

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case "vocab":
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              handleAnswerSelection();
            }}
          />
        );
      case "kana":
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(_isCorrect, arrangedString) => {
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case "picture":
        return (
          <PictureQuestionCard
            question={currentQuestion as any}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              handleAnswerSelection();
            }}
          />
        );
      case "kanji-fill":
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(_isCorrect, fills) => {
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      case "matching":
        return (
          <MatchingQuestionCard
            question={currentQuestion}
            onAnswerChange={() => handleAnswerSelection()}
          />
        );
      case "flashcard":
        return (
          <FlashcardQuestionCard
            question={currentQuestion}
            onAnswerChange={() => handleAnswerSelection()}
          />
        );
      case "fill-blank":
        return (
          <FillBlankQuestionCard
            question={currentQuestion}
            onAnswerChange={() => handleAnswerSelection()}
          />
        );
      case "listening":
        return (
          <ListeningQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              handleAnswerSelection();
            }}
          />
        );
      case "speaking":
        return (
          <SpeakingQuestionCard
            question={currentQuestion}
            onAnswerChange={() => handleAnswerSelection()}
            onSkipSpeaking={() => handleAnswerSelection()}
          />
        );
      default:
        return null;
    }
  };

  if (phase === "skipped") {
    // Fire-and-forget navigate away; render nothing meaningful in between.
    router.replace("/(tabs)");
    return null;
  }

  if (phase === "loading" || (phase === "question" && !currentQuestion)) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang chuẩn bị câu hỏi…
        </Text>
      </SafeAreaView>
    );
  }

  if (phase === "result") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.resultContent}>
          <LottieView
            source={require("@/assets/animations/happy_mascot.json")}
            autoPlay
            loop
            style={styles.resultLottie}
          />
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            Hoàn thành bài kiểm tra!
          </Text>
          <Text
            style={[styles.resultSubtitle, { color: colors.textSecondary }]}
          >
            {resultTopicTitle
              ? `Bạn được xếp bắt đầu từ chủ đề "${resultTopicTitle}". Các chủ đề trước đó đã được đánh dấu hoàn thành.`
              : "Hãy bắt đầu từ những bài học cơ bản nhất để xây nền tảng thật chắc nhé."}
          </Text>
          {expEarned > 0 && (
            <Text style={[styles.resultReward, { color: Colors.primary }]}>
              +{expEarned} EXP · +{coinsEarned} xu
            </Text>
          )}
        </View>
        <View style={styles.bottomBar}>
          <GradientButton
            testID="placement-finish-btn"
            title="BẮT ĐẦU HỌC"
            onPress={() => router.replace("/(tabs)")}
            style={styles.nextButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <QuizHeader
        progress={progress}
        onClose={() => router.replace("/(tabs)")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Vòng {roundNumber}: {probeTopicTitle}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hãy cùng xác định điểm bắt đầu phù hợp nhất cho bạn.
          </Text>
          {renderQuestionCard()}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <GradientButton
          testID="placement-next-btn"
          title={isSubmittingRound ? "ĐANG XỬ LÝ..." : "TIẾP TỤC"}
          onPress={goNext}
          disabled={!hasInteracted || isSubmittingRound}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: FontSizes.sm,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: "center",
    marginBottom: Spacing.six,
  },
  bottomBar: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
  },
  nextButton: {
    width: "100%",
  },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
  },
  resultLottie: {
    width: 180,
    height: 180,
  },
  resultTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  resultReward: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
});
