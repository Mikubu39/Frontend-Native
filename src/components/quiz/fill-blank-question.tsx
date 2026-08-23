/**
 * FillBlankQuestion — Impeccable redesign. Theme-aware.
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { FillBlankQuestion } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { JapaneseText } from "../ui/japanese-text";
import { useTheme } from "@/contexts/theme-context";

interface FillBlankQuestionProps {
  question: FillBlankQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function FillBlankQuestionCard({
  question,
  onAnswerChange,
}: FillBlankQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { colors, isDark } = useTheme();

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onAnswerChange(option === question.correctAnswer);
  };

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;
  const selectedBg = isDark ? Colors.primary + "33" : Colors.primary + "18";

  const renderSentence = () => {
    const parts = question.sentence.split("___");
    return (
      <View style={styles.sentenceContainer}>
        <JapaneseText
          text={parts[0]}
          style={[
            styles.sentenceText,
            { color: isDark ? "#F9FAFB" : Colors.textPrimary },
          ]}
        />
        <View
          style={[
            styles.blank,
            {
              borderBottomColor: selectedOption
                ? Colors.primary
                : isDark
                  ? "rgba(255,255,255,0.3)"
                  : Colors.textSecondary,
              backgroundColor: selectedOption
                ? isDark
                  ? Colors.primary + "22"
                  : Colors.primary + "0F"
                : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.blankText,
              {
                color: selectedOption
                  ? isDark
                    ? Colors.primaryLight
                    : Colors.primaryDark
                  : "transparent",
              },
            ]}
          >
            {selectedOption || "　　　"}
          </Text>
        </View>
        <JapaneseText
          text={parts[1]}
          style={[
            styles.sentenceText,
            { color: isDark ? "#F9FAFB" : Colors.textPrimary },
          ]}
        />
      </View>
    );
  };

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

      {renderSentence()}

      <View style={styles.optionsGrid}>
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? Colors.primary : cardBorder,
                },
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.optionText,
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
                {option}
              </Text>
            </TouchableOpacity>
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
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sentenceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  sentenceText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  blank: {
    minWidth: 64,
    borderBottomWidth: 3,
    paddingBottom: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  blankText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.three,
    width: "100%",
  },
  optionCard: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    minWidth: 100,
    alignItems: "center",
  },
  optionText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
});
