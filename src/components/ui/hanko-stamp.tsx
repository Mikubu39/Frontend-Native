/**
 * HankoStamp - The system's signature completion mark: a hanko (personal
 * seal) stamping down in shu-iro vermillion, standing in for the generic
 * checkmark-in-a-circle every gamified app reaches for. Reserved for real
 * completion moments (achievement unlocked, lesson finished) — not routine
 * multiple-choice selection.
 *
 * The ring is drawn from two arcs with a slightly uneven radius so it reads
 * as hand-carved rather than a perfect vector circle.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";

interface HankoStampProps {
  size?: number;
  delay?: number;
  color?: string;
}

// A ring path with a deliberately uneven radius (not a perfect circle) —
// four arcs whose control points wobble a few px off a true circle.
function buildSealRing(cx: number, cy: number, r: number) {
  const wobble = r * 0.045;
  const pts = [0, 90, 180, 270].map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const rr = r + (i % 2 === 0 ? wobble : -wobble);
    return { x: cx + rr * Math.cos(rad), y: cy + rr * Math.sin(rad) };
  });
  return `M ${pts[0].x} ${pts[0].y} Q ${cx + r * 1.06} ${cy - r * 0.02} ${pts[1].x} ${pts[1].y} Q ${cx + r * 0.02} ${cy + r * 1.06} ${pts[2].x} ${pts[2].y} Q ${cx - r * 1.06} ${cy + r * 0.02} ${pts[3].x} ${pts[3].y} Q ${cx - r * 0.02} ${cy - r * 1.06} ${pts[0].x} ${pts[0].y} Z`;
}

export function HankoStamp({
  size = 96,
  delay = 0,
  color = Colors.secondary,
}: HankoStampProps) {
  const stampScale = useSharedValue(1.7);
  const stampOpacity = useSharedValue(0);
  const stampRotate = useSharedValue(-10);
  const bleedScale = useSharedValue(0.8);
  const bleedOpacity = useSharedValue(0);

  useEffect(() => {
    stampOpacity.value = withDelay(delay, withTiming(1, { duration: 60 }));
    stampRotate.value = withDelay(
      delay,
      withSequence(
        withTiming(-10, { duration: 0 }),
        withSpring(0, { damping: 9, stiffness: 220, mass: 0.7 }),
      ),
    );
    stampScale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.7, { duration: 0 }),
        withSpring(1, { damping: 10, stiffness: 260, mass: 0.7 }),
      ),
    );
    bleedOpacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.35, { duration: 90 }),
        withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
      ),
    );
    bleedScale.value = withDelay(
      delay,
      withTiming(1.4, { duration: 550, easing: Easing.out(Easing.quad) }),
    );

    const t = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampOpacity.value,
    transform: [
      { scale: stampScale.value },
      { rotate: `${stampRotate.value}deg` },
    ],
  }));

  const bleedStyle = useAnimatedStyle(() => ({
    opacity: bleedOpacity.value,
    transform: [{ scale: bleedScale.value }],
  }));

  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.center, bleedStyle]}
      >
        <View
          style={[
            styles.bleed,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </Animated.View>
      <Animated.View style={[styles.center, stampStyle]}>
        <Svg width={size} height={size}>
          <Path
            d={buildSealRing(cx, cy, r)}
            fill="none"
            stroke={color}
            strokeWidth={size * 0.07}
          />
          <Circle cx={cx} cy={cy} r={r * 0.42} fill={color} opacity={0.14} />
        </Svg>
        <View style={StyleSheet.absoluteFillObject}>
          <Svg width={size} height={size}>
            <Path
              d={`M ${cx - r * 0.3} ${cy + r * 0.08} L ${cx - r * 0.06} ${cy + r * 0.32} L ${cx + r * 0.34} ${cy - r * 0.26}`}
              fill="none"
              stroke={color}
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
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
  bleed: {
    opacity: 0.5,
  },
});
