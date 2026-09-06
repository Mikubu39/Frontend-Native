/**
 * AlphabetCell - Một ô chữ cái trong ma trận, tô màu theo `masteryLevel`.
 */

import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { BorderRadius, Colors, FontWeights, Shadows } from "@/constants/theme";
import { AlphabetCharacter, MAX_MASTERY_LEVEL } from "@/types/alphabet";
import { clampMasteryLevel, getMasteryPalette } from "./mastery";

interface AlphabetCellProps {
  character: AlphabetCharacter;
  size: number;
  selected?: boolean;
  onPress: (character: AlphabetCharacter) => void;
}

export function AlphabetCell({
  character,
  size,
  selected = false,
  onPress,
}: AlphabetCellProps) {
  const { colors } = useTheme();
  const level = clampMasteryLevel(character.masteryLevel);
  const palette = getMasteryPalette(level);
  const isNew = level === 0;

  return (
    <AnimatedPressable
      style={[
        styles.cell,
        {
          width: size,
          height: size + 10,
          backgroundColor: colors.card,
          borderColor: palette.border,
          borderBottomColor: palette.border,
        },
        selected && [
          styles.selectedCell,
          {
            borderColor: Colors.primary,
            borderBottomColor: Colors.primaryDark,
          },
        ],
      ]}
      onPress={() => onPress(character)}
      pressScale={0.92}
      accessibilityLabel={`${character.symbol}, ${character.romaji}, mức thông thạo ${level} trên ${MAX_MASTERY_LEVEL}`}
      accessibilityState={{ selected }}
    >
      {/* Lớp phủ tint thông thạo trên nền card đặc, tránh thay thế màu nền đặc làm lộ bóng đen elevation Android */}
      {!isNew && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: palette.fill,
              borderRadius: BorderRadius.lg - 2,
            },
          ]}
          pointerEvents="none"
        />
      )}
      <Text
        style={[
          styles.symbol,
          { color: isNew ? colors.textSecondary : colors.text },
          selected && styles.selectedText,
        ]}
      >
        {character.symbol}
      </Text>
      <Text style={[styles.romaji, { color: colors.textSecondary }]}>
        {character.romaji}
      </Text>

      <View style={styles.pipRow}>
        {Array.from({ length: MAX_MASTERY_LEVEL }, (_, index) => (
          <View
            key={index}
            style={[
              styles.pip,
              {
                backgroundColor:
                  index < level ? palette.accent : colors.borderSubtle,
              },
            ]}
          />
        ))}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderBottomWidth: 3.5,
    ...(Platform.OS === "ios" ? Shadows.sm : {}),
  },
  selectedCell: {
    ...(Platform.OS === "ios" ? Shadows.glow(Colors.primary) : {}),
  },
  symbol: {
    fontSize: 24,
    fontWeight: FontWeights.extrabold,
  },
  selectedText: {
    color: Colors.primaryDark,
  },
  romaji: {
    fontSize: 11,
    marginTop: 2,
  },
  pipRow: {
    flexDirection: "row",
    gap: 3,
    marginTop: 4,
  },
  pip: {
    width: 8,
    height: 3,
    borderRadius: 2,
  },
});
