/**
 * Sổ tay Hướng dẫn Chủ đề (GuidebookSheet) chuẩn Duolingo.
 * Hiển thị tóm tắt ngữ pháp, mục tiêu từng bài, từ vựng và câu mẫu then chốt.
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Fonts,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { getTopicGuide, type TopicGuide } from "@/data";

interface GuidebookSheetProps {
  visible: boolean;
  topicIndex: number;
  topicTitle: string;
  accentColor?: string;
  onClose: () => void;
}

export function GuidebookSheet({
  visible,
  topicIndex,
  topicTitle,
  accentColor = Colors.primary,
  onClose,
}: GuidebookSheetProps) {
  const { colors, isDark } = useTheme();
  const guide: TopicGuide | undefined = getTopicGuide(topicIndex + 1);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? "#161626" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.border,
            },
          ]}
        >
          {/* Header Handle Bar */}
          <View style={styles.handleBarWrap}>
            <View
              style={[
                styles.handleBar,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.15)",
                },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View
                style={[styles.partBadge, { backgroundColor: accentColor }]}
              >
                <Text style={styles.partBadgeText}>PHẦN {topicIndex + 1}</Text>
              </View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? "#FFFFFF" : Colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {topicTitle}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={20}
                color={isDark ? "#FFFFFF" : Colors.textPrimary}
              />
            </Pressable>
          </View>

          {/* Content ScrollView */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Overview / Grammar Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.02)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : colors.border,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="bulb"
                  size={18}
                  color={isDark ? "#8C9BD1" : Colors.primary}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? "#8C9BD1" : Colors.primary },
                  ]}
                >
                  TỔNG QUAN & NGỮ PHÁP
                </Text>
              </View>
              <Text
                style={[
                  styles.descText,
                  { color: isDark ? "rgba(255,255,255,0.88)" : colors.text },
                ]}
              >
                {guide?.description ||
                  "Chủ đề này giúp bạn nắm vững kiến thức ngữ pháp và từ vựng cốt lõi tiếng Nhật."}
              </Text>
            </View>

            {/* Lesson Summaries */}
            {guide?.lessons && guide.lessons.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.groupHeadingRow}>
                  <Ionicons
                    name="flag"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.groupHeading,
                      { color: colors.textSecondary },
                    ]}
                  >
                    CÁC BÀI HỌC TRONG PHẦN NÀY
                  </Text>
                </View>

                {guide.lessons.map((lesson, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.lessonCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.02)",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lessonCardTitle,
                        { color: isDark ? "#FFFFFF" : Colors.textPrimary },
                      ]}
                    >
                      {lesson.title}
                    </Text>
                    {lesson.desc ? (
                      <Text
                        style={[
                          styles.lessonCardDesc,
                          {
                            color: isDark
                              ? "rgba(255,255,255,0.7)"
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {lesson.desc}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Key Vocabulary */}
            {guide?.keyVocab && guide.keyVocab.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.groupHeadingRow}>
                  <Ionicons
                    name="sparkles"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.groupHeading,
                      { color: colors.textSecondary },
                    ]}
                  >
                    TỪ VỰNG THEN CHỐT
                  </Text>
                </View>
                <View style={styles.vocabGrid}>
                  {guide.keyVocab.map((vocab, vIdx) => (
                    <View
                      key={vIdx}
                      style={[
                        styles.vocabItem,
                        {
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.05)"
                            : colors.card,
                          borderColor: isDark
                            ? "rgba(255,255,255,0.08)"
                            : colors.border,
                        },
                      ]}
                    >
                      <View style={styles.vocabTopRow}>
                        <Text style={styles.vocabKana}>{vocab.kana}</Text>
                        {vocab.emoji ? (
                          <Text style={styles.vocabEmoji}>{vocab.emoji}</Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.vocabRomaji,
                          {
                            color: isDark
                              ? "rgba(255,255,255,0.5)"
                              : Colors.textSecondary,
                          },
                        ]}
                      >
                        {vocab.romaji}
                      </Text>
                      <Text
                        style={[styles.vocabVn, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {vocab.vn}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Key Sentences */}
            {guide?.keySentences && guide.keySentences.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.groupHeadingRow}>
                  <Ionicons
                    name="chatbubbles"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.groupHeading,
                      { color: colors.textSecondary },
                    ]}
                  >
                    MẪU CÂU THƯỜNG DÙNG
                  </Text>
                </View>
                {guide.keySentences.map((sent, sIdx) => (
                  <View
                    key={sIdx}
                    style={[
                      styles.sentenceCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.02)",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sentenceJp,
                        { color: isDark ? "#FFFFFF" : Colors.textPrimary },
                      ]}
                    >
                      {sent.jp}
                    </Text>
                    <Text
                      style={[
                        styles.sentenceRomaji,
                        {
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : Colors.textSecondary,
                        },
                      ]}
                    >
                      {sent.romaji}
                    </Text>
                    <Text
                      style={[
                        styles.sentenceVn,
                        {
                          color: isDark
                            ? Colors.secondaryLight
                            : Colors.secondary,
                        },
                      ]}
                    >
                      {sent.vn}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer CTA */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : colors.border,
              },
            ]}
          >
            <GradientButton
              title="ĐÃ HIỂU →"
              onPress={onClose}
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: "100%",
    maxHeight: "86%",
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    overflow: "hidden",
  },
  handleBarWrap: {
    alignItems: "center",
    paddingVertical: Spacing.one,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginRight: Spacing.three,
  },
  partBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  partBadgeText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
  },
  sectionWrap: {
    gap: Spacing.two,
  },
  groupHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  groupHeading: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lessonCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  lessonCardTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  lessonCardDesc: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
  },
  vocabGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  vocabItem: {
    width: "48%",
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  vocabTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vocabKana: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.accent,
  },
  vocabEmoji: {
    fontSize: 16,
  },
  vocabRomaji: {
    fontSize: FontSizes.xs,
  },
  vocabVn: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    marginTop: 2,
  },
  sentenceCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  sentenceJp: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  sentenceRomaji: {
    fontSize: FontSizes.xs,
  },
  sentenceVn: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  footer: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderTopWidth: 1,
  },
});
