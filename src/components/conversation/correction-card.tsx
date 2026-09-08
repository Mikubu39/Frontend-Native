/**
 * Thẻ góp ý gắn ngay dưới câu NGƯỜI HỌC vừa nói.
 *
 * Gắn vào câu của người học chứ không phải câu đáp của AI là chuyện có chủ ý:
 * lỗi phải nằm sát chỗ viết sai thì mắt mới nối được hai thứ với nhau. Và nó
 * tách khỏi bong bóng chat vì việc AI có HIỂU câu hay không với việc câu đó có
 * SAI hay không là hai chuyện độc lập - người học hoàn toàn có thể viết sai
 * một chữ mà bot vẫn hiểu đúng ý.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import {
  CORRECTION_CATEGORY_LABELS,
  CORRECTION_STYLES,
} from "@/constants/conversation";
import {
  BorderRadius,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { Correction } from "@/types/conversation";

interface CorrectionCardProps {
  corrections: Correction[];
}

export function CorrectionCard({ corrections }: CorrectionCardProps) {
  const { colors } = useTheme();
  // Ẩn các mục lời khen (praise) theo yêu cầu, chỉ hiển thị lỗi (error) hoặc gợi ý (suggestion)
  const items = corrections.filter((c) => c.severity !== "praise");
  if (!items.length) return null;

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.wrapper}>
      {items.map((correction, index) => {
        const style = CORRECTION_STYLES[correction.severity];
        const categoryLabel = CORRECTION_CATEGORY_LABELS[correction.category];
        const showFix = !!correction.suggestion;

        return (
          <View
            key={`${correction.severity}-${index}`}
            style={[
              styles.card,
              {
                backgroundColor: style.accent + "12",
                borderColor: style.accent + "33",
              },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${style.title}, ${categoryLabel}: ${correction.explanationVi}`}
          >
            <Ionicons
              name={style.icon as never}
              size={16}
              color={style.accent}
              style={styles.icon}
            />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: style.accent }]}>
                  {style.title}
                </Text>
                <Text
                  style={[styles.category, { color: colors.textSecondary }]}
                >
                  {categoryLabel}
                </Text>
              </View>

              {showFix ? (
                <View style={styles.fixRow}>
                  {correction.original ? (
                    <Text
                      style={[styles.wrong, { color: colors.textSecondary }]}
                    >
                      {correction.original}
                    </Text>
                  ) : null}
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.right, { color: colors.text }]}>
                    {correction.suggestion}
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.message, { color: colors.text }]}>
                {correction.explanationVi}
              </Text>
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Căn phải để nằm thẳng hàng dưới bong bóng của người học.
    alignSelf: "flex-end",
    maxWidth: "88%",
    minWidth: 220,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
    width: "100%",
  },
  icon: {
    marginRight: Spacing.two,
    marginTop: 1,
  },
  body: {
    flex: 1,
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: 2,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  category: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    lineHeight: 19,
  },
  fixRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
    flexWrap: "wrap",
  },
  wrong: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.md,
    textDecorationLine: "line-through",
  },
  right: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
});
