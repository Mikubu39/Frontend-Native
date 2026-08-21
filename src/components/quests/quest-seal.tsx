/**
 * QuestSeal - The vermilion stamp that lands on a finished quest. It is the
 * one loud thing on the board: everything else stays still so the stamp
 * still means something when you see it.
 *
 * The mark is carved from paths rather than typed as a glyph — the default
 * font renders small CJK as an empty box on some Android builds, and this
 * has to stay readable at 34px.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { QuestPalette } from "@/constants/quests";

interface QuestSealProps {
  size?: number;
  /** Staggered so seals land one after another, not all at once. */
  delay?: number;
}

export function QuestSeal({ size = 34, delay = 0 }: QuestSealProps) {
  const stamp = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      stamp.value = 1;
      return;
    }

    stamp.value = 0;
    stamp.value = withDelay(
      delay,
      withSpring(1, { damping: 11, stiffness: 230, mass: 0.6 }),
    );
  }, [delay, reduceMotion, stamp]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, stamp.value * 1.6),
    transform: [
      { scale: 1 + (1 - stamp.value) * 0.85 },
      { rotate: `${-9 * stamp.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={stampStyle}
      accessibilityRole="image"
      accessibilityLabel="Đã đóng dấu hoàn thành"
    >
      <View style={styles.ink}>
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <Rect
            x={1.5}
            y={1.5}
            width={37}
            height={37}
            rx={10}
            fill={QuestPalette.seal}
          />
          <Rect
            x={6}
            y={6}
            width={28}
            height={28}
            rx={6}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.5}
            strokeWidth={1.6}
          />
          <Path
            d="M12.6 20.8 L17.8 26 L27.6 14.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /** A touch of bleed under the stamp, the way real ink sits on paper. */
  ink: {
    shadowColor: QuestPalette.sealDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
});
