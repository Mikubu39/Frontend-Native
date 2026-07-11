/**
 * TabSwitcher - Pill-style toggle with animated sliding indicator.
 * Smooth color and position transitions when switching tabs.
 */

import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, AnimationPresets, Shadows } from '@/constants/theme';

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
  const indicatorX = useSharedValue(0);
  const tabWidth = useSharedValue(0);

  useEffect(() => {
    if (tabWidth.value > 0) {
      indicatorX.value = withSpring(
        activeIndex * tabWidth.value,
        AnimationPresets.springSnappy
      );
    }
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const containerWidth = event.nativeEvent.layout.width - 8; // subtract padding
    const singleTabWidth = containerWidth / tabs.length;
    tabWidth.value = singleTabWidth;
    indicatorX.value = activeIndex * singleTabWidth;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: inactiveColor }]}
      onLayout={handleLayout}
    >
      {/* Animated sliding pill indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: activeColor },
          indicatorStyle,
        ]}
      />

      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={styles.tab}
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
    padding: 4,
    alignSelf: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: '100%',
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    zIndex: 1,
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
