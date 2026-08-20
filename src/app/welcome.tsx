/**
 * Welcome / Entry Screen
 * Enhanced with animated mascot entrance, gradient accents, and premium 3D buttons.
 */

import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  AnimationPresets,
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useTheme();

  const mascotScale = useSharedValue(0);
  const mascotRotate = useSharedValue(0); // Set initial rotation to 0 to prevent tilting

  useEffect(() => {
    mascotScale.value = withDelay(
      200,
      withSpring(1, AnimationPresets.springBouncy),
    );
    // Removed rotation animation to keep the owl straight
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: mascotScale.value },
      { rotate: `${mascotRotate.value}deg` },
    ],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Mascot & Brand Header */}
        <View style={styles.mascotContainer}>
          <Animated.Text style={[styles.mascotEmoji, mascotStyle]}>
            🦉
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.brandTitle}
          >
            Kotodama
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(600).duration(500)}
            style={[styles.brandSubtitle, { color: colors.textSecondary }]}
          >
            Học tiếng Nhật tự nhiên, miễn phí và hiệu quả!
          </Animated.Text>
        </View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.buttonContainer}
        >
          <AnimatedPressable
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/signup")}
            pressScale={0.97}
          >
            <View style={styles.primaryButtonShadow} />
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonText}>BẮT ĐẦU NGAY</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
            pressScale={0.97}
          >
            <View style={[styles.secondaryButtonShadow, { backgroundColor: colors.borderSubtle }]} />
            <View style={[styles.secondaryButtonContent, { backgroundColor: colors.backgroundElement, borderColor: colors.borderSubtle }]}>
              <Text style={styles.secondaryButtonText}>
                TÔI ĐÃ CÓ TÀI KHOẢN
              </Text>
            </View>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.eight,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.four,
    width: "100%",
  },
  mascotEmoji: {
    fontSize: 120,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 46,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    fontStyle: "italic",
    textAlign: "center",
    textShadowColor: "rgba(139, 92, 246, 0.2)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  // 3D Primary Button Style
  primaryButton: {
    width: "100%",
    height: 58,
    position: "relative",
  },
  primaryButtonShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 5,
    bottom: -5,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
  },
  primaryButtonContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.md,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  // 3D Secondary Button Style
  secondaryButton: {
    width: "100%",
    height: 58,
    position: "relative",
  },
  secondaryButtonShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 5,
    bottom: -5,
    backgroundColor: Colors.creamDark,
    borderRadius: BorderRadius.lg,
  },
  secondaryButtonContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
});
