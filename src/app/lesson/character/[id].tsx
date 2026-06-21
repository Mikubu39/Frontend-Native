/**
 * Character Detail Study and Writing Practice Screen
 * Figma screen 16, 17, 18
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { CharacterDisplay, WritingCanvas } from '@/components/lessons';

export default function CharacterDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState<'info' | 'write'>('info');

  // Simulating character data based on ID
  const characterData: Record<string, { char: string; romaji: string; meaning?: string; category: string }> = {
    '1': { char: 'あ', romaji: 'a', category: 'Hiragana 1-20' },
    '2': { char: 'い', romaji: 'i', category: 'Hiragana 1-20' },
    '3': { char: 'う', romaji: 'u', category: 'Hiragana 1-20' },
    '4': { char: 'え', romaji: 'e', category: 'Hiragana 1-20' },
    '5': { char: 'お', romaji: 'o', category: 'Hiragana 1-20' },
    'writing-hiragana': { char: 'あ', romaji: 'a', category: 'Writing Hiragana' },
    'writing-kanji': { char: '山', romaji: 'yama', meaning: 'mountain', category: 'Writing Kanji' },
  };

  const current = characterData[id as string] || { char: 'あ', romaji: 'a', category: 'Hiragana' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Character</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 'info' ? (
          <View style={styles.stepContainer}>
            <CharacterDisplay
              character={current.char}
              romaji={current.romaji}
              meaning={current.meaning}
              categoryName={current.category}
              onDrawPracticePress={() => setStep('write')}
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.back()}
            >
              <Text style={styles.skipButtonText}>Skip Practice & Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <WritingCanvas
              character={current.char}
              romaji={current.romaji}
              onComplete={() => {
                alert('Fantastic! Writing practice completed successfully!');
                router.back();
              }}
            />
            <TouchableOpacity
              style={styles.backToInfoButton}
              onPress={() => setStep('info')}
            >
              <Text style={styles.backToInfoText}>Back to Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
    backgroundColor: Colors.surface,
  },
  backButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  backText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.six,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    textDecorationLine: 'underline',
  },
  backToInfoButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  backToInfoText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
});
