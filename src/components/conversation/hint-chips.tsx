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

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationUtterance } from "@/types/conversation";

interface HintChipsProps {
  hints: ConversationUtterance[];
  /** Làm nổi bật viền/nền khi người học cần được đẩy đi tiếp. */
  prominent?: boolean;
  /** Bật/tắt hiển thị bản dịch tiếng Việt theo cấu hình người học. */
  showTranslation?: boolean;
  onPick: (hint: ConversationUtterance) => void;
}

export function HintChips({
  hints,
  prominent,
  showTranslation = true,
  onPick,
}: HintChipsProps) {
  const { colors } = useTheme();
  const [peekedIndices, setPeekedIndices] = useState<Record<number, boolean>>(
    {},
  );

  // Reset trạng thái xem tạm khi danh sách gợi ý thay đổi lượt mới
  useEffect(() => {
    setPeekedIndices({});
  }, [hints]);

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
        {hints.map((hint, index) => {
          const isViVisible = showTranslation || !!peekedIndices[index];

          return (
            <AnimatedPressable
              key={`${hint.ja}-${index}`}
              onPress={() => onPick(hint)}
              onLongPress={() => {
                if (!showTranslation && hint.vi) {
                  setPeekedIndices((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }));
                }
              }}
              pressScale={0.96}
              accessibilityRole="button"
              accessibilityLabel={`Gợi ý: ${hint.ja}${hint.vi ? `. ${hint.vi}` : ""}`}
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
              {isViVisible && hint.vi ? (
                <Text style={[styles.chipVi, { color: colors.textSecondary }]}>
                  {hint.vi}
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  header: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    justifyContent: "center",
    alignItems: "center",
  },
  chipJa: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  chipVi: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
