import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors, FontSizes, FontWeights } from "@/constants/theme";
import { getDualText } from "@/utils/japanese-converter";
import { JapaneseText } from "@/components/ui/japanese-text";
import type { Glossary } from "@/types/quiz";

interface DualTextProps {
  text: string;
  hint?: string;
  mainStyle?: TextStyle;
  subStyle?: TextStyle;
  containerStyle?: ViewStyle;
  align?: "center" | "flex-start" | "flex-end";
  /**
   * Có từ điển thì dòng chữ chính thành tra được: chạm giữ vào từ nào hiện cách
   * đọc và nghĩa của từ đó. Không có thì vẫn là một dòng chữ thường như cũ.
   */
  glossary?: Glossary;
  /**
   * Tắt tính năng tra từ điển (ví dụ ở các ô gạch ghép từ kana).
   */
  disableGlossary?: boolean;
}

export function DualText({
  text,
  hint,
  mainStyle,
  subStyle,
  containerStyle,
  align = "center",
  glossary,
  disableGlossary = false,
}: DualTextProps) {
  const { mainText, subText } = getDualText(text, hint);

  return (
    <View style={[styles.container, { alignItems: align }, containerStyle]}>
      {disableGlossary ? (
        <Text style={[styles.mainText, mainStyle]}>{mainText}</Text>
      ) : (
        <JapaneseText
          text={mainText}
          style={StyleSheet.flatten([styles.mainText, mainStyle])}
          glossary={glossary}
        />
      )}
      {subText ? (
        <Text style={[styles.subText, subStyle]}>{subText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  mainText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    opacity: 0.7,
    marginTop: 2,
    textAlign: "center",
  },
});
