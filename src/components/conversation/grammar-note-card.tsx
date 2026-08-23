/**
 * Thẻ góp ý ngữ pháp / chính tả gắn dưới câu người học vừa nói.
 *
 * Hiển thị tách khỏi bong bóng chat có chủ ý: việc AI có HIỂU câu hay không
 * và việc câu đó có SAI CHÍNH TẢ hay không là hai chuyện độc lập. Người học
 * hoàn toàn có thể viết sai một chữ mà bot vẫn hiểu đúng ý - và họ cần thấy
 * cả hai thông tin đó.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { GRAMMAR_NOTE_STYLES } from "@/constants/conversation";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { GrammarNote } from "@/types/conversation";

interface GrammarNoteCardProps {
  notes: GrammarNote[];
}

export function GrammarNoteCard({ notes }: GrammarNoteCardProps) {
  const { colors } = useTheme();
  if (!notes.length) return null;

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.wrapper}>
      {notes.map((note, index) => {
        const style = GRAMMAR_NOTE_STYLES[note.kind];
        return (
          <View
            key={`${note.kind}-${index}`}
            style={[
              styles.card,
              {
                backgroundColor: style.accent + "12",
                borderColor: style.accent + "33",
              },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${style.title}: ${note.messageVi}`}
          >
            <Ionicons
              name={style.icon as never}
              size={16}
              color={style.accent}
              style={styles.icon}
            />
            <View style={styles.body}>
              <Text style={[styles.title, { color: style.accent }]}>
                {style.title}
              </Text>
              <Text style={[styles.message, { color: colors.text }]}>
                {note.messageVi}
              </Text>

              {note.suggestion ? (
                <View style={styles.suggestionRow}>
                  <Text
                    style={[styles.wrong, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {note.original}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.right, { color: colors.text }]}>
                    {note.suggestion}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
  },
  icon: {
    marginRight: Spacing.two,
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  message: {
    fontSize: FontSizes.sm,
    lineHeight: 19,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    flexWrap: "wrap",
  },
  wrong: {
    fontSize: FontSizes.md,
    textDecorationLine: "line-through",
  },
  right: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
});
