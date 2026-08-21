/**
 * BoardSkeleton - Placeholder stations while the board loads, laid out on
 * the same gutter as the real ones so the rail does not jump into place.
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
import { RailMetrics } from "@/constants/quests";
import { BorderRadius, Spacing } from "@/constants/theme";

const PLACEHOLDER_COUNT = 3;

interface BoardSkeletonProps {
  blockColor: string;
}

export function BoardSkeleton({ blockColor }: BoardSkeletonProps) {
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
    <View style={styles.list} accessibilityLabel="Đang tải bảng nhiệm vụ">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.gutter}>
            <Animated.View
              style={[styles.node, { backgroundColor: blockColor }, pulseStyle]}
            />
          </View>
          <Animated.View
            style={[styles.plate, { backgroundColor: blockColor }, pulseStyle]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.five,
  },
  row: {
    flexDirection: "row",
    paddingBottom: Spacing.three,
  },
  gutter: {
    width: RailMetrics.gutter,
    alignItems: "center",
    paddingTop: 29,
  },
  node: {
    width: RailMetrics.nodeSize,
    height: RailMetrics.nodeSize,
    borderRadius: RailMetrics.nodeSize / 2,
  },
  plate: {
    flex: 1,
    height: 118,
    marginLeft: Spacing.two,
    borderRadius: BorderRadius.md,
  },
});
