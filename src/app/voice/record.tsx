/**
 * Pronunciation Practice Screen
 * Đồng bộ với giao diện Bài học (Quiz Layout).
 */

import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModalCard } from "@/components/ui/modal-card";
import { useTheme } from "@/contexts/theme-context";
import { pronunciationApi } from "@/services/api/pronunciation";
import { useSoundEffect } from "@/hooks/use-sound-effect";

import {
  QuizBottomBar,
  QuizHeader,
  SpeakingQuestionCard,
} from "@/components/quiz";

const MOCK_QUEUE = [
  {
    id: 1000,
    surface: "おはようございます",
    romaji: "Ohayou gozaimasu",
    meaningVn: "Chào buổi sáng",
  },
  {
    id: 1001,
    surface: "ありがとうございます",
    romaji: "Arigatou gozaimasu",
    meaningVn: "Cảm ơn",
  },
  {
    id: 1002,
    surface: "すみません",
    romaji: "Sumimasen",
    meaningVn: "Xin lỗi",
  },
];

export default function RecordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { playCorrect, playIncorrect } = useSoundEffect();

  const [queue, setQueue] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<
    { vocabularyId: number; correct: boolean }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Current question state
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pronunciationApi
      .getDue(20)
      .then((res) => {
        if (cancelled) return;
        if (res.items.length > 0) {
          setQueue(res.items);
        } else {
          setQueue(MOCK_QUEUE);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setQueue(MOCK_QUEUE);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNext = async () => {
    const phrase = queue[index];
    if (!phrase) return;

    const newResults = [
      ...results,
      { vocabularyId: phrase.id, correct: currentIsCorrect },
    ];
    setResults(newResults);

    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setHasInteracted(false);
      setHasSubmitted(false);
      setCurrentIsCorrect(false);
    } else {
      setSubmitting(true);
      try {
        await pronunciationApi.submitReview(newResults);
      } catch (e) {
        setApiError("Đã luyện xong nhưng chưa lưu được lên máy chủ.");
      } finally {
        setSubmitting(false);
        setFinished(true);
      }
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

  useEffect(() => {
    if (finished) {
      const correctCount = results.filter((r) => r.correct).length;
      router.replace({
        pathname: "/quiz/result",
        params: {
          correctCount,
          wrongCount: results.length - correctCount,
          lessonType: "REVIEW_VOICE",
          status: "COMPLETED",
        },
      });
    }
  }, [finished, results, router]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!finished && queue.length === 0) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={72}
          color={Colors.success}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Chưa có câu nào tới hạn
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          {apiError ?? "Bạn đang phát âm chuẩn xác mọi câu!"}
        </Text>
        <GradientButton title="Quay lại" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (finished) return null;

  const phrase = queue[index];
  if (!phrase) return null;

  const bg = isDark ? Colors.dark.background : Colors.light.background;
  const progress =
    queue.length > 0 ? Math.min((index + 1) / queue.length, 1) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <QuizHeader
        progress={progress}
        onClose={() => router.back()}
        lessonType="REVIEW"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          key={index}
          entering={FadeInRight.duration(300).springify()}
          exiting={FadeOutLeft.duration(200)}
          style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}
        >
          <View pointerEvents={hasSubmitted ? "none" : "auto"}>
            <SpeakingQuestionCard
              question={
                {
                  id: phrase.id,
                  type: "speaking",
                  textToSpeak: phrase.surface,
                  translation: phrase.meaningVn,
                  romaji: phrase.romaji,
                  audioUrl: phrase.audioUrl,
                  instruction: "Phát âm câu sau",
                  glossary: {},
                } as any
              }
              onAnswerChange={(isCorrect) => {
                setCurrentIsCorrect(isCorrect);
                setHasInteracted(true);
              }}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: bg }]}>
        <QuizBottomBar
          hasInteracted={hasInteracted}
          hasSubmitted={hasSubmitted}
          isSubmitting={submitting}
          isCorrect={currentIsCorrect}
          correctAnswerText={phrase.surface}
          onCheck={checkAnswer}
          onNext={handleNext}
          isLastQuestion={index + 1 >= queue.length}
          onSkipSpeaking={() => setShowSkipModal(true)}
        />
      </View>

      {showSkipModal && (
        <ModalCard onClose={() => setShowSkipModal(false)}>
          <View style={styles.skipModalContent}>
            <Ionicons name="mic-off-circle" size={54} color={Colors.warning} />
            <Text style={[styles.skipModalTitle, { color: colors.text }]}>
              Bạn không thể nói lúc này?
            </Text>
            <Text
              style={[
                styles.skipModalSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Bạn có thể tạm dừng để quay lại luyện phát âm sau, hoặc bỏ qua câu
              này để tiếp tục câu kế tiếp.
            </Text>

            <View style={styles.skipModalBtnGroup}>
              <GradientButton
                title="BỎ QUA CÂU NÀY"
                onPress={() => {
                  setShowSkipModal(false);
                  handleNext();
                }}
                style={{ width: "100%" }}
              />
              <GradientButton
                title="THOÁT VỀ ÔN TẬP"
                variant="outline"
                onPress={() => {
                  setShowSkipModal(false);
                  router.back();
                }}
                style={{ width: "100%" }}
              />
              <GradientButton
                title="Ở LẠI"
                variant="ghost"
                onPress={() => setShowSkipModal(false)}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        </ModalCard>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    padding: Spacing.six,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
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
  skipModalContent: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  skipModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  skipModalSubtitle: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.two,
  },
  skipModalBtnGroup: {
    width: "100%",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
