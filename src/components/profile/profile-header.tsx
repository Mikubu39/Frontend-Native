/**
 * ProfileHeader - Avatar + name + level on gradient background.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface ProfileHeaderProps {
  displayName: string;
  level: number;
  nativeFlag: string;
  learningFlag: string;
}

export function ProfileHeader({ displayName, level, nativeFlag, learningFlag }: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={Colors.gradients.profile}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <View style={styles.levelRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
      </View>
      <View style={styles.flagRow}>
        <View style={styles.flagPill}>
          <Text style={styles.flagEmoji}>{nativeFlag}</Text>
          <Text style={styles.flagLabel}>Native</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.flagPill}>
          <Text style={styles.flagEmoji}>{learningFlag}</Text>
          <Text style={styles.flagLabel}>Learning</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  name: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textOnDark,
  },
  levelRow: {
    flexDirection: 'row',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  levelText: {
    color: Colors.textOnDark,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  flagEmoji: {
    fontSize: 18,
  },
  flagLabel: {
    color: Colors.textOnDark,
    fontSize: FontSizes.sm,
  },
  arrow: {
    color: Colors.textOnDark,
    fontSize: FontSizes.lg,
  },
});
