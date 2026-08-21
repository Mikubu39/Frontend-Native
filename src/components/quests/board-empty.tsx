/**
 * BoardEmpty - Stands in for the rail when the day has no quests on it.
 *
 * The header has already said the board is empty, so this panel carries only
 * the thing the header cannot: what to do about it.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QuestPalette } from "@/constants/quests";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

export function BoardEmpty() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Ionicons name="flag-outline" size={28} color={QuestPalette.dormant} />
      <Text style={[styles.title, { color: colors.text }]}>
        Kéo xuống để tải lại bảng
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
});
