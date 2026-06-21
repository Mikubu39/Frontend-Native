/**
 * AuthHeader - "Kotodama" title + Login/Signup tab switcher.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabSwitcher } from '@/components/ui/tab-switcher';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

interface AuthHeaderProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

export function AuthHeader({ activeTab, onTabChange }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kotodama</Text>
      <TabSwitcher
        tabs={['Log in', 'Sign up']}
        activeIndex={activeTab}
        onTabPress={onTabChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.six,
    paddingTop: Spacing.eight,
  },
  title: {
    fontSize: FontSizes.hero,
    fontWeight: FontWeights.extrabold,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
});
