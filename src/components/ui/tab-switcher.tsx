/**
 * TabSwitcher - Pill-style toggle between two options.
 * Used for Login/Signup toggle, Week/Stage toggle, etc.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface TabSwitcherProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export function TabSwitcher({
  tabs,
  activeIndex,
  onTabPress,
  activeColor = Colors.primary,
  inactiveColor = Colors.lockedBg,
}: TabSwitcherProps) {
  return (
    <View style={[styles.container, { backgroundColor: inactiveColor }]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            index === activeIndex && [styles.activeTab, { backgroundColor: activeColor }],
          ]}
          onPress={() => onTabPress(index)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              index === activeIndex ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.one,
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  activeTabText: {
    color: Colors.textOnDark,
  },
  inactiveTabText: {
    color: Colors.textSecondary,
  },
});
