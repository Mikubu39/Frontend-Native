/**
 * CharacterPreviewPanel - Thẻ chi tiết chữ cái đang chọn: phiên âm, phát âm
 * và mức thông thạo hiện tại.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { darken } from "@/utils/color";
import { AlphabetCharacter, MAX_MASTERY_LEVEL } from "@/types/alphabet";
import { clampMasteryLevel, getMasteryPalette } from "./mastery";

interface CharacterPreviewPanelProps {
  character: AlphabetCharacter;
  isPlaying?: boolean;
  onPlayAudio: () => void;
  onClose: () => void;
}

export function CharacterPreviewPanel({
  character,
  isPlaying = false,
  onPlayAudio,
  onClose,
}: CharacterPreviewPanelProps) {
  const { colors, isDark } = useTheme();
  const level = clampMasteryLevel(character.masteryLevel);
  const palette = getMasteryPalette(level);
  const hasAudio = !!character.audioUrl;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: Colors.primary },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Text style={styles.label}>KÝ TỰ ĐANG CHỌN</Text>
        <AnimatedPressable
          onPress={onClose}
          pressScale={0.9}
          accessibilityLabel="Đóng chi tiết chữ cái"
        >
          <View
            style={[
              styles.closeCircle,
              { backgroundColor: isDark ? "#2A2A3E" : Colors.lockedBg },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </View>
        </AnimatedPressable>
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.symbolBox,
            {
              backgroundColor: isDark ? "#232338" : Colors.cream,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={styles.symbol}>{character.symbol}</Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.romaji, { color: colors.text }]}>
            Phiên âm: /{character.romaji}/
          </Text>

          <View style={styles.masteryRow}>
            <Text style={[styles.masteryLabel, { color: palette.accent }]}>
              {palette.label}
            </Text>
            <View style={styles.pipRow}>
              {Array.from({ length: MAX_MASTERY_LEVEL }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pip,
                    {
                      backgroundColor:
                        index < level ? palette.accent : colors.borderSubtle,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <AnimatedPressable
            style={[styles.audioButton, !hasAudio && styles.audioDisabled]}
            onPress={onPlayAudio}
            disabled={!hasAudio}
            pressScale={0.95}
            accessibilityLabel={`Nghe phát âm chữ ${character.symbol}`}
          >
            <Ionicons
              name={isPlaying ? "volume-high" : "volume-medium"}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.audioText}>
              {hasAudio ? "Nghe phát âm" : "Chưa có audio"}
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    borderWidth: 2,
    marginBottom: Spacing.five,
    ...Shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 11,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.six,
  },
  symbolBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  symbol: {
    fontSize: 44,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  romaji: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  masteryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  masteryLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pipRow: {
    flexDirection: "row",
    gap: 3,
  },
  pip: {
    width: 14,
    height: 4,
    borderRadius: 2,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    // Same physical edge as the primary button, not a coloured halo.
    borderBottomWidth: 3,
    borderBottomColor: darken(Colors.primary, 0.28),
  },
  audioDisabled: {
    backgroundColor: Colors.locked,
  },
  audioText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
});
