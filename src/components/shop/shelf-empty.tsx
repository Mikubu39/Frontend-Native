/**
 * ShelfEmpty - Shown when a shelf has nothing on it. An empty screen is an
 * invitation to act, so each case says what to do next.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RARITY_STYLES } from "@/constants/shop";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

interface ShelfEmptyProps {
  icon: string;
  title: string;
  body: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export function ShelfEmpty({
  icon,
  title,
  body,
  textColor,
  mutedColor,
  borderColor,
}: ShelfEmptyProps) {
  return (
    <View style={[styles.container, { borderColor }]}>
      <Ionicons
        name={icon as any}
        size={30}
        color={RARITY_STYLES.rare.accent}
      />
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.body, { color: mutedColor }]}>{body}</Text>
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
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
  body: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    textAlign: "center",
    lineHeight: 20,
  },
});
