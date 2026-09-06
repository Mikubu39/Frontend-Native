/**
 * AnimatedPressable - A Pressable wrapper that provides a satisfying
 * scale-down animation on press + bounce back on release.
 * Replaces TouchableOpacity for a more premium, app-wide feel.
 *
 * Haptics are opt-in (via `haptic` prop) — bridge calls cost ~5-10ms each,
 * so they should only be used on important actions, not every pressable.
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
  withTiming,
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

/** Duration (ms) for the press-in / press-out scale transition. */
const PRESS_DURATION = 120;

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
  /** Trigger haptic feedback on press (default: false — opt-in to avoid bridge overhead) */
  haptic?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  pressScale = 0.95,
  disableAnimation = false,
  disabled,
  haptic = false,
  onPressIn,
  onPressOut,
  accessibilityRole = "button",
  accessibilityState,
  ...props
}: AnimatedPressableComponentProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    if (!disableAnimation && !disabled) {
      scale.value = withTiming(pressScale, { duration: PRESS_DURATION });
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disableAnimation && !disabled) {
      scale.value = withTiming(1, { duration: PRESS_DURATION });
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
