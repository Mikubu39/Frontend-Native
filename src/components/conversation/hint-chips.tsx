/**
 * Dải gợi ý câu nói - cơ chế CHỐNG NGÕ CỤT của tính năng.
 *
 * Gợi ý do chính LLM sinh ra ở mỗi lượt, nên chúng luôn là câu đáp hợp lý cho
 * đúng câu AI vừa nói. Kiến trúc FSM cũ phải đếm số lượt hỏng liên tiếp rồi
 * mới "cứu" bằng câu mẫu soạn sẵn; giờ thì không cần nữa - gợi ý lúc nào cũng
 * tươi mới và lúc nào cũng có.
 *
 * Vì đồng hồ chỉ chạy 5 phút, gợi ý còn giữ một vai trò thứ hai: nó cắt thời
 * gian người học ngồi nhìn màn hình nghĩ xem phải nói gì.
 *
 * Chạm vào một chip sẽ điền thẳng câu đó vào ô nhập (không tự gửi luôn) - để
 * người học còn kịp đọc và sửa, tức là vẫn học được gì đó chứ không chỉ bấm.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
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
  /** Làm nổi bật + hiện luôn bản dịch, dùng khi người học cần được đẩy đi tiếp. */
  prominent?: boolean;
  onPick: (hint: ConversationUtterance) => void;
}

export function HintChips({ hints, prominent, onPick }: HintChipsProps) {
  const { colors } = useTheme();
  if (!hints.length) return null;

  return (
    <View style={styles.wrapper}>
      {prominent ? (
        <View style={styles.headerRow}>
          <Ionicons name="bulb" size={14} color={Colors.accent} />
          <Text style={[styles.header, { color: colors.textSecondary }]}>
            Thử câu này xem
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
