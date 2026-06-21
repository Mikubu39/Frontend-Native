/**
 * Pronunciation Recording Screen
 * Figma screen 29 & 30
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { RecordButton, ScoreRing } from '@/components/voice';
import { GradientButton } from '@/components/ui/gradient-button';

export default function RecordScreen() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'recording' | 'scored'>('idle');
  const [score, setScore] = useState<number>(0);

  const phrase = {
    japanese: 'おはようございます',
    romaji: 'Ohayou gozaimasu',
    english: 'Good morning',
  };

  const startRecording = () => {
    setState('recording');
    
    // Simulate recording for 2 seconds, then generate a random high score
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 30) + 70; // score between 70 and 99
      setScore(randomScore);
      setState('scored');
    }, 2000);
  };

  const handleTryAgain = () => {
    setState('idle');
    setScore(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pronunciation Practice</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.phraseCard}>
          <Text style={styles.japaneseText}>{phrase.japanese}</Text>
          <Text style={styles.romajiText}>{phrase.romaji}</Text>
          <Text style={styles.englishText}>{phrase.english}</Text>
        </View>

        <View style={styles.centerContainer}>
          {state === 'scored' ? (
            <View style={styles.scoreContainer}>
              <ScoreRing score={score} />
              <Text style={styles.scoreText}>
                {score >= 85 ? 'Excellent Pronunciation!' : 'Good effort! Keep practicing.'}
              </Text>
            </View>
          ) : (
            <View style={styles.micContainer}>
              <RecordButton
                isRecording={state === 'recording'}
                onPress={state === 'idle' ? startRecording : () => {}}
              />
              <Text style={styles.instruction}>
                {state === 'recording'
                  ? 'Speak clearly into your microphone...'
                  : 'Tap the microphone to start speaking'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {state === 'scored' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.retryButton} onPress={handleTryAgain}>
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </TouchableOpacity>
            <GradientButton
              title="CONTINUE"
              onPress={() => router.back()}
              style={styles.continueButton}
            />
          </View>
        ) : (
          <GradientButton
            title="SKIP"
            variant="outline"
            onPress={() => router.back()}
            style={styles.skipButton}
          />
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
    gap: Spacing.six,
  },
  phraseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  japaneseText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.one,
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  micContainer: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  instruction: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  scoreContainer: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  scoreText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
    backgroundColor: Colors.cream,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  retryButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  retryText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  continueButton: {
    flex: 1,
  },
  skipButton: {
    width: '100%',
  },
});
