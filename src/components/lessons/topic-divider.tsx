/**
 * Vạch ngăn giữa hai chủ đề trên bản đồ lộ trình.
 *
 * Chỉ một dòng chữ là tên chủ đề SẮP TỚI, kẹp giữa hai nét kẻ — thay cho tấm
 * banner đầy đủ trước đây. Thông tin chi tiết (phần mấy, tiến độ, nút hướng
 * dẫn) đã dồn hết về thanh dính duy nhất ở đầu màn hình, nên ở đây chỉ cần đủ
 * để người học biết mình vừa bước sang đoạn nào.
 *
 * CHIỀU CAO CỐ ĐỊNH ({@link TOPIC_DIVIDER_HEIGHT}): màn hình lộ trình tính
 * trước offset của từng chủ đề để biết chủ đề nào đang trong khung nhìn và để
 * cấp `getItemLayout` cho FlatList. Nếu chiều cao ở đây co giãn theo nội dung,
 * toàn bộ phép tính đó lệch. Vì vậy tên chủ đề luôn gói trong 1 dòng.
 */

import { Fonts, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** Chiều cao cố định của vạch ngăn, tính cả lề trên/dưới. */
export const TOPIC_DIVIDER_HEIGHT = 68;

export interface TopicDividerProps {
  /** Tên chủ đề bắt đầu ngay bên dưới vạch ngăn này. */
  title: string;
  /** Thứ tự chủ đề sắp tới (0-based). */
  topicIndex: number;
  accentColor: string;
  isDark: boolean;
}

export const TopicDivider = React.memo(function TopicDivider({
  title,
  topicIndex,
  accentColor,
  isDark,
}: TopicDividerProps) {
  const lineColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="header"
      accessibilityLabel={`Phần ${topicIndex + 1}: ${title}`}
    >
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <View style={styles.labelBlock}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text
          style={[styles.label, { color: accentColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    height: TOPIC_DIVIDER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  line: {
    flex: 1,
    height: 1,
    borderRadius: 1,
  },
  labelBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "62%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    flexShrink: 1,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.8,
  },
});
