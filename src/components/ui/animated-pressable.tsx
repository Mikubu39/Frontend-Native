/**
 * AnimatedPressable - A Pressable wrapper that provides a satisfying
 * scale-down spring animation on press + bounce back on release.
 * Replaces TouchableOpacity for a more premium, app-wide feel.
 */

import { AnimationPresets } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableComponentProps extends Omit<
  PressableProps,
  "style"
> {
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
  pressScale = 0.95,
  disableAnimation = false,
  disabled,
  onPressIn,
  onPressOut,
  accessibilityRole = "button",
  accessibilityState,
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
      // Trigger medium haptic feedback on press for tactile feel
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
      accessible={props.accessible ?? true}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: !!disabled,
        ...(accessibilityState || {}),
      }}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  );
}
