/**
 * ListeningQuestion — Impeccable redesign. Theme-aware.
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AudioButton } from "@/components/ui/audio-button";
import type { ListeningQuestion } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";

interface ListeningQuestionProps {
  question: ListeningQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
}

export function ListeningQuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
}: ListeningQuestionProps) {
  const { isPlaying, play } = useAudio(question.audioUrl);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    play();
  }, [question, play]);

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;
  const selectedBg = isDark ? Colors.primary + "33" : Colors.primary + "18";

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.instruction,
          { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary },
        ]}
      >
        {question.instruction}
      </Text>

      {/* Audio player */}
      <View
        style={[
          styles.audioCard,
          {
            backgroundColor: isDark
              ? "rgba(139,92,246,0.12)"
              : Colors.primary + "0F",
            borderColor: isDark
              ? "rgba(139,92,246,0.3)"
              : Colors.primary + "33",
          },
        ]}
      >
        <AudioButton
          variant="speaker"
          size="large"
          isPlaying={isPlaying}
          onPress={() => play()}
        />
        <Text
          style={[
            styles.audioHint,
            { color: isDark ? "rgba(255,255,255,0.35)" : Colors.textSecondary },
          ]}
        >
          {isPlaying ? "Đang phát..." : "Chạm để nghe"}
        </Text>
      </View>

      <View style={styles.answers}>
        {question.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;
          return (
            <AnimatedPressable
              key={answer.id}
              style={[
                styles.answerCard,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? Colors.primary : cardBorder,
                },
              ]}
              onPress={() => onSelectAnswer(answer.id)}
              pressScale={0.97}
            >
              <Text
                style={[
                  styles.answerText,
                  {
                    color: isSelected
                      ? isDark
                        ? Colors.primaryLight
                        : Colors.primaryDark
                      : isDark
                      ? "#F9FAFB"
                      : Colors.textPrimary,
                  },
                ]}
              >
                {answer.text}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.six,
    paddingHorizontal: Spacing.two,
  },
  instruction: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  audioCard: {
    width: "100%",
    paddingVertical: Spacing.seven,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.three,
  },
  audioHint: {
    fontSize: FontSizes.sm,
    fontStyle: "italic",
  },
  answers: {
    width: "100%",
    gap: Spacing.three,
  },
  answerCard: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    alignItems: "center",
  },
  answerText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
  },
});
