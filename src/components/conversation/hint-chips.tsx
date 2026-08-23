/**
 * Dải gợi ý câu nói - cơ chế CHỐNG NGÕ CỤT của tính năng.
 *
 * Luôn hiển thị, nhưng ĐỔI MỨC NỔI BẬT theo số lượt hỏng liên tiếp:
 *   0-1 lượt hỏng : chip nhạt, chỉ là gợi ý nếu cần
 *   >=2 lượt hỏng : chip đậm + tiêu đề "Thử câu này", vì lúc này người học
 *                   nhiều khả năng đang thật sự bí chứ không phải đang thử
 *                   nghiệm cho vui
 *
 * Chạm vào một chip sẽ điền thẳng câu đó vào ô nhập (không tự gửi luôn) - để
 * người học còn kịp đọc và sửa, tức là vẫn học được gì đó chứ không chỉ bấm.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { HINTS_BECOME_PROMINENT_AFTER } from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationUtterance } from "@/types/conversation";

interface HintChipsProps {
  hints: ConversationUtterance[];
  failures: number;
  /** Bật khi người học kẹt hẳn - hiện luôn cả bản dịch của câu mẫu. */
  rescue?: boolean;
  onPick: (hint: ConversationUtterance) => void;
}

export function HintChips({ hints, failures, rescue, onPick }: HintChipsProps) {
  const { colors } = useTheme();
  if (!hints.length) return null;

  const prominent = failures >= HINTS_BECOME_PROMINENT_AFTER || !!rescue;

  return (
    <View style={styles.wrapper}>
      {prominent ? (
        <View style={styles.headerRow}>
          <Ionicons name="bulb" size={14} color={Colors.accent} />
          <Text style={[styles.header, { color: colors.textSecondary }]}>
            {rescue ? "Cứ chép câu này nhé" : "Thử câu này xem"}
          </Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {hints.map((hint, index) => (
          <AnimatedPressable
            key={`${hint.ja}-${index}`}
            onPress={() => onPick(hint)}
            pressScale={0.96}
            accessibilityRole="button"
            accessibilityLabel={`Gợi ý: ${hint.ja}. ${hint.vi}`}
            style={[
              styles.chip,
              {
                backgroundColor: prominent
                  ? Colors.accent + "1F"
                  : colors.backgroundElement,
                borderColor: prominent ? Colors.accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipJa, { color: colors.text }]}>
              {hint.ja}
            </Text>
            {prominent ? (
              <Text style={[styles.chipVi, { color: colors.textSecondary }]}>
                {hint.vi}
              </Text>
            ) : null}
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  header: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  chipJa: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  chipVi: {
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
});
