/**
 * Voice Translate Screen - Mic + language toggle + translation result.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioButton } from '@/components/ui/audio-button';
import { LanguageToggle } from '@/components/voice/language-toggle';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

export default function TranslateScreen() {
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Japanese');
  const [inputText, setInputText] = useState('Thank you');
  const [outputText, setOutputText] = useState('ありがとう');

  const handleSwap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.flag}>
          <Text style={styles.flagEmoji}>🇯🇵</Text>
        </View>
      </View>

      <View style={styles.content}>
        <AudioButton variant="mic" size="large" onPress={() => {}} label="Tap to record" />

        <LanguageToggle fromLang={fromLang} toLang={toLang} onSwap={handleSwap} />

        {inputText && (
          <View style={styles.resultSection}>
            <Text style={styles.langLabel}>{fromLang}</Text>
            <View style={styles.textBox}>
              <Text style={styles.textContent}>{inputText}</Text>
            </View>

            <Text style={styles.swapArrow}>↕</Text>

            <Text style={styles.langLabel}>{toLang}</Text>
            <View style={styles.textBox}>
              <Text style={styles.textContent}>{outputText}</Text>
              <View style={styles.textActions}>
                <AudioButton variant="speaker" size="small" onPress={() => {}} />
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.four,
  },
  flag: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.seven,
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.eight,
  },
  resultSection: {
    width: '100%',
    gap: Spacing.three,
  },
  langLabel: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  textBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    minHeight: 80,
  },
  textContent: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  swapArrow: {
    fontSize: FontSizes.xl,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  textActions: {
    position: 'absolute',
    right: Spacing.four,
    top: Spacing.four,
  },
});
