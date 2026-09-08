/**
 * Một bong bóng chat trong màn luyện hội thoại.
 *
 * Hỗ trợ hiển thị câu tiếng Nhật kèm bản dịch tiếng Việt cho CẢ bot VÀ người học.
 * Khi bật chế độ ẩn tiếng Việt, người học có thể chạm hoặc giữ bong bóng để
 * lật mở bản dịch.
 */

import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
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
import type { ChatMessage } from "@/types/conversation";

interface ChatBubbleProps {
  message: ChatMessage;
  /** Ẩn phần dịch tiếng Việt để người học tự luyện đọc/dịch trước. */
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
  const [revealed, setRevealed] = useState(false);

  const isUser = message.author === "user";
  const canSpeak = !!onSpeak && !!message.ja.trim();
  const shouldShowTranslation = !hideTranslation || revealed;

  const toggleReveal = () => {
    if (hideTranslation) {
      setRevealed((v) => !v);
    }
  };

  if (isUser) {
    return (
      <Animated.View
        entering={FadeInDown.duration(220)}
        style={styles.userRow}
        accessibilityRole="text"
        accessibilityLabel={`Bạn nói: ${message.ja}${message.vi ? `. Dịch: ${message.vi}` : ""}`}
      >
        <AnimatedPressable
          onPress={toggleReveal}
          onLongPress={toggleReveal}
          pressScale={0.98}
          style={[styles.userBubble, { backgroundColor: Colors.primary }]}
        >
          <Text style={styles.userText}>{message.ja}</Text>

          {message.vi && shouldShowTranslation ? (
            <Text style={styles.userVietnamese}>{message.vi}</Text>
          ) : hideTranslation && message.vi ? (
            <Text style={styles.tapToRevealLight}>Chạm để xem nghĩa</Text>
          ) : null}
        </AnimatedPressable>
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
      <AnimatedPressable
        onPress={toggleReveal}
        onLongPress={toggleReveal}
        pressScale={0.98}
        style={[
          styles.botBubble,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftColor: Colors.primary,
          },
        ]}
      >
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

        {message.vi && shouldShowTranslation ? (
          <Text style={[styles.vietnamese, { color: colors.textSecondary }]}>
            {message.vi}
          </Text>
        ) : hideTranslation && message.vi ? (
          <Text
            style={[styles.tapToRevealDark, { color: colors.textSecondary }]}
          >
            Chạm để xem nghĩa
          </Text>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  botRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: Spacing.four,
  },
  userRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: Spacing.four,
  },
  botBubble: {
    width: "88%",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  userBubble: {
    maxWidth: "85%",
    minWidth: 120,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  japaneseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  japanese: {
    flex: 1,
    fontFamily: Fonts.rounded,
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
    marginTop: 1,
    flexShrink: 0,
  },
  vietnamese: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  userText: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    lineHeight: 28,
    color: "#FFFFFF",
    fontWeight: FontWeights.medium,
  },
  userVietnamese: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    paddingTop: Spacing.one,
  },
  tapToRevealLight: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: Spacing.two,
  },
  tapToRevealDark: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    fontStyle: "italic",
    marginTop: Spacing.two,
    opacity: 0.75,
  },
});
