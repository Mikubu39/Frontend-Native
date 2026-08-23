/**
 * FlashcardQuestion — Impeccable redesign. Theme-aware 3D flip card.
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import type { FlashcardQuestion } from "@/types";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { AudioButton } from "@/components/ui/audio-button";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/theme-context";
import { Ionicons } from "@expo/vector-icons";

interface FlashcardQuestionProps {
  question: FlashcardQuestion;
  onAnswerChange: (isCorrect: boolean) => void;
}

export function FlashcardQuestionCard({
  question,
  onAnswerChange,
}: FlashcardQuestionProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useSharedValue(0);
  const { colors, isDark } = useTheme();

  const handleFlip = () => {
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    flipAnim.value = withSpring(nextFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });

    if (nextFlipped) {
      onAnswerChange(true);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnim.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: flipAnim.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(flipAnim.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: flipAnim.value >= 90 ? 1 : 0,
    };
  });

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : colors.border;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.instruction,
          { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary },
        ]}
      >
        {question.instruction}
      </Text>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFlip}
        style={styles.cardContainer}
      >
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
            frontAnimatedStyle,
          ]}
        >
          <Text
            style={[
              styles.frontText,
              { color: isDark ? "#F9FAFB" : Colors.textPrimary },
            ]}
          >
            {question.frontText}
          </Text>
          {!flipped && (
            <View style={styles.tapHintRow}>
              <Ionicons
                name="refresh"
                size={14}
                color={isDark ? "rgba(255,255,255,0.3)" : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.tapHintInline,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.3)"
                      : Colors.textSecondary,
                  },
                ]}
              >
                Chạm để lật thẻ
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Back */}
        <Animated.View style={[styles.card, backAnimatedStyle]}>
          <LinearGradient
            colors={[Colors.primary + "22", Colors.secondary + "18"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.cardBackInner, { borderColor: cardBorder }]}>
            <Text
              style={[
                styles.backText,
                { color: isDark ? Colors.primaryLight : Colors.primaryDark },
              ]}
            >
              {question.backText}
            </Text>
            {question.audioUrl && (
              <View style={styles.audioWrapper}>
                <AudioButton
                  variant="speaker"
                  size="small"
                  onPress={() => {}}
                />
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  instruction: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardContainer: {
    width: 280,
    height: 380,
    position: "relative",
    transform: [{ perspective: 1000 }],
  },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    overflow: "hidden",
    padding: Spacing.six,
  },
  cardBackInner: {
    alignItems: "center",
    gap: Spacing.four,
  },
  frontText: {
    fontSize: 52,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  backText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  tapHintRow: {
    position: "absolute",
    bottom: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tapHintInline: {
    fontSize: FontSizes.xs,
    fontStyle: "italic",
  },
  audioWrapper: {
    marginTop: Spacing.two,
  },
});
