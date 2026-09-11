/**
 * WordCard - Dictionary word card with kanji, romaji, meaning + audio.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AudioButton } from "@/components/ui/audio-button";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";
import type { DictionaryEntry } from "@/types";
import {
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";

interface WordCardProps {
  entry: DictionaryEntry;
}

export const WordCard = React.memo(function WordCard({ entry }: WordCardProps) {
  const { colors } = useTheme();
  const { isPlaying, play } = useAudio(entry.audioUrl, entry.kanji);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.textStack}>
          <Text style={[styles.kanji, { color: colors.text }]}>
            {entry.kanji}
          </Text>
          <Text style={[styles.romaji, { color: colors.textSecondary }]}>
            {entry.romaji}
          </Text>
        </View>
        <AudioButton
          variant="speaker"
          size="small"
          isPlaying={isPlaying}
          onPress={() => play()}
        />
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Text style={[styles.meaning, { color: colors.textSecondary }]}>
        {entry.meaning}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textStack: {
    flex: 1,
    gap: 4,
    marginRight: Spacing.three,
  },
  kanji: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  romaji: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
  },
  divider: {
    height: 1,
  },
  meaning: {
    fontSize: FontSizes.md,
  },
});
