/**
 * PracticeMultipleChoice - Câu trắc nghiệm của bài luyện tập bảng chữ cái.
 * Tự phát audio khi câu hỏi có `audioUrl` (dạng "Nghe và chọn chữ cái đúng").
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { AlphabetPracticeQuestion } from "@/types/alphabet";

interface PracticeMultipleChoiceProps {
  question: AlphabetPracticeQuestion;
  selectedOptionId: number | null;
  locked?: boolean;
  onSelect: (optionId: number) => void;
}

export function PracticeMultipleChoice({
  question,
  selectedOptionId,
  locked = false,
  onSelect,
}: PracticeMultipleChoiceProps) {
  const { colors } = useTheme();
  const { isPlaying, play } = useAudio(question.audioUrl ?? undefined);

  useEffect(() => {
    if (question.audioUrl) play(question.audioUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.characterId, question.audioUrl]);

  return (
    <Animated.View
      entering={FadeInRight.duration(250)}
      style={styles.container}
    >
      <Text style={[styles.prompt, { color: colors.text }]}>
        {question.prompt}
      </Text>

      {question.audioUrl ? (
        <AnimatedPressable
          style={styles.audioBubble}
          onPress={() => play(question.audioUrl ?? undefined)}
          pressScale={0.95}
          accessibilityLabel="Nghe lại phát âm"
        >
          <Ionicons
            name={isPlaying ? "volume-high" : "volume-medium"}
            size={44}
            color="#FFFFFF"
          />
        </AnimatedPressable>
      ) : (
        question.symbol && (
          <View
            style={[
              styles.symbolBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.symbol, { color: colors.text }]}>
              {question.symbol}
            </Text>
          </View>
        )
      )}

      <View style={styles.options}>
        {question.options.map((option) => {
          const selected = option.optionId === selectedOptionId;
          return (
            <AnimatedPressable
              key={option.optionId}
              style={[
                styles.option,
                { backgroundColor: colors.card, borderColor: colors.border },
                selected && styles.optionSelected,
              ]}
              onPress={() => onSelect(option.optionId)}
              disabled={locked}
              pressScale={0.96}
              accessibilityLabel={`Đáp án ${option.content}`}
              accessibilityState={{ selected, disabled: locked }}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  selected && styles.optionTextSelected,
                ]}
              >
                {option.content}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.five,
    width: "100%",
  },
  prompt: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  audioBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.glow(Colors.primary),
  },
  symbolBox: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    fontSize: 64,
    fontWeight: FontWeights.extrabold,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.three,
    width: "100%",
  },
  option: {
    width: "46%",
    paddingVertical: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: "center",
    ...Shadows.sm,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
  },
  optionText: {
    fontSize: 32,
    fontWeight: FontWeights.extrabold,
  },
  optionTextSelected: {
    color: Colors.primaryDark,
  },
});
