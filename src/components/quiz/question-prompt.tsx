/**
 * QuestionPrompt — phần đầu của MỌI câu hỏi: nhãn "TỪ VỰNG MỚI" + yêu cầu.
 *
 * Tách riêng vì trước đây cả 9 component câu hỏi đều tự vẽ `question.instruction`
 * theo kiểu của mình, và đều đặt nó BÊN DƯỚI bong bóng thoại bằng chữ xám nhỏ.
 * Người học đọc bong bóng trước, không hiểu phải làm gì với nó, rồi mới thấy
 * dòng chữ mờ ở dưới. Đảo lại đúng thứ tự đọc — yêu cầu trước, đề bài sau —
 * là khác biệt lớn nhất về mặt trải nghiệm so với bản cũ.
 *
 * Không nhận `prompt`: nội dung đề bài do từng loại câu hỏi tự vẽ theo cách
 * riêng (bong bóng, thẻ rời, ảnh...). Ở đây chỉ lo phần chung.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";

interface QuestionPromptProps {
  /** Yêu cầu của câu hỏi — "Từ này nghĩa là gì?". */
  instruction: string;
  /** Từ chưa từng học → hiện nhãn "TỪ VỰNG MỚI" phía trên yêu cầu. */
  isNew?: boolean;
}

export function QuestionPrompt({ instruction, isNew }: QuestionPromptProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      {isNew ? (
        <Animated.View
          entering={FadeIn.duration(250)}
          style={[
            styles.newPill,
            {
              backgroundColor: Colors.primary + "22",
              borderColor: Colors.primary + "55",
            },
          ]}
        >
          <View style={styles.newDot} />
          <Text style={[styles.newText, { color: Colors.primaryLight }]}>
            TỪ VỰNG MỚI
          </Text>
        </Animated.View>
      ) : null}

      <Text
        accessibilityRole="header"
        style={[
          styles.instruction,
          { color: isDark ? "#F9FAFB" : Colors.textPrimary },
        ]}
      >
        {instruction}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  newPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  newText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  // Yêu cầu là thứ đọc đầu tiên nên phải to và đậm, không phải chú thích mờ.
  instruction: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    lineHeight: 32,
  },
});
