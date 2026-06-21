/**
 * RewardCard - Displays profile learning milestones and rewards.
 * Figma screen 24/29
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import { ProgressBar } from '../ui/progress-bar';

interface RewardCardProps {
  xp: number;
  maxXp?: number;
  levelNumber: number;
  streak: number;
}

export function RewardCard({ xp, maxXp = 1000, levelNumber, streak }: RewardCardProps) {
  const progress = xp / maxXp;
  const daysRemaining = 5;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Challenge</Text>
        <Text style={styles.badge}>Level {levelNumber}</Text>
      </View>
      
      <Text style={styles.streakText}>🔥 {streak} Days Streak!</Text>

      <View style={styles.progressContainer}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Progress to next gift</Text>
          <Text style={styles.xpValue}>{xp} / {maxXp} XP</Text>
        </View>
        
        {/* Progress bar */}
        <ProgressBar progress={progress} height={12} />
      </View>

      <View style={styles.giftRow}>
        <Text style={styles.giftInfo}>🎁 Get a free online lesson at 1000 XP!</Text>
        <Text style={styles.daysText}>{daysRemaining}d left</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  badge: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textOnDark,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
  },
  streakText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.accent,
  },
  progressContainer: {
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  xpValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  giftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
    paddingTop: Spacing.three,
    marginTop: Spacing.one,
  },
  giftInfo: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.secondary,
    flex: 1,
  },
  daysText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.bold,
  },
});
