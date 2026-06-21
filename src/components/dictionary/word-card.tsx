/**
 * WordCard - Dictionary word card with kanji, romaji, meaning + audio.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AudioButton } from '@/components/ui/audio-button';
import type { DictionaryEntry } from '@/types';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface WordCardProps {
  entry: DictionaryEntry;
}

export function WordCard({ entry }: WordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.kanji}>{entry.kanji}</Text>
        <Text style={styles.romaji}>{entry.romaji}</Text>
        <AudioButton variant="speaker" size="small" onPress={() => {}} />
      </View>
      <View style={styles.divider} />
      <Text style={styles.meaning}>{entry.meaning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kanji: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  romaji: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginRight: Spacing.three,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
  },
  meaning: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
