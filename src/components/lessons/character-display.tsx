/**
 * CharacterDisplay - Shows a Japanese character (Hiragana/Katakana/Kanji)
 * with audio player and dictionary bookmarking.
 * Figma screen 16 & 17
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { AudioButton } from '../ui/audio-button';
import { useAudio } from '@/hooks/use-audio';

interface CharacterDisplayProps {
  character: string;
  romaji: string;
  meaning?: string;
  categoryName?: string;
  onDrawPracticePress?: () => void;
}

export function CharacterDisplay({
  character,
  romaji,
  meaning,
  categoryName = 'Hiragana',
  onDrawPracticePress,
}: CharacterDisplayProps) {
  const { isPlaying, play } = useAudio();
  const [isSaved, setIsSaved] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.category}>{categoryName}</Text>
      
      <View style={styles.characterContainer}>
        <Text style={styles.characterText}>{character}</Text>
        <Text style={styles.romajiText}>{romaji}</Text>
        {meaning && <Text style={styles.meaningText}>{meaning}</Text>}
      </View>

      <View style={styles.actionRow}>
        <View style={styles.audioWrapper}>
          <AudioButton isPlaying={isPlaying} onPress={play} size="medium" />
          <Text style={styles.actionLabel}>Audio</Text>
        </View>

        <View style={styles.audioWrapper}>
          <TouchableOpacity
            style={[styles.actionIconButton, isSaved && styles.savedButton]}
            onPress={() => setIsSaved(!isSaved)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, isSaved && styles.savedIcon]}>
              {isSaved ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Save</Text>
        </View>

        {onDrawPracticePress && (
          <View style={styles.audioWrapper}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={onDrawPracticePress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>✍️</Text>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Write</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  category: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.four,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.three,
  },
  characterText: {
    fontSize: 96,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 110,
  },
  romajiText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: Spacing.two,
  },
  meaningText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.six,
    marginTop: Spacing.five,
    width: '100%',
  },
  audioWrapper: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  savedButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  savedIcon: {
    color: Colors.textOnCream,
  },
  actionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
});
