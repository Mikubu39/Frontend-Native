/**
 * Reward Screen - "Congratulations! You got a free online lesson"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function RewardScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={Colors.gradients.reward}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.closeRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.closeBtn} onPress={() => router.back()}>✕</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>You got a free online lesson</Text>

          <Text style={styles.giftIcon}>🎁</Text>

          <Text style={styles.description}>
            Reward you with free online lesson.
          </Text>
        </View>

        <View style={styles.buttons}>
          <GradientButton
            title="Start online lesson"
            onPress={() => router.back()}
          />
          <GradientButton
            title="I will use later"
            variant="outline"
            onPress={() => router.back()}
            textStyle={styles.laterText}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.six,
  },
  closeRow: {
    flexDirection: 'row',
  },
  closeBtn: {
    fontSize: FontSizes.xxl,
    color: Colors.textOnDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.accentLight,
  },
  giftIcon: {
    fontSize: 100,
    marginVertical: Spacing.six,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textOnDark,
    opacity: 0.8,
    textAlign: 'center',
  },
  buttons: {
    gap: Spacing.four,
  },
  laterText: {
    color: Colors.secondary,
  },
});
