/**
 * Đồng hồ đếm ngược của phiên luyện, nằm trên thanh tiêu đề.
 *
 * Vì sao phải hiện thời gian chứ không âm thầm cắt
 * ------------------------------------------------
 * Phiên tự kết thúc sau 5 phút. Nếu người học không thấy đồng hồ, việc ô nhập
 * đột ngột bị khoá sẽ giống một lỗi phần mềm chứ không giống luật chơi. Thấy
 * số giây trôi đi còn tạo ra nhịp: họ trả lời gọn hơn, đúng như hội thoại thật.
 *
 * Dưới 60 giây thì đổi màu cảnh báo - cùng ngưỡng mà server dùng để nhắc AI
 * lái hội thoại về phần kết, nên hai thứ luôn khớp nhau.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import {
  WRAP_UP_WARNING_SECONDS,
  formatDuration,
} from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

interface SessionTimerProps {
  remainingSeconds: number;
  /** Tạm dừng hiển thị khi phiên chưa chạy (đang chờ câu chào mở màn). */
  paused?: boolean;
}

export function SessionTimer({ remainingSeconds, paused }: SessionTimerProps) {
  const { colors } = useTheme();
  const warning = !paused && remainingSeconds <= WRAP_UP_WARNING_SECONDS;
  const accent = warning ? Colors.error : colors.textSecondary;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: warning
            ? Colors.errorLight
            : colors.backgroundElement,
          borderColor: warning ? Colors.error + "55" : colors.border,
        },
      ]}
      accessibilityRole="timer"
      accessibilityLabel={
        paused
          ? "Phiên chưa bắt đầu"
          : `Còn ${formatDuration(remainingSeconds)} phút`
      }
      // Đọc lại mỗi giây sẽ làm trình đọc màn hình nói liên tục không ngớt.
      // `polite` để nó chỉ chen vào giữa các quãng nghỉ.
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={warning ? "alarm-outline" : "time-outline"}
        size={14}
        color={accent}
      />
      <Text style={[styles.text, { color: accent }]}>
        {paused ? "--:--" : formatDuration(remainingSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  text: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    // Chữ số đơn cách để đồng hồ không co giãn khi số thay đổi.
    fontVariant: ["tabular-nums"],
  },
});
