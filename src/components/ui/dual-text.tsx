import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors, FontSizes, FontWeights } from "@/constants/theme";
import { getDualText } from "@/utils/japanese-converter";

interface DualTextProps {
  text: string;
  hint?: string;
  mainStyle?: TextStyle;
  subStyle?: TextStyle;
  containerStyle?: ViewStyle;
  align?: "center" | "flex-start" | "flex-end";
}

export function DualText({
  text,
  hint,
  mainStyle,
  subStyle,
  containerStyle,
  align = "center",
}: DualTextProps) {
  const { mainText, subText } = getDualText(text, hint);

  return (
    <View style={[styles.container, { alignItems: align }, containerStyle]}>
      <Text style={[styles.mainText, mainStyle]}>{mainText}</Text>
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
