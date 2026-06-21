/**
 * OptionCard - Selectable card with optional checkmark.
 * Used in onboarding goals, quiz answers, etc.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'default' | 'accent';
}

export function OptionCard({
  title,
  subtitle,
  selected = false,
  onPress,
  variant = 'default',
}: OptionCardProps) {
  const isAccent = variant === 'accent' || selected;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isAccent && styles.cardAccent,
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.title, isAccent && styles.titleAccent]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardAccent: {
    backgroundColor: Colors.accent,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  titleAccent: {
    color: Colors.textOnDark,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
