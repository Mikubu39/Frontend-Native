/**
 * LevelSelector - Level selection cards for onboarding.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ONBOARDING_LEVELS } from "@/data";
import type { OnboardingLevelId } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface LevelSelectorProps {
  selectedLevel: OnboardingLevelId | null;
  onSelect: (level: OnboardingLevelId) => void;
}

export function LevelSelector({ selectedLevel, onSelect }: LevelSelectorProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {ONBOARDING_LEVELS.map((level) => {
        const isSelected = selectedLevel === level.id;
        const cardBg = isSelected
          ? isDark
            ? Colors.primary + "30"
            : "#E8EAF4"
          : colors.card;
        const borderColor = isSelected ? Colors.primary : colors.border;

        return (
          <AnimatedPressable
            key={level.id}
            testID={`level-card-${level.id}`}
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
            onPress={() => onSelect(level.id)}
            pressScale={0.97}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.content}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isSelected
                      ? isDark
                        ? "#FFFFFF"
                        : Colors.primaryDark
                      : colors.text,
                  },
                ]}
              >
                {level.title}
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: isSelected
                      ? isDark
                        ? "rgba(255,255,255,0.85)"
                        : Colors.primary
                      : colors.textSecondary,
                  },
                ]}
              >
                {level.description}
              </Text>
            </View>

            {isSelected && (
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
  },
  card: {
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderBottomWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  description: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.sans,
    lineHeight: 20,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.three,
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: FontWeights.extrabold,
  },
});
