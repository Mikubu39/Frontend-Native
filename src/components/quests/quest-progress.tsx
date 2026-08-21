/**
 * QuestProgress - The bar under a quest title. The counter sits beside the
 * bar, not centred inside it: at 10px on a 16px track the old placement was
 * unreadable against the fill.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

interface QuestProgressProps {
  /** 0–100. */
  pct: number;
  current: number;
  target: number;
  /** Fill colour — the rail violet, or gold once the quest is done. */
  tone: string;
  trackColor: string;
  counterColor: string;
  delay?: number;
}

export function QuestProgress({
  pct,
  current,
  target,
  tone,
  trackColor,
  counterColor,
  delay = 0,
}: QuestProgressProps) {
  const fill = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      fill.value = pct;
      return;
    }

    fill.value = withDelay(
      delay,
      withTiming(pct, { duration: 620, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, fill, pct, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <View style={styles.row}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: tone }, fillStyle]}
        />
      </View>
      <Text
        style={[styles.counter, { color: counterColor }]}
        accessibilityLabel={`${current} trên ${target}`}
      >
        {current}/{target}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  track: {
    flex: 1,
    height: 9,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  counter: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    fontVariant: ["tabular-nums"],
    minWidth: 46,
    textAlign: "right",
  },
});
