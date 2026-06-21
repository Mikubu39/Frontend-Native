/**
 * SocialAuthSection - "or" divider + social login buttons.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from '@/components/ui/social-button';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface SocialAuthSectionProps {
  onGooglePress: () => void;
  onFacebookPress: () => void;
  onApplePress: () => void;
}

export function SocialAuthSection({
  onGooglePress,
  onFacebookPress,
  onApplePress,
}: SocialAuthSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttons}>
        <SocialButton provider="google" onPress={onGooglePress} />
        <SocialButton provider="facebook" onPress={onFacebookPress} />
        <SocialButton provider="apple" onPress={onApplePress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.four,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.inputBorder,
  },
  dividerText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  buttons: {
    gap: Spacing.three,
  },
});
