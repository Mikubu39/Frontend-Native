/**
 * RarityFrame - The shop's signature container: a beveled, rarity-tinted
 * plate. Legendary items get a slow foil sweep across the face; every other
 * tier stays still, so the sweep still means something when you see it.
 */

import React, { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { RARITY_STYLES } from "@/constants/shop";
import { BorderRadius } from "@/constants/theme";
import type { ItemRarity } from "@/types/shop";

const BEVEL_HEIGHT = 5;
const SWEEP_WIDTH = 90;

interface RarityFrameProps {
  rarity: ItemRarity;
  /** Face colour — the shop passes the themed card colour. */
  surface: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  radius?: number;
  /** Dims the plate for items the player cannot afford. */
  muted?: boolean;
}

function FoilSweep({ accent }: { accent: string }) {
  const [width, setWidth] = useState(0);
  const offset = useSharedValue(-SWEEP_WIDTH);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (width === 0 || reduceMotion) return;

    offset.value = -SWEEP_WIDTH;
    offset.value = withRepeat(
      withTiming(width + SWEEP_WIDTH, {
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );

    return () => cancelAnimation(offset);
  }, [offset, reduceMotion, width]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { rotateZ: "18deg" }],
  }));

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.sweep, sweepStyle]}>
        <LinearGradient
          colors={["transparent", accent + "44", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export const RarityFrame = React.memo(function RarityFrame({
  rarity,
  surface,
  children,
  style,
  faceStyle,
  radius = BorderRadius.md,
  muted = false,
}: RarityFrameProps) {
  const tier = RARITY_STYLES[rarity];

  return (
    <View
      style={[
        styles.bevel,
        { backgroundColor: tier.accentDeep, borderRadius: radius },
        muted && styles.muted,
        style,
      ]}
    >
      <View
        style={[
          styles.face,
          {
            backgroundColor: surface,
            borderColor: tier.accent,
            borderRadius: radius,
          },
          faceStyle,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tier.wash, borderRadius: radius - 2 },
          ]}
        />
        {tier.foil && !muted ? <FoilSweep accent={tier.accent} /> : null}
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bevel: {
    paddingBottom: BEVEL_HEIGHT,
  },
  face: {
    borderWidth: 1.5,
    overflow: "hidden",
  },
  muted: {
    opacity: 0.55,
  },
  sweep: {
    position: "absolute",
    top: -40,
    bottom: -40,
    width: SWEEP_WIDTH,
  },
});
