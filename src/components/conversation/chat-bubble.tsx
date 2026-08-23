/**
 * Một bong bóng chat trong màn luyện hội thoại.
 *
 * Bong bóng của bot mang một dải màu bên trái mã hoá KẾT CỤC của lượt đó. Đây
 * là chỗ người học đọc ra "mình vừa làm đúng hay chưa" chỉ bằng ngoại vi thị
 * giác, không cần đọc chữ - nên bảng màu được chọn rất cẩn thận
 * (xem `constants/conversation.ts`).
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { OUTCOME_STYLES } from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ChatMessage } from "@/types/conversation";

interface ChatBubbleProps {
  message: ChatMessage;
  /** Ẩn phần dịch tiếng Việt để người học tự dịch trước. */
  hideTranslation?: boolean;
  /** Bỏ trống nếu thiết bị không đọc được tiếng Nhật. */
  onSpeak?: (text: string) => void;
  /** Câu này đang được đọc — nút loa chuyển thành nút dừng. */
  speaking?: boolean;
}

export function ChatBubble({
  message,
  hideTranslation,
  onSpeak,
  speaking,
}: ChatBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.author === "user";
  const outcome = message.outcome ? OUTCOME_STYLES[message.outcome] : null;
  // Chỉ đọc được khi bong bóng thực sự có tiếng Nhật; một số phản hồi hỏng
  // chỉ có lời giải thích tiếng Việt.
  const canSpeak = !!onSpeak && !!message.ja.trim();

  if (isUser) {
    return (
      <Animated.View
        entering={FadeInDown.duration(220)}
        style={styles.userRow}
        accessibilityRole="text"
        accessibilityLabel={`Bạn nói: ${message.ja}`}
      >
        <View style={[styles.userBubble, { backgroundColor: Colors.primary }]}>
          <Text style={styles.userText}>{message.ja}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={styles.botRow}
      accessibilityRole="text"
      accessibilityLabel={`Bạn thoại nói: ${message.ja}. ${message.vi}`}
    >
      <View
        style={[
          styles.botBubble,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftColor: outcome?.accent ?? Colors.primary,
          },
        ]}
      >
        {outcome && outcome.label ? (
          <View style={styles.outcomeRow}>
            <Ionicons
              name={outcome.icon as never}
              size={14}
              color={outcome.accent}
            />
            <Text style={[styles.outcomeLabel, { color: outcome.accent }]}>
              {outcome.label}
            </Text>
          </View>
        ) : null}

        {message.ja ? (
          <View style={styles.japaneseRow}>
            <Text style={[styles.japanese, { color: colors.text }]}>
              {message.ja}
            </Text>
            {canSpeak ? (
              <AnimatedPressable
                onPress={() => onSpeak?.(message.ja)}
                pressScale={0.85}
                accessibilityRole="button"
                accessibilityLabel={
                  speaking ? "Dừng đọc" : `Nghe đọc: ${message.ja}`
                }
                accessibilityState={{ selected: !!speaking }}
                style={[
                  styles.speakButton,
                  {
                    backgroundColor: Colors.primary + (speaking ? "33" : "15"),
                  },
                ]}
              >
                <Ionicons
                  name={speaking ? "stop" : "volume-medium"}
                  size={16}
                  color={Colors.primary}
                />
              </AnimatedPressable>
            ) : null}
          </View>
        ) : null}

        {message.vi && !hideTranslation ? (
          <Text style={[styles.vietnamese, { color: colors.textSecondary }]}>
            {message.vi}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  botRow: {
    alignItems: "flex-start",
    marginBottom: Spacing.three,
  },
  userRow: {
    alignItems: "flex-end",
    marginBottom: Spacing.three,
  },
  botBubble: {
    maxWidth: "88%",
    borderWidth: 1,
    // Dải màu trái dày hơn hẳn để đọc được kết cục từ ngoại vi thị giác.
    borderLeftWidth: 4,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  userBubble: {
    maxWidth: "85%",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  outcomeLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  japaneseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  japanese: {
    flex: 1,
    // Chữ Nhật cần cỡ lớn hơn chữ Latin mới đọc rõ được kanji.
    fontSize: FontSizes.lg,
    lineHeight: 28,
    fontWeight: FontWeights.medium,
  },
  speakButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    // Căn theo dòng chữ đầu tiên thay vì giữa khối, để nút không trôi xuống
    // khi câu tiếng Nhật dài nhiều dòng.
    marginTop: 1,
  },
  vietnamese: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginTop: Spacing.one,
  },
  userText: {
    fontSize: FontSizes.lg,
    lineHeight: 28,
    color: "#FFFFFF",
    fontWeight: FontWeights.medium,
  },
});
