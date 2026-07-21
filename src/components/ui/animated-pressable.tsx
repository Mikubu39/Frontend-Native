/**
 * AnimatedPressable - A Pressable wrapper that provides a satisfying
 * scale-down spring animation on press + bounce back on release.
 * Replaces TouchableOpacity for a more premium, app-wide feel.
 */

import React from 'react';
import { Pressable, type ViewStyle, type PressableProps, StyleSheet, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimationPresets } from '@/constants/theme';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableComponentProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale factor when pressed (default: 0.97) */
  pressScale?: number;
  /** Disable the scale animation */
  disableAnimation?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  pressScale = 0.97,
  disableAnimation = false,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableComponentProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (e: any) => {
    if (!disableAnimation && !disabled) {
      scale.value = withSpring(pressScale, AnimationPresets.springSnappy);
      opacity.value = withSpring(0.85, AnimationPresets.springSnappy);
      // Trigger light haptic feedback on press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disableAnimation && !disabled) {
      scale.value = withSpring(1, AnimationPresets.springSnappy);
      opacity.value = withSpring(1, AnimationPresets.springSnappy);
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressableBase
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
