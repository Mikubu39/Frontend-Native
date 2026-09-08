/**
 * Ô nhập câu trả lời — gõ chữ VÀ nói, luôn dùng được song song.
 *
 * Có một bước xác nhận CỐ Ý: nút gửi chỉ bật khi ô có chữ, và câu vừa gõ vẫn
 * nằm nguyên trong ô cho tới khi gửi thành công. Với người học đang gõ tiếng
 * Nhật bằng bàn phím IME, mất chữ giữa chừng là trải nghiệm rất bực.
 *
 * Vì sao mic KHÔNG tự gửi sau khi nói xong
 * ----------------------------------------
 * Transcript được điền vào chính ô nhập này để người học đọc lại và sửa. Nếu
 * gửi thẳng, một lần nghe nhầm sẽ kéo theo phân loại sai rồi bot trả lời lạc
 * lõng, mà người học không hiểu vì sao. Cho họ thấy máy nghe ra gì trước khi
 * gửi sẽ cắt đứt chuỗi lỗi đó — và bản thân việc đọc lại cũng là học.
 */

import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
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

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;

  /** Đang nghe micro. */
  listening?: boolean;
  /** Chữ tạm thời trong lúc nói, hiện mờ để thấy máy đang nghe được gì. */
  partialTranscript?: string;
  /** Máy nghe không chắc chắn — nhắc người học kiểm lại trước khi gửi. */
  lowConfidence?: boolean;
  /** Bỏ trống nếu thiết bị không hỗ trợ nhận diện giọng nói. */
  onToggleMic?: () => void;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  disabled,
  sending,
  placeholder = "Nhập câu tiếng Nhật…",
  listening,
  partialTranscript,
  lowConfidence,
  onToggleMic,
}: ChatComposerProps) {
  const { colors } = useTheme();
  const canSend = value.trim().length > 0 && !disabled && !sending;

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      {listening ? (
        <View style={styles.listeningRow}>
          <View style={styles.listeningDot} />
          <Text style={[styles.listeningText, { color: colors.textSecondary }]}>
            {partialTranscript
              ? partialTranscript
              : "Đang nghe… bạn cứ nói tiếng Nhật"}
          </Text>
        </View>
      ) : null}

      {lowConfidence && !listening ? (
        <View style={styles.warningRow}>
          <Ionicons name="ear-outline" size={13} color={Colors.warning} />
          <Text style={styles.warningText}>
            Mình nghe chưa chắc lắm — bạn đọc lại câu bên dưới xem có đúng ý
            không nhé.
          </Text>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: lowConfidence ? Colors.warning : colors.border,
              color: colors.text,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          multiline
          // Tiếng Nhật gõ bằng IME nên phải để bàn phím tự sửa/gợi ý làm việc.
          autoCorrect
          autoCapitalize="none"
          maxLength={200}
          onSubmitEditing={() => canSend && onSend()}
          accessibilityLabel="Ô nhập câu trả lời bằng tiếng Nhật"
        />

        {onToggleMic ? (
          <AnimatedPressable
            onPress={onToggleMic}
            disabled={disabled || sending}
            pressScale={0.9}
            accessibilityRole="button"
            accessibilityLabel={listening ? "Dừng nghe" : "Nói bằng micro"}
            accessibilityState={{ disabled: !!disabled, selected: !!listening }}
            style={[
              styles.circleButton,
              {
                backgroundColor: listening
                  ? Colors.error
                  : colors.backgroundElement,
              },
            ]}
          >
            <Ionicons
              name={listening ? "stop" : "mic"}
              size={20}
              color={listening ? "#FFFFFF" : colors.textSecondary}
            />
          </AnimatedPressable>
        ) : null}

        <AnimatedPressable
          onPress={onSend}
          disabled={!canSend}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Gửi câu trả lời"
          accessibilityState={{ disabled: !canSend }}
          style={[
            styles.circleButton,
            {
              backgroundColor: canSend
                ? Colors.primary
                : colors.backgroundElement,
            },
          ]}
        >
          <Ionicons
            name={sending ? "hourglass-outline" : "arrow-up"}
            size={20}
            color={canSend ? "#FFFFFF" : colors.textSecondary}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.rounded,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    fontSize: FontSizes.lg,
    maxHeight: 120,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  listeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  listeningText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    fontStyle: "italic",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  warningText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.warning,
  },
});
