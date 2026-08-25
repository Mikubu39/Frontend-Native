/**
 * Ôn tập từ vựng theo lịch ngắt quãng (SM-2).
 *
 * Khác màn "Luyện tập Lỗi Sai" ở đơn vị: bên đó ôn theo CÂU HỎI từng làm sai,
 * còn ở đây ôn theo TỪ đã tới hạn quên. Một từ gặp ở năm bài khác nhau vẫn chỉ
 * là một mục ở đây, nên người học không thể học vẹt đáp án của riêng một câu.
 *
 * Đề bài được dựng ngay trên máy: mặt chữ Nhật + 4 nghĩa để chọn, trong đó 3
 * nghĩa nhiễu lấy từ kho từ đã cache sẵn. Làm vậy để không phải soạn tay câu hỏi
 * cho từng từ — kho có 675 từ và sẽ còn tăng.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import { QuestionPrompt } from "@/components/quiz/question-prompt";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary } from "@/contexts/glossary-context";
import type { VocabularyItem } from "@/types";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
} from "@/constants/theme";

/** Số nghĩa nhiễu đứng cạnh nghĩa đúng. */
const DISTRACTOR_COUNT = 3;

interface ReviewCard {
  item: VocabularyItem;
  /** Bốn lựa chọn đã xáo, đúng một cái khớp `item.meaningVn`. */
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

/**
 * Dựng lựa chọn cho một từ.
 *
 * Nghĩa nhiễu phải KHÁC hẳn nghĩa đúng, nếu không sẽ có câu hai đáp án cùng
 * đúng ("cảm ơn (thân mật)" vs "cảm ơn (lịch sự)" thì vẫn chấp nhận vì đó là
 * hai từ thật sự khác nhau, nhưng trùng chuỗi y hệt thì không).
 */
function buildCard(item: VocabularyItem, pool: string[]): ReviewCard {
  const distractors = shuffle(
    pool.filter((m) => m && m !== item.meaningVn),
  ).slice(0, DISTRACTOR_COUNT);
  return { item, choices: shuffle([item.meaningVn, ...distractors]) };
}

export default function VocabularyReviewScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { glossary } = useGlossary();

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

  /** Tất cả nghĩa đã biết, dùng làm kho nghĩa nhiễu. */
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
        const pool =
          meaningPool.length > DISTRACTOR_COUNT
            ? meaningPool
            : res.items.map((i) => i.meaningVn);
        setCards(res.items.map((item) => buildCard(item, pool)));
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
    // Chỉ chạy một lần: bộ đề đã dựng xong thì không được xáo lại giữa chừng khi
    // kho từ tải xong muộn, nếu không người học đang làm dở sẽ thấy đề nhảy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = cards[index];

  const handlePick = useCallback(
    (choice: string) => {
      if (picked || !current) return;
      setPicked(choice);
      setResults((prev) => [
        ...prev,
        {
          vocabularyId: current.item.id,
          correct: choice === current.item.meaningVn,
        },
      ]);
    },
    [picked, current],
  );

  const handleNext = useCallback(async () => {
    if (index + 1 < cards.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    setSubmitting(true);
    try {
      await vocabularyApi.submitReview(results);
    } catch {
      // Đã ôn xong rồi mới lỗi mạng: vẫn cho xem kết quả thay vì nuốt mất công
      // sức, chỉ là lịch ôn chưa cập nhật. Lần vào sau các từ này vẫn còn hạn.
      setError("Đã ôn xong nhưng chưa lưu được lên máy chủ.");
    } finally {
      setSubmitting(false);
      setFinished(true);
    }
  }, [index, cards.length, results]);

  const correctCount = results.filter((r) => r.correct).length;

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  // Không có gì để ôn là TIN VUI, không phải lỗi — nói cho đúng giọng.
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

  if (finished) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <Animated.View entering={FadeInUp.duration(320)} style={styles.center}>
          <Ionicons name="sparkles-outline" size={72} color={Colors.accent} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Đúng {correctCount}/{results.length} từ
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            {error ??
              "Những từ trả lời sai sẽ quay lại sớm, từ nhớ tốt sẽ giãn ra xa hơn."}
          </Text>
          <GradientButton title="Xong" onPress={() => router.back()} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          Từ {index + 1}/{cards.length}
        </Text>

        <QuestionPrompt instruction="Từ này nghĩa là gì?" />

        <Animated.View
          key={current.item.id}
          entering={FadeIn.duration(220)}
          style={[
            styles.wordCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          {current.item.romaji ? (
            <Text style={[styles.romaji, { color: colors.textSecondary }]}>
              {current.item.romaji}
            </Text>
          ) : null}
          {/* Không dùng JapaneseText ở đây: tra được nghĩa thì còn gì để ôn. */}
          <Text style={[styles.word, { color: colors.text }]}>
            {current.item.surface}
          </Text>
        </Animated.View>

        <View style={styles.choices}>
          {current.choices.map((choice) => {
            const isPicked = picked === choice;
            const isCorrect = choice === current.item.meaningVn;
            // Chỉ tô màu SAU khi đã chọn, nếu không là lộ đáp án.
            const showState = picked !== null && (isPicked || isCorrect);
            return (
              <AnimatedPressable
                key={choice}
                style={[
                  styles.choice,
                  {
                    backgroundColor: showState
                      ? isCorrect
                        ? Colors.success + "22"
                        : Colors.error + "22"
                      : cardBg,
                    borderColor: showState
                      ? isCorrect
                        ? Colors.success
                        : Colors.error
                      : cardBorder,
                  },
                ]}
                onPress={() => handlePick(choice)}
                pressScale={0.97}
              >
                <Text style={[styles.choiceText, { color: colors.text }]}>
                  {choice}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>

      {picked ? (
        <View style={styles.footer}>
          <GradientButton
            title={index + 1 < cards.length ? "TIẾP TỤC" : "HOÀN THÀNH"}
            onPress={handleNext}
            disabled={submitting}
          />
        </View>
      ) : null}
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
  content: { padding: Spacing.five, gap: Spacing.four },
  counter: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  wordCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.eight,
    alignItems: "center",
    gap: Spacing.two,
  },
  romaji: { fontSize: FontSizes.md, fontWeight: FontWeights.medium },
  word: { fontSize: 44, fontWeight: FontWeights.extrabold },
  choices: { gap: Spacing.three, marginTop: Spacing.four },
  choice: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  choiceText: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  footer: { padding: Spacing.five },
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
});
