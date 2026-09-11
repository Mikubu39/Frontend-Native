/**
 * InkBloom — the app's signature reward moment.
 *
 * A drop of sumi ink landing on washi: it hits at full darkness, then creeps
 * outward along the paper fibres and thins as it goes. Three blots of slightly
 * different shape and timing overlap, because a single expanding circle reads
 * as a UI ripple and the whole point is that this reads as ink.
 *
 * It fires only on a correct answer. A wrong answer gets no bloom at all —
 * the page stays blank. That asymmetry is the idea: ink is what you earn.
 *
 * Cost: the blot outlines are static SVG built once per mount. Only the
 * wrapper's `transform` and `opacity` animate, so the whole effect is two
 * shared values on the UI thread with zero React re-renders and no repaint of
 * the vector itself.
 */

import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";
import { bleedOpacity, bleedScale, MotionDuration } from "@/constants/motion";

interface InkBloomProps {
  /** Change this value to fire the bloom. Fires again on every change. */
  trigger: number;
  color: string;
  /** Diameter of the largest blot in px. */
  size?: number;
  /** Peak opacity of the darkest blot. */
  intensity?: number;
  /** Hold the bloom back by this many ms — used to land it on an impact. */
  delay?: number;
}

/**
 * A closed blob whose radius wanders, smoothed with quadratic segments through
 * the midpoints so the outline stays continuous. `seed` makes each blot a
 * different shape while keeping every render of the same blot identical.
 */
function buildBlot(radius: number, points: number, seed: number): string {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    // Two out-of-phase sines give an irregular but organic radius; a random
    // one per point would produce spikes rather than lobes.
    const wobble =
      1 +
      0.16 * Math.sin(angle * 3 + seed) +
      0.09 * Math.sin(angle * 5 + seed * 2.3);
    pts.push({
      x: radius + radius * wobble * 0.78 * Math.cos(angle),
      y: radius + radius * wobble * 0.78 * Math.sin(angle),
    });
  }

  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const start = mid(pts[pts.length - 1], pts[0]);
  let d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;
  for (let i = 0; i < pts.length; i++) {
    const control = pts[i];
    const end = mid(pts[i], pts[(i + 1) % pts.length]);
    d += ` Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

// Three blots of decreasing size stacked on one another. Where they overlap
// the fill compounds, so the centre is dark and the edge feathers out — the
// same falloff a real blot has, without needing a gradient or a blur.
const BLOTS = [
  { seed: 1.1, points: 9, scale: 1, opacity: 1 },
  { seed: 2.7, points: 11, scale: 0.74, opacity: 0.72 },
  { seed: 4.3, points: 8, scale: 0.53, opacity: 0.5 },
];

export function InkBloom({
  trigger,
  color,
  size = 220,
  intensity = 0.22,
  delay = 0,
}: InkBloomProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0.35);
  const opacity = useSharedValue(0);

  const paths = useMemo(
    () => BLOTS.map((b) => buildBlot(size / 2, b.points, b.seed)),
    [size],
  );

  useEffect(() => {
    if (trigger <= 0) return;
    scale.value = 0.35;
    scale.value = withDelay(
      delay,
      bleedScale(1, MotionDuration.bleed, reduceMotion),
    );
    opacity.value = withDelay(
      delay,
      bleedOpacity(intensity, MotionDuration.bleed, reduceMotion),
    );
  }, [trigger, intensity, delay, reduceMotion, scale, opacity]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.wrap, { width: size, height: size }, wrapStyle]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {BLOTS.map((blot, i) => (
        <View
          key={blot.seed}
          style={[
            StyleSheet.absoluteFillObject,
            styles.blot,
            { opacity: blot.opacity, transform: [{ scale: blot.scale }] },
          ]}
        >
          <Svg width={size} height={size}>
            <Path d={paths[i]} fill={color} />
          </Svg>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  blot: {
    alignItems: "center",
    justifyContent: "center",
  },
});
