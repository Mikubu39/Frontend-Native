/**
 * ShopSkeleton - Placeholder shelves shown while the catalogue loads, so the
 * layout does not jump once the real items arrive.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { BorderRadius, Spacing } from "@/constants/theme";

const PLACEHOLDER_COUNT = 4;

interface ShopSkeletonProps {
  blockColor: string;
}

export function ShopSkeleton({ blockColor }: ShopSkeletonProps) {
  const pulse = useSharedValue(0.45);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    pulse.value = withRepeat(
      withTiming(0.9, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.grid} accessibilityLabel="Đang tải cửa hàng">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <View key={index} style={styles.slot}>
          <Animated.View
            style={[styles.tile, { backgroundColor: blockColor }, pulseStyle]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.five - 6,
  },
  slot: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: Spacing.three,
  },
  tile: {
    height: 208,
    borderRadius: BorderRadius.md,
  },
});
