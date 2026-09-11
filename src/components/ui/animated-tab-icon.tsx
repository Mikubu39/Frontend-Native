/**
 * AnimatedTabIcon - Polished animated tab bar icon with refined spring bounce.
 * Shows active/inactive images, animates scale on tab switch,
 * and includes a subtle active dot indicator.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AnimationPresets, Colors } from "@/constants/theme";

interface AnimatedTabIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
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
        withTiming(0.85, { duration: 80 }),
        withSpring(1.2, AnimationPresets.springTab),
        withSpring(1.0, AnimationPresets.springSnappy),
      );
      translateY.value = withSpring(-4, AnimationPresets.springTab);
      dotOpacity.value = withSpring(1, AnimationPresets.springSnappy);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      scale.value = withTiming(0.85, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
      dotOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [focused, dotOpacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const dotStyle = useAnimatedStyle(() => {
    return {
      opacity: dotOpacity.value,
      transform: [{ scale: dotOpacity.value }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Ionicons
          name={iconName}
          size={size - 4}
          color={focused ? Colors.tabActive : Colors.tabInactive}
        />
      </Animated.View>
      {/* Active Dot Indicator */}
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 30, // Fixed height to prevent layout shifts
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tabActive,
    marginTop: 2,
    position: "absolute",
    bottom: -4,
  },
});
