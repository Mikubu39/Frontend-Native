/**
 * FlagIcon - Renders a flag emoji based on language code or flag string.
 */

import React from 'react';
import { Text, StyleSheet, type TextStyle } from 'react-native';
import { FontSizes } from '@/constants/theme';

interface FlagIconProps {
  flag: string; // Emoji character (e.g. 🇯🇵) or language code ('ja', 'en', 'vi')
  size?: number;
  style?: TextStyle;
}

const LANGUAGE_TO_FLAG: Record<string, string> = {
  ja: '🇯🇵',
  jp: '🇯🇵',
  en: '🇺🇸',
  us: '🇺🇸',
  vi: '🇻🇳',
  vn: '🇻🇳',
  ko: '🇰🇷',
  kr: '🇰🇷',
  zh: '🇨🇳',
  cn: '🇨🇳',
};

export function FlagIcon({ flag, size = 20, style }: FlagIconProps) {
  const emoji = LANGUAGE_TO_FLAG[flag.toLowerCase()] || flag;

  return (
    <Text style={[styles.flag, { fontSize: size }, style]}>
      {emoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  flag: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
