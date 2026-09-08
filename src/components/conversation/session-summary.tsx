/**
 * Bản tổng kết cuối phiên - lý do tồn tại của giới hạn 5 phút.
 *
 * Thứ tự các mục KHÔNG tuỳ tiện, nó theo đúng thứ tự người học cần đọc:
 *
 *   1. Điểm + nhận xét chung  -> "mình vừa làm thế nào"
 *   2. Làm tốt                -> đọc lời khen TRƯỚC khi đọc lỗi, nếu không
 *                                phần còn lại sẽ đọc như một bản án
 *   3. Lỗi và cách sửa        -> phần nặng nhất, đặt ở giữa
 *   4. Ngữ pháp nên ôn        -> biến lỗi rời rạc thành thứ học được
 *   5. Nói sao cho tự nhiên   -> thứ mà một bộ kiểm tra ngữ pháp không cho được
 *   6. Lần sau luyện gì       -> kết bằng hành động, không kết bằng lỗi
 *
 * Mọi mục đều tự ẩn khi rỗng. Một phiên sạch lỗi phải trông như một phiên sạch
 * lỗi, chứ không phải một loạt tiêu đề trống rỗng.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import {
  CORRECTION_CATEGORY_LABELS,
  formatDuration,
  scoreColor,
} from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationSummary } from "@/types/conversation";

interface SessionSummaryProps {
  summary: ConversationSummary;
}

interface SectionProps {
  icon: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}

function Section({ icon, title, accent, children }: SectionProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as never} size={16} color={accent} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function SessionSummary({ summary }: SessionSummaryProps) {
  const { colors } = useTheme();
  const accent = scoreColor(summary.score);

  return (
    <Animated.View entering={FadeInDown.duration(320)} style={styles.wrapper}>
      {/* 1. Điểm + nhận xét chung */}
      <View
        style={[
          styles.hero,
          { backgroundColor: colors.card, borderColor: accent + "55" },
        ]}
      >
        <View style={[styles.scoreRing, { borderColor: accent }]}>
          <Text style={[styles.scoreValue, { color: accent }]}>
            {summary.score}
          </Text>
          <Text style={[styles.scoreUnit, { color: colors.textSecondary }]}>
            /100
          </Text>
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Tổng kết phiên luyện
        </Text>
        <Text style={[styles.heroMeta, { color: colors.textSecondary }]}>
          {summary.turnCount} lượt nói ·{" "}
          {formatDuration(summary.durationSeconds)}
        </Text>

        {summary.overallVi ? (
          <Text style={[styles.heroText, { color: colors.text }]}>
            {summary.overallVi}
          </Text>
        ) : null}
      </View>

      {/* 2. Làm tốt */}
      {summary.strengths.length ? (
        <Section icon="thumbs-up" title="Bạn làm tốt" accent={Colors.success}>
          {summary.strengths.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={Colors.success}
              />
              <Text style={[styles.bulletText, { color: colors.text }]}>
                {item}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      {/* 3. Lỗi và cách sửa */}
      {summary.mistakes.length ? (
        <Section
          icon="construct-outline"
          title="Lỗi và cách sửa"
          accent={Colors.error}
        >
          {summary.mistakes.map((mistake, index) => {
            // `suggestion` nghĩa là câu vẫn đúng, chỉ có cách nói hay hơn -
            // tô đỏ nó sẽ dạy người học điều sai.
            const tone =
              mistake.severity === "error" ? Colors.error : "#3B82F6";
            return (
              <View
                key={index}
                style={[styles.item, { borderLeftColor: tone }]}
              >
                <Text
                  style={[styles.itemCategory, { color: colors.textSecondary }]}
                >
                  {CORRECTION_CATEGORY_LABELS[mistake.category] ?? "Ngữ pháp"}
                </Text>
                <Text
                  style={[styles.wrong, { color: colors.textSecondary }]}
                  accessibilityLabel={`Câu bạn đã nói: ${mistake.original}`}
                >
                  {mistake.original}
                </Text>
                {mistake.corrected ? (
                  <View style={styles.correctedRow}>
                    <Ionicons name="arrow-down" size={13} color={tone} />
                    <Text style={[styles.corrected, { color: colors.text }]}>
                      {mistake.corrected}
                    </Text>
                  </View>
                ) : null}
                <Text
                  style={[styles.explanation, { color: colors.textSecondary }]}
                >
                  {mistake.explanationVi}
                </Text>
              </View>
            );
          })}
        </Section>
      ) : null}

      {/* 4. Ngữ pháp nên ôn */}
      {summary.grammarPoints.length ? (
        <Section
          icon="school-outline"
          title="Ngữ pháp nên ôn lại"
          accent={Colors.primary}
        >
          {summary.grammarPoints.map((point, index) => (
            <View
              key={index}
              style={[styles.item, { borderLeftColor: Colors.primary }]}
            >
              <Text style={[styles.pattern, { color: colors.text }]}>
                {point.pattern}
              </Text>
              <Text
                style={[styles.explanation, { color: colors.textSecondary }]}
              >
                {point.explanationVi}
              </Text>
              {point.exampleJa ? (
                <View
                  style={[
                    styles.example,
                    { backgroundColor: colors.backgroundElement },
                  ]}
                >
                  <Text style={[styles.exampleJa, { color: colors.text }]}>
                    {point.exampleJa}
                  </Text>
                  {point.exampleVi ? (
                    <Text
                      style={[
                        styles.exampleVi,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {point.exampleVi}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </Section>
      ) : null}

      {/* 5. Nói sao cho tự nhiên */}
      {summary.naturalnessTips.length ? (
        <Section
          icon="sparkles"
          title="Nói sao cho tự nhiên hơn"
          accent={Colors.accent}
        >
          {summary.naturalnessTips.map((tip, index) => (
            <View
              key={index}
              style={[styles.item, { borderLeftColor: Colors.accent }]}
            >
              {tip.instead ? (
                <Text style={[styles.wrong, { color: colors.textSecondary }]}>
                  {tip.instead}
                </Text>
              ) : null}
              <View style={styles.correctedRow}>
                <Ionicons name="arrow-down" size={13} color={Colors.accent} />
                <Text style={[styles.corrected, { color: colors.text }]}>
                  {tip.prefer}
                </Text>
              </View>
              <Text
                style={[styles.explanation, { color: colors.textSecondary }]}
              >
                {tip.whyVi}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}

      {/* 6. Lần sau luyện gì */}
      {summary.nextFocus.length ? (
        <Section
          icon="flag-outline"
          title="Lần sau nên luyện"
          accent={Colors.primary}
        >
          {summary.nextFocus.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Ionicons
                name="ellipse"
                size={7}
                color={Colors.primary}
                style={styles.dot}
              />
              <Text style={[styles.bulletText, { color: colors.text }]}>
                {item}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  hero: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    gap: Spacing.one,
  },
  scoreRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: Spacing.two,
  },
  scoreValue: {
    fontFamily: Fonts.rounded,
    fontSize: 30,
    fontWeight: FontWeights.extrabold,
    fontVariant: ["tabular-nums"],
  },
  scoreUnit: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    marginTop: 10,
    marginLeft: 1,
  },
  heroTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
  },
  heroMeta: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
  },
  heroText: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 21,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  section: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  dot: {
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  item: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.three,
    gap: 2,
  },
  itemCategory: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: FontWeights.bold,
  },
  wrong: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.md,
    textDecorationLine: "line-through",
  },
  correctedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  corrected: {
    flex: 1,
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    lineHeight: 24,
  },
  explanation: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 19,
    marginTop: 2,
  },
  pattern: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  example: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  exampleJa: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  exampleVi: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
