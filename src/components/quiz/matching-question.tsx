import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import type { MatchingQuestion } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { QuestionPrompt } from "@/components/quiz/question-prompt";
import { useTheme } from "@/contexts/theme-context";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function MatchingQuestionCard({
  question,
  onAnswerChange,
}: MatchingQuestionProps) {
  const { colors, isDark } = useTheme();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [leftItems, setLeftItems] = useState<{ id: string; text: string }[]>(
    [],
  );
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>(
    [],
  );

  useEffect(() => {
    const shuffledLeft = [...question.pairs]
      .sort(() => Math.random() - 0.5)
      .map((p) => ({ id: p.id, text: p.left }));
    const shuffledRight = [...question.pairs]
      .sort(() => Math.random() - 0.5)
      .map((p) => ({ id: p.id, text: p.right }));
    setLeftItems(shuffledLeft);
    setRightItems(shuffledRight);
  }, [question]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        const newMatched = [...matchedPairs, selectedLeft];
        setMatchedPairs(newMatched);

        if (newMatched.length === question.pairs.length) {
          onAnswerChange(true);
        }
      } else {
        // Play error haptic but do NOT call onAnswerChange(false) which breaks the quiz flow
      }
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight]);

  return (
    <View style={styles.container}>
      <QuestionPrompt
        instruction={question.instruction}
        isNew={question.isNew}
      />

      <View style={styles.columns}>
        <View style={styles.column}>
          {leftItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedLeft === item.id;
            return (
              <AnimatedPressable
                key={`left-${item.id}`}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.cardQuiz,
                    borderColor: colors.cardQuizBorder,
                  },
                  isSelected && [
                    styles.itemSelected,
                    {
                      backgroundColor: isDark
                        ? Colors.primary + "33"
                        : Colors.accentPale,
                      borderColor: Colors.accent,
                    },
                  ],
                  isMatched && styles.itemMatched,
                ]}
                disabled={isMatched || isSelected}
                onPress={() => setSelectedLeft(item.id)}
                pressScale={0.97}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: colors.text },
                    (isSelected || isMatched) && styles.itemTextSelected,
                  ]}
                >
                  {item.text}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <View style={styles.column}>
          {rightItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedRight === item.id;
            return (
              <AnimatedPressable
                key={`right-${item.id}`}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.cardQuiz,
                    borderColor: colors.cardQuizBorder,
                  },
                  isSelected && [
                    styles.itemSelected,
                    {
                      backgroundColor: isDark
                        ? Colors.primary + "33"
                        : Colors.accentPale,
                      borderColor: Colors.accent,
                    },
                  ],
                  isMatched && styles.itemMatched,
                ]}
                disabled={isMatched || isSelected}
                onPress={() => setSelectedRight(item.id)}
                pressScale={0.97}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: colors.text },
                    (isSelected || isMatched) && styles.itemTextSelected,
                  ]}
                >
                  {item.text}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: Spacing.four,
  },
  column: {
    flex: 1,
    gap: Spacing.three,
  },
  itemCard: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Colors.lockedBg,
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: Colors.accentPale,
    borderColor: Colors.accent,
    borderBottomWidth: 4,
  },
  itemMatched: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
    opacity: 0.6,
  },
  itemText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  itemTextSelected: {
    color: Colors.accent,
  },
});
