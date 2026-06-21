/**
 * Quiz Ready Screen - "Are you ready to learn?"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

export default function QuizReadyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flag}>
        <Text style={styles.flagEmoji}>🇯🇵</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Are you ready to{'\n'}learn 20 questions{'\n'}of WORD?
        </Text>
      </View>

      <GradientButton
        title="READY"
        onPress={() => router.replace('/quiz/q1')}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.eight,
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 60,
    left: Spacing.six,
  },
  flagEmoji: {
    fontSize: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.eight,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  button: {
    width: '100%',
  },
});
