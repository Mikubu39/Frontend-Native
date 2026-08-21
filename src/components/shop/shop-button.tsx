/**
 * ShopButton - Chunky beveled action button used by the shop's sheets.
 * The 4px lip under the face is what makes a press feel like it has travel.
 */

import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ShopPalette } from "@/constants/shop";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

type ShopButtonTone = "gold" | "lacquer" | "ghost";

interface ShopButtonProps {
  label: string;
  onPress: () => void;
  tone?: ShopButtonTone;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Rendered between the icon and the label — the price coin, usually. */
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  ghostColor?: string;
}

const TONES: Record<
  ShopButtonTone,
  { face: string; lip: string; ink: string }
> = {
  gold: {
    face: ShopPalette.goldLeaf,
    lip: ShopPalette.goldDeep,
    ink: ShopPalette.lacquerDeep,
  },
  lacquer: {
    face: ShopPalette.lacquer,
    lip: "#080512",
    ink: ShopPalette.inkOnLacquer,
  },
  ghost: {
    face: "transparent",
    lip: "transparent",
    ink: ShopPalette.inkOnLacquerMuted,
  },
};

export function ShopButton({
  label,
  onPress,
  tone = "gold",
  icon,
  disabled = false,
  loading = false,
  leading,
  style,
  ghostColor,
}: ShopButtonProps) {
  const palette = TONES[tone];
  const ink = tone === "ghost" && ghostColor ? ghostColor : palette.ink;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      pressScale={0.97}
      accessibilityLabel={label}
      style={[
        styles.lip,
        { backgroundColor: palette.lip },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.face, { backgroundColor: palette.face }]}>
        {loading ? (
          <ActivityIndicator size="small" color={ink} />
        ) : (
          <>
            {icon ? (
              <Ionicons name={icon as any} size={17} color={ink} />
            ) : null}
            {leading}
            <Text style={[styles.label, { color: ink }]}>{label}</Text>
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  lip: {
    borderRadius: BorderRadius.md,
    paddingBottom: 4,
  },
  face: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
