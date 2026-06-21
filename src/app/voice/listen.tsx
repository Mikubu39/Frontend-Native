/**
 * Listening Exercise Screen
 * Figma screen 27 & 28
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { ListenButton } from '@/components/voice';
import { useAudio } from '@/hooks/use-audio';
import { GradientButton } from '@/components/ui/gradient-button';

export default function ListeningScreen() {
  const router = useRouter();
  const { isPlaying, play } = useAudio(2000);
  const [showDescription, setShowDescription] = useState(false);

  const phrase = {
    japanese: 'おはようございます',
    romaji: 'Ohayou gozaimasu',
    english: 'Good morning',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listening Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContainer}>
          <ListenButton isPlaying={isPlaying} onPress={play} />
          
          <Text style={styles.instructionText}>
            Listen carefully to the audio and try to understand the pronunciation.
          </Text>
        </View>

        {showDescription ? (
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Translation Detail</Text>
              <TouchableOpacity onPress={() => setShowDescription(false)}>
                <Text style={styles.sheetClose}>Hide</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <Text style={styles.japaneseText}>{phrase.japanese}</Text>
            <Text style={styles.romajiText}>{phrase.romaji}</Text>
            <Text style={styles.englishText}>{phrase.english}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.seeDescriptionButton}
            onPress={() => setShowDescription(true)}
          >
            <Text style={styles.seeDescriptionText}>See Description & Translation</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="CONTINUE"
          onPress={() => router.back()}
          style={styles.continueButton}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  closeText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
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
    padding: Spacing.six,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.six,
    paddingVertical: Spacing.eight,
  },
  instructionText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  seeDescriptionButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.four,
  },
  seeDescriptionText: {
    color: Colors.accent,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: Spacing.four,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sheetTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  sheetClose: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.two,
  },
  japaneseText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginVertical: Spacing.two,
  },
  romajiText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.one,
  },
  englishText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
    backgroundColor: Colors.cream,
  },
  continueButton: {
    width: '100%',
  },
});
