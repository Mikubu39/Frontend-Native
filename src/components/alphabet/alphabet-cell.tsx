/**
 * AlphabetCell - Một ô chữ cái trong ma trận, tô màu theo `masteryLevel`.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
        },
        !isNew && { backgroundColor: palette.fill },
        selected && [styles.selectedCell, { borderColor: Colors.primary }],
      ]}
      onPress={() => onPress(character)}
      pressScale={0.92}
      accessibilityLabel={`${character.symbol}, ${character.romaji}, mức thông thạo ${level} trên ${MAX_MASTERY_LEVEL}`}
      accessibilityState={{ selected }}
    >
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
    ...Shadows.sm,
  },
  selectedCell: {
    ...Shadows.glow(Colors.primary),
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
