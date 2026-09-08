/**
 * InterestGrid - 2-column image grid for interest selection.
 */

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ONBOARDING_INTERESTS } from "@/data";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Fonts,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface InterestGridProps {
  selectedInterests: string[];
  onToggle: (id: string) => void;
}

export function InterestGrid({
  selectedInterests,
  onToggle,
}: InterestGridProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.grid}>
      {ONBOARDING_INTERESTS.map((interest) => {
        const isSelected = selectedInterests.includes(interest.id);
        const imageSource =
          interest.imageSource ??
          (interest.imageUrl ? { uri: interest.imageUrl } : undefined);
        return (
          <AnimatedPressable
            key={interest.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: isSelected ? Colors.secondary : colors.border,
              },
              isSelected && styles.cardSelected,
            ]}
            onPress={() => onToggle(interest.id)}
            pressScale={0.96}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={interest.label}
          >
            {imageSource ? (
              <Image source={imageSource} style={styles.image} />
            ) : null}
            {isSelected && (
              <View style={styles.overlay}>
                <Animated.View
                  entering={ZoomIn.duration(200).springify()}
                  style={styles.checkCircle}
                >
                  <Text style={styles.checkMark}>✓</Text>
                </Animated.View>
              </View>
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isSelected
                    ? isDark
                      ? "#D97456"
                      : Colors.secondary
                    : colors.text,
                },
              ]}
            >
              {interest.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.four,
    justifyContent: "center",
  },
  card: {
    width: "46%",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  cardSelected: {
    borderColor: Colors.secondary,
  },
  image: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(190, 74, 52, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    height: 110,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
});
