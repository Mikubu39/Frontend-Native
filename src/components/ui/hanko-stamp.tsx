/**
 * HankoStamp - The system's signature completion mark: a hanko (personal
 * seal) stamping down in shu-iro vermillion, standing in for the generic
 * checkmark-in-a-circle every gamified app reaches for. Reserved for real
 * completion moments (achievement unlocked, lesson finished) — not routine
 * multiple-choice selection.
 *
 * The ring is a clean circular seal, paired with an organic press motion
 * and subtle ink bleed.
 *
 * The motion is a press, not a bounce: the seal hovers, drops hard, and stops.
 * It also lands a couple of degrees off true and stays there, because a hanko
 * pressed by a hand never comes down square — settling it to exactly 0° is the
 * detail that gives the whole thing away as a computer drawing a circle.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { InkBloom } from "@/components/ui/ink-bloom";
import { MotionEasing, sealPress } from "@/constants/motion";
import { Colors } from "@/constants/theme";

/**
 * Wind-up plus drop, from `sealPress`: how long after its `delay` the seal
 * actually touches paper. Exported so a screen can hang its own beats — and
 * its sound — off the impact instead of guessing at a delay.
 */
export const HANKO_LANDING_MS = 220;

interface HankoStampProps {
  size?: number;
  delay?: number;
  color?: string;
}

export function HankoStamp({
  size = 96,
  delay = 0,
  color = Colors.secondary,
}: HankoStampProps) {
  const reduceMotion = useReducedMotion();
  const stampScale = useSharedValue(1.55);
  const stampOpacity = useSharedValue(0);
  const stampRotate = useSharedValue(-11);

  useEffect(() => {
    stampOpacity.value = withDelay(delay, withTiming(1, { duration: 50 }));
    stampRotate.value = withDelay(
      delay,
      withSequence(
        withTiming(-11, { duration: 0 }),
        // Tilts a touch further as it is pushed down, then stops short of
        // square — the impression a hand leaves, not one a machine leaves.
        withTiming(-13, { duration: 110, easing: MotionEasing.gather }),
        withTiming(-2.4, { duration: 130, easing: MotionEasing.press }),
      ),
    );
    stampScale.value = sealPress(delay, reduceMotion);

    // Fire the haptic when the seal actually meets the paper — one gather
    // plus the drop — not at the start of the wind-up.
    const t = setTimeout(
      () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      },
      delay + (reduceMotion ? 0 : HANKO_LANDING_MS),
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, reduceMotion]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampOpacity.value,
    transform: [
      { scale: stampScale.value },
      { rotate: `${stampRotate.value}deg` },
    ],
  }));

  const ringStroke = size * 0.07;
  const checkStroke = size * 0.08;
  const cx = size / 2;
  const cy = size / 2;
  // Radius of the circle: ensure stroke never clips beyond the SVG canvas [0, size]
  const r = (size - ringStroke) / 2 - 1.5;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Ink pushed out from under the seal. Irregular, like the ring — a
          perfectly round halo was the one thing here still reading as vector. */}
      <View style={[StyleSheet.absoluteFillObject, styles.center]}>
        <InkBloom
          trigger={1}
          color={color}
          size={size * 1.35}
          intensity={0.3}
          delay={delay + HANKO_LANDING_MS}
        />
      </View>
      <Animated.View style={[styles.center, stampStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={ringStroke}
          />
          <Circle cx={cx} cy={cy} r={r * 0.42} fill={color} opacity={0.14} />
          <Path
            d={`M ${cx - r * 0.3} ${cy + r * 0.08} L ${cx - r * 0.06} ${cy + r * 0.32} L ${cx + r * 0.34} ${cy - r * 0.26}`}
            fill="none"
            stroke={color}
            strokeWidth={checkStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
