/**
 * Alphabet Practice Screen
 *
 * Nhận trọn bộ đề từ `POST /api/v1/alphabets/practice/start`, chạy vòng lặp
 * trên RAM (làm sai -> đẩy câu xuống cuối), rồi nộp kết quả LẦN ĐẦU của từng
 * chữ qua `POST /api/v1/alphabets/practice/submit`.
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  PracticeDrawing,
  PracticeMultipleChoice,
  PracticeResultCard,
} from "@/components/alphabet";
import { useAlphabetPractice } from "@/hooks/use-alphabet-practice";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";

export default function AlphabetPracticeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addExp } = useGamification();
  const { status, current, progress, result, error, answer, restart } =
    useAlphabetPractice();

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // Câu mới -> reset trạng thái trả lời.
  useEffect(() => {
    setSelectedOptionId(null);
    setLastCorrect(null);
  }, [current?.key]);

  useEffect(() => {
    if (status === "finished" && result?.expEarned) {
      addExp(result.expEarned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result?.expEarned]);

  const question = current?.question ?? null;
  const isDrawing = question?.questionType === "DRAWING";
  const progressValue =
    progress.total > 0 ? progress.completed / progress.total : 0;

  const handleCheck = () => {
    if (!question || selectedOptionId === null) return;
    const option = question.options.find(
      (item) => item.optionId === selectedOptionId,
    );
    setLastCorrect(!!option?.isCorrect);
  };

  const handleContinue = () => {
    if (lastCorrect === null) return;
    answer(lastCorrect);
  };

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/characters");
  };

  if (status === "loading" || status === "submitting") {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          {status === "loading" ? "Đang bốc đề..." : "Đang nộp bài..."}
        </Text>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <Ionicons name="cloud-offline" size={44} color={Colors.locked} />
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          {error ?? "Có lỗi xảy ra."}
        </Text>
        <GradientButton title="Thử lại" onPress={restart} />
        <GradientButton title="Quay lại" variant="outline" onPress={exit} />
      </SafeAreaView>
    );
  }

  if (status === "empty") {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <Ionicons
          name="checkmark-done-circle"
          size={56}
          color={Colors.success}
        />
        <Text style={[styles.stateTitle, { color: colors.text }]}>
          Không có chữ nào cần ôn lúc này
        </Text>
        <Text style={[styles.stateText, { color: colors.textSecondary }]}>
          Hãy quay lại sau nhé!
        </Text>
        <GradientButton title="Về bảng chữ cái" onPress={exit} />
      </SafeAreaView>
    );
  }

  if (status === "finished" && result) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <PracticeResultCard
          result={result}
          onFinish={exit}
          onPracticeAgain={restart}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <AnimatedPressable
          onPress={exit}
          pressScale={0.9}
          accessibilityLabel="Thoát bài luyện tập"
        >
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </AnimatedPressable>
        <View style={styles.progressWrapper}>
          <ProgressBar progress={progressValue} color={Colors.accent} />
        </View>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {progress.completed}/{progress.total}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {question && !isDrawing && (
          <PracticeMultipleChoice
            question={question}
            selectedOptionId={selectedOptionId}
            locked={lastCorrect !== null}
            onSelect={setSelectedOptionId}
          />
        )}

        {question && isDrawing && (
          <PracticeDrawing
            question={question}
            onComplete={(isCorrect) => setLastCorrect(isCorrect)}
          />
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.card, borderTopColor: colors.borderSubtle },
        ]}
      >
        {lastCorrect !== null && (
          <Animated.View
            entering={FadeInUp.duration(220)}
            style={[
              styles.feedback,
              lastCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Ionicons
              name={lastCorrect ? "checkmark-circle" : "close-circle"}
              size={20}
              color={lastCorrect ? Colors.success : Colors.error}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: lastCorrect ? Colors.success : Colors.error },
              ]}
            >
              {lastCorrect
                ? "Chính xác!"
                : "Chưa đúng — chữ này sẽ quay lại ở cuối bài."}
            </Text>
          </Animated.View>
        )}

        {lastCorrect === null ? (
          isDrawing ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Hoàn thành đủ các nét để tiếp tục.
            </Text>
          ) : (
            <GradientButton
              title="Kiểm tra"
              onPress={handleCheck}
              disabled={selectedOptionId === null}
            />
          )
        ) : (
          <GradientButton title="Tiếp tục" onPress={handleContinue} />
        )}
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
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    padding: Spacing.six,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  progressWrapper: {
    flex: 1,
  },
  counter: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    minWidth: 40,
    textAlign: "right",
  },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.eight,
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    borderTopWidth: 1,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  feedbackCorrect: {
    backgroundColor: "rgba(76, 175, 80, 0.14)",
  },
  feedbackWrong: {
    backgroundColor: Colors.errorLight,
  },
  feedbackText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  stateTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  stateText: {
    fontSize: FontSizes.sm,
    textAlign: "center",
  },
  hint: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
});
