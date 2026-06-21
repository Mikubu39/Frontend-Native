/**
 * LanguageToggle - "English ↔ Japanese" toggle pill.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface LanguageToggleProps {
  fromLang: string;
  toLang: string;
  onSwap: () => void;
}

export function LanguageToggle({ fromLang, toLang, onSwap }: LanguageToggleProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onSwap} activeOpacity={0.7}>
      <Text style={styles.lang}>{fromLang}</Text>
      <Text style={styles.arrow}>⇄</Text>
      <Text style={styles.lang}>{toLang}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignSelf: 'center',
  },
  lang: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  arrow: {
    fontSize: FontSizes.xl,
    color: Colors.secondary,
    fontWeight: FontWeights.bold,
  },
});
