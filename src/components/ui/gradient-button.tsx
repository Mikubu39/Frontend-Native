/**
 * The app's primary action button.
 *
 * Flat ink with a darker bottom edge — the side of a physical key. Pressing
 * pushes the key down. That edge is the only ornament, and it does a job.
 *
 * What was removed, and why it mattered — an earlier version stacked five
 * effects on one control (diagonal gradient, a painted specular highlight, a
 * coloured glow at 0.5 opacity, a text shadow, and a scale-down) and only the
 * last carried any meaning. Four "premium" treatments on every button in the
 * app is the loudest tell of a generated interface: when every control is
 * treated as special, none of them is. `constants/theme.ts` already said
 * gradients were "reserved for genuine celebration moments (splash, quiz
 * result) rather than repeated on every surface" — this file was the reason
 * that was not true. Gradients still live on the splash, the result backdrop
 * and the promotion modal, where an arrival is actually being marked.
 *
 * The edge is a border on the button itself rather than a second view showing
 * through from behind. Two stacked views cannot share one rounded corner: the
 * lower view's arc bulges outside the upper view's arc for the whole height of
 * the radius, so a 4px edge under a 20px corner read as a frame running up
 * both sides. A border is drawn inside the box and follows the radius exactly.
 *
 * The name is kept for now because thirty screens import it; renaming is
 * mechanical churn better done on its own.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { MotionDuration, MotionEasing } from "@/constants/motion";
import { darken } from "@/utils/color";
import React from "react";
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Height of the key's side. */
const EDGE = 5;

/** How far the key travels when pressed. Just under the edge, so it reads as
 *  sinking onto its base rather than sliding down the screen. */
const TRAVEL = 3;

/** How much darker the edge is than the face. */
const EDGE_DARKEN = 0.3;

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  /**
   * `primary` / `secondary` / `accent` are solid keys. `outline` is a bordered
   * key for a secondary choice. `ghost` is a bare text action — no border, no
   * edge — for the quiet third option in a dialog ("Để sau", "Thoát").
   */
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /**
   * Override the face colour. Historically a gradient pair; only the first
   * colour is used now, and the edge is derived from it so any colour a call
   * site passes gets the same physical relationship.
   */
  customColors?: [string, string];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function GradientButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  customColors,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: GradientButtonProps) {
  const pressed = useSharedValue(0);
  const isInert = disabled || loading;
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isSolid = !isOutline && !isGhost;

  // The key travels down. Scaling as well would be two answers to the same
  // question, and travel is the one that matches the shape.
  const keyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * TRAVEL }],
  }));

  const press = (to: number) => {
    if (isInert) return;
    pressed.value = withTiming(to, {
      duration: MotionDuration.tick,
      easing: MotionEasing.snap,
    });
  };

  const faceColor =
    customColors?.[0] ??
    (variant === "accent"
      ? Colors.accent
      : variant === "secondary"
        ? Colors.secondary
        : Colors.primary);

  const surfaceStyle: ViewStyle = isGhost
    ? { backgroundColor: "transparent" }
    : isOutline
      ? {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: Colors.primary,
          // A disabled control should not look pressable, so it sits flush.
          borderBottomWidth: isInert ? 2 : EDGE,
        }
      : {
          backgroundColor: faceColor,
          borderBottomWidth: isInert ? 0 : EDGE,
          borderBottomColor: darken(faceColor, EDGE_DARKEN),
        };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={() => press(1)}
      onPressOut={() => press(0)}
      disabled={isInert}
      disableAnimation
      style={[isInert && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInert, busy: loading }}
    >
      <Animated.View
        testID={testID ? `${testID}-surface` : undefined}
        style={[styles.button, surfaceStyle, keyStyle]}
      >
        {loading ? (
          <ActivityIndicator
            color={isSolid ? Colors.textOnDark : Colors.primary}
          />
        ) : (
          <Text
            style={[
              styles.label,
              isSolid ? styles.solidLabel : styles.quietLabel,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.seven,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  label: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.rounded,
    letterSpacing: 0.5,
  },
  solidLabel: {
    color: Colors.textOnDark,
    fontWeight: FontWeights.extrabold,
  },
  // Ink on the page's own background, so it stays legible in both themes —
  // unlike the old outline button, which painted a fixed cream face and turned
  // into a white slab in dark mode.
  quietLabel: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  disabled: {
    opacity: 0.45,
  },
});
