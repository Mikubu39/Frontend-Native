/**
 * TabItem – Self-contained tab button with an active pill that expands
 * to wrap icon + label, and collapses to icon-only when inactive.
 *
 * Design rationale:
 *  - The active state is a filled capsule (icon + label), not a dot.
 *  - Inactive shows only the icon, no label clutter.
 *  - Spring physics are tight — no carnival bounce.
 *  - translateY is capped to avoid layout drama on small bars.
 */

import React, { useEffect } from "react";
import { StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconNameActive: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
}

const SPRING = { damping: 22, stiffness: 300, mass: 0.6 };
const ACTIVE_COLOR = Colors.tabActive; // #E91E8E (brand pink)
const PILL_COLOR = Colors.tabActive + "18"; // ~10% opacity tint

export function TabItem({
  iconName,
  iconNameActive,
  label,
  focused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: TabItemProps) {
  const { colors } = useTheme();

  const progress = useSharedValue(focused ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, SPRING);
    if (focused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progress.value, [0, 0.5, 1], [1, 0.88, 1.08]),
      },
    ],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", PILL_COLOR],
    ),
    paddingHorizontal: interpolate(progress.value, [0, 1], [0, 14]),
    borderRadius: 999,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
    maxWidth: interpolate(progress.value, [0, 1], [0, 72]),
    marginLeft: interpolate(progress.value, [0, 1], [0, 5]),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-6, 0]),
      },
    ],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inactiveColor = colors.text + "B3"; // ~70% opacity — clear but still secondary to the active tab

  return (
    <AnimatedPressable
      style={[styles.root, pressStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Animated.View style={[styles.pill, pillStyle]}>
        <Animated.View style={iconStyle}>
          <Ionicons
            name={focused ? iconNameActive : iconName}
            size={24}
            color={focused ? ACTIVE_COLOR : inactiveColor}
          />
        </Animated.View>
        <Animated.Text
          numberOfLines={1}
          style={[styles.label, { color: ACTIVE_COLOR }, labelStyle]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    minHeight: 52,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    overflow: "hidden",
  },
  label: {
    fontSize: FontSizes.xs + 1,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.1,
    overflow: "hidden",
  },
});
