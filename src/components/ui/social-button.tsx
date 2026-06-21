/**
 * SocialButton - Social auth button (Google, Facebook, Apple).
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

type SocialProvider = 'google' | 'facebook' | 'apple';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const PROVIDER_CONFIG: Record<SocialProvider, { icon: string; label: string; iconColor: string }> = {
  google: { icon: 'G', label: 'Log in with Google', iconColor: '#DB4437' },
  facebook: { icon: 'f', label: 'Log in with Facebook', iconColor: '#4267B2' },
  apple: { icon: '', label: 'Log in with Apple', iconColor: '#000000' },
};

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const config = PROVIDER_CONFIG[provider];

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: config.iconColor }]}>{config.icon}</Text>
      </View>
      <Text style={styles.label}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.six,
    gap: Spacing.three,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
});
