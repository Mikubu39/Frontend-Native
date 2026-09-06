/**
 * Thẻ chọn chủ đề luyện tập.
 *
 * Hiển thị rõ MỤC TIÊU của chủ đề chứ không chỉ tên: người học cần biết "làm
 * xong thì được gì" trước khi bước vào. Phiên có giới hạn 5 phút nên mục tiêu
 * còn đóng vai trò thứ hai - nó cho biết trong 5 phút đó cần đi tới đâu.
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
import type { ConversationTopic } from "@/types/conversation";

interface TopicCardProps {
  topic: ConversationTopic;
  onPress: (topic: ConversationTopic) => void;
}

export function TopicCard({ topic, onPress }: TopicCardProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={() => onPress(topic)}
      pressScale={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}. ${topic.description}. Mục tiêu: ${topic.goal}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: topic.color,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[styles.emojiBadge, { backgroundColor: topic.color + "1A" }]}
        >
          <Text style={styles.emoji}>{topic.personaEmoji}</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            {topic.title}
          </Text>
          <Text style={[styles.titleJa, { color: colors.textSecondary }]}>
            {topic.titleJa} · {topic.personaName}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {topic.description}
      </Text>

      <View style={[styles.goalRow, { borderTopColor: colors.borderSubtle }]}>
        <Ionicons name="flag-outline" size={14} color={topic.color} />
        <Text style={[styles.goalText, { color: colors.text }]}>
          {topic.goal}
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
