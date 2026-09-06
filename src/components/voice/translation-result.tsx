/**
 * TranslationResult - Renders source text and translated output with romaji and play control.
 * Figma screen 34
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { AudioButton } from "../ui/audio-button";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";

interface TranslationResultProps {
  sourceText: string;
  sourceLangName?: string;
  translatedText: string;
  translatedRomaji?: string;
  targetLangName?: string;
}

export function TranslationResult({
  sourceText,
  sourceLangName = "English",
  translatedText,
  translatedRomaji,
  targetLangName = "Japanese",
}: TranslationResultProps) {
  const { isPlaying, play } = useAudio();
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Source Language Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.langLabel, { color: colors.textSecondary }]}>
          {sourceLangName}
        </Text>
        <Text style={[styles.mainText, { color: colors.text }]}>
          {sourceText}
        </Text>
      </View>

      {/* Target Language Card */}
      <View
        style={[
          styles.card,
          styles.targetCard,
          {
            backgroundColor: isDark
              ? Colors.primary + "22"
              : Colors.primary + "11",
          },
        ]}
      >
        <View style={styles.targetHeader}>
          <Text style={[styles.langLabel, { color: colors.textSecondary }]}>
            {targetLangName}
          </Text>
          <AudioButton isPlaying={isPlaying} onPress={play} size="small" />
        </View>
        <Text
          style={[
            styles.mainText,
            styles.targetText,
            { color: isDark ? Colors.primaryLight : Colors.primaryDark },
          ]}
        >
          {translatedText}
        </Text>
        {translatedRomaji && (
          <Text style={[styles.romajiText, { color: colors.textSecondary }]}>
            {translatedRomaji}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.four,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.creamDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  targetCard: {
    borderColor: Colors.primaryLight,
  },
  targetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  langLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  mainText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  targetText: {
    color: Colors.primaryDark,
  },
  romajiText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginTop: Spacing.one,
  },
});
