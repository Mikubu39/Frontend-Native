/**
 * Thanh chủ đề dính (sticky) của màn hình lộ trình.
 *
 * MỘT thanh duy nhất cho cả bản đồ, thay vì mỗi chủ đề một banner riêng: nội
 * dung và màu của thanh đổi theo chủ đề đang nằm trong khung nhìn — đúng kiểu
 * Duolingo. Lý do không dùng `stickyHeaderIndices` của FlatList: mỗi chủ đề là
 * một item cao hàng nghìn pixel, sticky header của RN sẽ chồng lấn nhau lúc
 * chuyển đoạn và nhấp nháy trên Android.
 *
 * Thanh này nằm NGOÀI danh sách (anh em của FlatList trong cùng cột flex), nên
 * nó không bao giờ bị recycle và không tốn một lần dựng lại nào khi cuộn.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  BorderRadius,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import React from "react";
import { DimensionValue, StyleSheet, Text, View } from "react-native";

export interface TopicHeaderBarProps {
  /** Vị trí chủ đề trong lộ trình (0-based) — dùng cho nhãn "PHẦN n". */
  topicIndex: number;
  title: string;
  /** Số bài đã hoàn thành / tổng số bài của chủ đề. */
  completedCount: number;
  totalCount: number;
  /** Màu nhận diện của chủ đề; trùng với màu đường ray trên bản đồ. */
  accentColor: string;
  onGuidePress?: () => void;
}

export const TopicHeaderBar = React.memo(function TopicHeaderBar({
  topicIndex,
  title,
  completedCount,
  totalCount,
  accentColor,
  onGuidePress,
}: TopicHeaderBarProps) {
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercent: DimensionValue = `${Math.round(ratio * 100)}%`;

  return (
    <View style={[styles.bar, { backgroundColor: accentColor }]}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            PHẦN {topicIndex + 1}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <AnimatedPressable
          style={styles.guideBtn}
          onPress={onGuidePress}
          pressScale={0.92}
          accessibilityRole="button"
          accessibilityLabel={`Hướng dẫn phần ${topicIndex + 1}: ${title}`}
        >
          <Text style={styles.guideIcon}>📖</Text>
          <Text style={styles.guideText}>HƯỚNG DẪN</Text>
        </AnimatedPressable>
      </View>

      {/* Tiến độ của riêng chủ đề đang xem. */}
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityLabel={`Đã hoàn thành ${completedCount} trên ${totalCount} bài học`}
      >
        <View style={[styles.progressFill, { width: progressPercent }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    zIndex: 90,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  textBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
  },
  guideBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  guideIcon: {
    fontSize: 15,
  },
  guideText: {
    fontSize: 10,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.22)",
    overflow: "hidden",
    marginTop: Spacing.three,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
});
