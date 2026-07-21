/**
 * AnimatedTabIcon - Polished animated tab bar icon with refined spring bounce.
 * Shows active/inactive images, animates scale on tab switch,
 * and includes a subtle active dot indicator.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimationPresets, Colors } from '@/constants/theme';

interface AnimatedTabIconProps {
  iconName: string;
  focused: boolean;
  size?: number;
}

export function AnimatedTabIcon({
  iconName,
  focused,
  size = 28,
}: AnimatedTabIconProps) {
  const scale = useSharedValue(focused ? 1 : 0.85);
  const translateY = useSharedValue(focused ? -4 : 0);
  const dotOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withTiming(0.7, { duration: 50 }),
        withSpring(1.2, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      translateY.value = withSpring(-4, { damping: 15, stiffness: 150 });
      dotOpacity.value = withTiming(1, { duration: 150 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      scale.value = withTiming(0.85, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
      dotOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  const dotStyle = useAnimatedStyle(() => {
    return {
      opacity: dotOpacity.value,
      transform: [{ scale: dotOpacity.value }]
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <FontAwesome5
          name={iconName}
          size={size - 4}
          color={focused ? Colors.tabActive : Colors.tabInactive}
          solid={focused}
        />
      </Animated.View>
      {/* Active Dot Indicator */}
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 34, // Fixed height to prevent layout shifts
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tabActive,
    marginTop: 2,
    position: 'absolute',
    bottom: -6,
  },
});
