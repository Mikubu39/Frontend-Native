/**
 * PracticeDrawing - Câu tập viết: đề bài + bảng tô nét.
 */

import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import { FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { AlphabetPracticeQuestion } from "@/types/alphabet";
import { parseStrokeOrderData } from "@/utils/stroke-order";
import { StrokeOrderCanvas } from "./stroke-order-canvas";

interface PracticeDrawingProps {
  question: AlphabetPracticeQuestion;
  onComplete: (isCorrect: boolean) => void;
}

const CANVAS_SIZE = Math.min(Dimensions.get("window").width - 80, 300);

export function PracticeDrawing({
  question,
  onComplete,
}: PracticeDrawingProps) {
  const { colors } = useTheme();

  const hasGuide = useMemo(() => {
    return parseStrokeOrderData(question.strokeOrderData).length > 0;
  }, [question.strokeOrderData]);

  return (
    <Animated.View
      entering={FadeInRight.duration(250)}
      style={styles.container}
    >
      <Text style={[styles.prompt, { color: colors.text }]}>
        {question.prompt}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {hasGuide
          ? "Tô theo nét mờ, đúng thứ tự và đúng chiều."
          : "Viết tự do theo chữ mẫu mờ bên dưới."}
      </Text>

      <View style={styles.canvasWrapper}>
        <StrokeOrderCanvas
          key={question.characterId}
          symbol={question.symbol ?? ""}
          strokeOrderData={question.strokeOrderData}
          size={CANVAS_SIZE}
          onComplete={onComplete}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
    width: "100%",
  },
  prompt: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  hint: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  canvasWrapper: {
    width: CANVAS_SIZE,
  },
});
