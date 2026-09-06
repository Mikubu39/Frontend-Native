/**
 * SocialButton - Social auth button (Google, Facebook, Apple).
 * Enhanced with AnimatedPressable for press feedback and improved styling.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SocialProvider = "google" | "facebook" | "apple";

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const PROVIDER_CONFIG: Record<
  SocialProvider,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    iconColor: string;
    bgColor: string;
  }
> = {
  google: {
    icon: "logo-google",
    label: "Google",
    iconColor: "#DB4437",
    bgColor: "#FEE2E2",
  },
  facebook: {
    icon: "logo-facebook",
    label: "Facebook",
    iconColor: "#4267B2",
    bgColor: "#DBEAFE",
  },
  apple: {
    icon: "logo-apple",
    label: "Apple",
    iconColor: "#000000",
    bgColor: "#F3F4F6",
  },
};

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const config = PROVIDER_CONFIG[provider];
  const colors = useTheme();

  return (
    <AnimatedPressable
      style={[
        styles.button,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      pressScale={0.97}
      accessibilityRole="button"
      accessibilityLabel={`Đăng nhập bằng ${config.label}`}
      accessibilityHint={`Chuyển đến màn hình xác thực tài khoản ${config.label}`}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: config.bgColor }]}
        accessible={false}
        importantForAccessibility="no"
      >
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>
        Đăng nhập bằng {config.label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.six,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  iconOnly: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
