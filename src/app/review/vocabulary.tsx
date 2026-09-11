/**
 * Ôn tập từ vựng theo lịch ngắt quãng (SM-2).
 * Đồng bộ với giao diện Bài học.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { GradientButton } from "@/components/ui/gradient-button";
import {
  QuizBottomBar,
  VocabQuestionCard,
  QuizHeader,
} from "@/components/quiz";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary } from "@/contexts/glossary-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import type { VocabularyItem } from "@/types";
import {
  Colors,
  Fonts,
  Spacing,
  FontSizes,
  FontWeights,
} from "@/constants/theme";

const QUESTION_MASCOTS = [
  require("@/assets/animations/character1.json"),
  require("@/assets/animations/character2.json"),
  require("@/assets/animations/character3.json"),
];

const DISTRACTOR_COUNT = 3;

const FALLBACK_DISTRACTORS = [
  "Chào buổi sáng",
  "Xin chào",
  "Tạm biệt",
  "Cảm ơn",
  "Xin lỗi",
  "Nước",
  "Trà",
  "Cơm",
  "Học sinh",
  "Giáo viên",
  "Bác sĩ",
  "Ngày mai",
];

interface ReviewCard {
  item: VocabularyItem;
  choices: string[];
}

function shuffle<T>(input: T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildCard(
  item: VocabularyItem,
  allItems: VocabularyItem[],
  fallbackPool: string[],
): ReviewCard {
  const otherSessionMeanings = shuffle(
    Array.from(
      new Set(
        allItems
          .map((i) => i.meaningVn)
          .filter((m) => m && m !== item.meaningVn),
      ),
    ),
  );

  const neededFromPool = Math.max(
    0,
    DISTRACTOR_COUNT - otherSessionMeanings.length,
  );
  const additionalDistractors = shuffle(
    fallbackPool.filter(
      (m) => m && m !== item.meaningVn && !otherSessionMeanings.includes(m),
    ),
  ).slice(0, neededFromPool);

  const distractors = [
    ...otherSessionMeanings.slice(0, DISTRACTOR_COUNT),
    ...additionalDistractors,
  ].slice(0, DISTRACTOR_COUNT);

  return { item, choices: shuffle([item.meaningVn, ...distractors]) };
}

export default function VocabularyReviewScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { glossary } = useGlossary();
  const { playCorrect, playIncorrect } = useSoundEffect();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [results, setResults] = useState<
    { vocabularyId: number; correct: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingDue, setRemainingDue] = useState(0);

  // Chặn bấm "Tiếp tục" liên tiếp trước khi state kịp cập nhật —
  // tránh index nhảy vượt quá mảng cards và gây crash.
  const advancingRef = useRef(false);

  const meaningPool = useMemo(
    () =>
      Object.values(glossary)
        .map((e) => e?.v)
        .filter((v): v is string => !!v),
    [glossary],
  );

  useEffect(() => {
    let cancelled = false;
    vocabularyApi
      .getDue(20)
      .then((res) => {
        if (cancelled) return;
        const pool = Array.from(
          new Set([
            ...meaningPool,
            ...res.items.map((i) => i.meaningVn),
            ...FALLBACK_DISTRACTORS,
          ]),
        ).filter(Boolean);
        setCards(res.items.map((item) => buildCard(item, res.items, pool)));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(
          "Không tải được danh sách ôn tập. Kiểm tra kết nối rồi thử lại.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = cards[index];

  const handlePick = useCallback(
    (choice: string) => {
      if (picked || !current) return;
      const isCorrect = choice === current.item.meaningVn;
      setPicked(choice);
      if (isCorrect) {
        playCorrect();
      } else {
        playIncorrect();
      }
      setResults((prev) => [
        ...prev,
        {
          vocabularyId: current.item.id,
          correct: isCorrect,
        },
      ]);
    },
    [picked, current, playCorrect, playIncorrect],
  );

  const handleNext = useCallback(async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    if (index + 1 < cards.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    setSubmitting(true);
    try {
      const res = await vocabularyApi.submitReview(results);
      setRemainingDue(res.remainingDue);
    } catch {
      setError("Đã ôn xong nhưng chưa lưu được lên máy chủ.");
    } finally {
      setSubmitting(false);
      setFinished(true);
      advancingRef.current = false;
    }
  }, [index, cards.length, results]);

  useEffect(() => {
    advancingRef.current = false;
  }, [index]);

  useEffect(() => {
    if (finished) {
      const correctCount = results.filter((r) => r.correct).length;
      router.replace({
        pathname: "/quiz/result",
        params: {
          correctCount,
          wrongCount: results.length - correctCount,
          lessonType: "REVIEW_VOCAB",
          status: "COMPLETED",
          remainingCount: remainingDue,
        },
      });
    }
  }, [finished, results, remainingDue, router]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!finished && cards.length === 0) {
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
          Chưa có từ nào tới hạn
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          {error ??
            "Bạn đang nhớ tốt mọi từ đã học. Học bài mới để mở thêm từ nhé!"}
        </Text>
        <GradientButton title="Quay lại" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (finished) return null;
  if (!current) return null;

  const bg = isDark ? Colors.dark.background : Colors.light.background;
  const progress =
    cards.length > 0 ? Math.min((index + 1) / cards.length, 1) : 0;

  const currentMascot = QUESTION_MASCOTS[index % QUESTION_MASCOTS.length];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
      <QuizHeader
        progress={progress}
        onClose={() => router.back()}
        lessonType="REVIEW"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          Từ {index + 1}/{cards.length}
        </Text>
        <Animated.View
          key={current.item.id}
          entering={FadeInUp.duration(300).springify()}
        >
          <VocabQuestionCard
            question={
              {
                id: current.item.id,
                type: "vocab",
                word: current.item.surface,
                surface: current.item.surface,
                romaji: current.item.romaji,
                audioUrl: current.item.audioUrl,
                instruction: "Từ này nghĩa là gì?",
                prompt: current.item.surface,
                promptRomaji: current.item.romaji,
                promptLang: "ja",
                glossary: {},
                answers: current.choices.map((c, i) => ({
                  id: i.toString(),
                  text: c,
                  isCorrect: c === current.item.meaningVn,
                })),
              } as any
            }
            selectedAnswer={
              picked
                ? current.choices.findIndex((c) => c === picked).toString()
                : null
            }
            mascotSource={currentMascot}
            hasSubmitted={picked !== null}
            onSelectAnswer={(id) => {
              if (picked !== null) return;
              handlePick(current.choices[parseInt(id, 10)]);
            }}
          />
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <QuizBottomBar
          hasInteracted={picked !== null}
          hasSubmitted={picked !== null}
          isSubmitting={submitting}
          isCorrect={picked === current.item.meaningVn}
          correctAnswerText={current.item.meaningVn}
          onCheck={() => {}}
          onNext={handleNext}
          finishLabel="HOÀN THÀNH"
          isLastQuestion={index + 1 >= cards.length}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    padding: Spacing.six,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexGrow: 1,
    justifyContent: "center",
  },
  counter: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.five,
    paddingTop: Spacing.three,
  },
  emptyTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
});
