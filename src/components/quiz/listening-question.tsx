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
import { QuestionPrompt } from "@/components/quiz/question-prompt";
import { GlossaryLockdown } from "@/contexts/glossary-context";

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
  // Đáp án đúng CHÍNH LÀ câu tiếng Nhật đang được hỏi (xem comment ở dưới) —
  // dùng nó làm nội dung đọc TTS khi backend chưa có file audio thật.
  const fallbackSentence = question.answers.find((a) => a.isCorrect)?.text;
  const { isPlaying, play } = useAudio(question.audioUrl, fallbackSentence);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    play();
  }, [question, play]);

  const cardBg = colors.cardQuiz;
  const cardBorder = colors.cardQuizBorder;
  const selectedBg = isDark ? Colors.primary + "33" : Colors.primary + "18";

  return (
    <View style={styles.container}>
      <QuestionPrompt
        instruction={question.instruction}
        isNew={question.isNew}
      />

      {/* Audio player */}
      <View
        style={[
          styles.audioCard,
          {
            backgroundColor: isDark
              ? Colors.primary + "1F"
              : Colors.primary + "0F",
            borderColor: isDark ? Colors.primary + "4D" : Colors.primary + "33",
          },
        ]}
      >
        <AudioButton
          variant="speaker"
          size="medium"
          isPlaying={isPlaying}
          onPress={() => play()}
        />
        <Text style={[styles.audioHint, { color: colors.textSecondary }]}>
          {isPlaying ? "Đang phát..." : "Chạm để nghe"}
        </Text>
      </View>

      {/* Đáp án là chính từ đang được hỏi — tra nghĩa ở đây là lộ bài. */}
      <GlossaryLockdown>
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
                        : colors.text,
                    },
                  ]}
                >
                  {answer.text}
                </Text>
                {/* Câu nghe thì đáp án luôn là chữ Nhật — không có phiên âm bên
                  dưới thì người mới chỉ nhìn thấy 4 hình vẽ lạ như nhau. */}
                {answer.romaji ? (
                  <Text
                    style={[
                      styles.answerRomaji,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {answer.romaji}
                  </Text>
                ) : null}
              </AnimatedPressable>
            );
          })}
        </View>
      </GlossaryLockdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.four,
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
    paddingVertical: Spacing.five,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.two,
  },
  audioHint: {
    fontSize: FontSizes.sm,
    fontStyle: "italic",
  },
  answers: {
    width: "100%",
    gap: Spacing.two,
  },
  answerCard: {
    paddingVertical: Spacing.three,
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
  answerRomaji: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.medium,
    marginTop: Spacing.half,
  },
});
