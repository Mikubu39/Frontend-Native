/**
 * Thẻ chọn tình huống luyện tập.
 *
 * Hiển thị rõ MỤC TIÊU của kịch bản chứ không chỉ tên: người học cần biết
 * "làm xong thì được gì" trước khi bước vào, vì khác với một bài quiz, hội
 * thoại không có sẵn cảm giác về độ dài.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import type { ConversationScenario } from "@/types/conversation";

interface ScenarioCardProps {
  scenario: ConversationScenario;
  onPress: (scenario: ConversationScenario) => void;
}

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={() => onPress(scenario)}
      pressScale={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${scenario.title}. ${scenario.description}. Mục tiêu: ${scenario.goal}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: scenario.color,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.emojiBadge,
            { backgroundColor: scenario.color + "1A" },
          ]}
        >
          <Text style={styles.emoji}>{scenario.personaEmoji}</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            {scenario.title}
          </Text>
          <Text style={[styles.titleJa, { color: colors.textSecondary }]}>
            {scenario.titleJa} · {scenario.personaName}
          </Text>
        </View>

        <View style={[styles.levelPill, { backgroundColor: scenario.color }]}>
          <Text style={styles.levelText}>{scenario.level}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {scenario.description}
      </Text>

      <View style={[styles.goalRow, { borderTopColor: colors.borderSubtle }]}>
        <Ionicons name="flag-outline" size={14} color={scenario.color} />
        <Text style={[styles.goalText, { color: colors.text }]}>
          {scenario.goal}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  titleJa: {
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  levelPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  levelText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: "#FFFFFF",
  },
  description: {
    fontSize: FontSizes.sm,
    lineHeight: 19,
    marginTop: Spacing.three,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  goalText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
});
