/**
 * AudioButton - Circular button for audio playback.
 * Yellow variant for speaker, pink variant for microphone.
 */

import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface AudioButtonProps {
  variant?: "speaker" | "mic";
  size?: "small" | "medium" | "large";
  onPress: () => void;
  label?: string;
  isPlaying?: boolean;
}

const SIZE_MAP = {
  small: 40,
  medium: 64,
  large: 130,
} as const;

export function AudioButton({
  variant = "speaker",
  size = "small",
  onPress,
  label,
  isPlaying = false,
}: AudioButtonProps) {
  const { colors } = useTheme();
  const buttonSize = SIZE_MAP[size];
  const isSpeaker = variant === "speaker";
  const bgColor = isPlaying
    ? isSpeaker
      ? Colors.accentLight
      : Colors.secondaryLight
    : isSpeaker
      ? Colors.accent
      : Colors.secondaryLight;
  const iconSize = size === "large" ? 48 : size === "medium" ? 32 : 18;

  return (
    <View style={styles.wrapper}>
      {size === "large" && (
        <View
          style={[
            styles.outerRing,
            {
              width: buttonSize + 40,
              height: buttonSize + 40,
              borderRadius: (buttonSize + 40) / 2,
              backgroundColor: isSpeaker
                ? Colors.accentPale
                : Colors.secondaryLight + "66",
            },
          ]}
        />
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: bgColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="button"
        accessibilityLabel={
          label ||
          (isSpeaker
            ? isPlaying
              ? "Đang phát âm thanh mẫu"
              : "Phát âm thanh mẫu"
            : isPlaying
              ? "Đang thu âm phát âm"
              : "Bấm để thu âm phát âm")
        }
        accessibilityState={{ busy: isPlaying }}
      >
        <Ionicons
          name={isSpeaker ? "volume-high" : "mic"}
          size={iconSize}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  outerRing: {
    position: "absolute",
    opacity: 0.4,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.two,
  },
});
