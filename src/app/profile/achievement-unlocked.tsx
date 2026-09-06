import React, { useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { GradientButton } from "@/components/ui/gradient-button";
import { HankoStamp } from "@/components/ui/hanko-stamp";
import {
  AnimationPresets,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { AchievementMedal } from "@/components/profile/achievement-medal";
import { getAchievementIconStyle } from "@/utils/achievement-icon";
import { useTheme } from "@/contexts/theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AchievementUnlockedScreen() {
  const router = useRouter();
  const { newlyUnlockedAchievements, clearNewlyUnlockedAchievements } =
    useGamification();
  const { colors } = useTheme();

  // Animation values
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, AnimationPresets.springBouncy);
    rotation.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 120, easing: Easing.linear }),
        withTiming(3, { duration: 120, easing: Easing.linear }),
        withTiming(0, { duration: 120, easing: Easing.linear }),
      ),
      -1, // infinite
      true,
    );
  }, [rotation, scale]);

  const animatedMedalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  // `clearNewlyUnlockedAchievements` below empties the context array, which
  // re-triggers the "no achievements left" effect further down — without
  // this guard that second firing re-enters handleContinue concurrently and
  // races the AsyncStorage read/remove, sometimes clobbering the streak
  // navigation with an immediate replace to "/(tabs)".
  const hasContinuedRef = useRef(false);

  const handleContinue = useCallback(async () => {
    if (hasContinuedRef.current) return;
    hasContinuedRef.current = true;

    clearNewlyUnlockedAchievements();

    // Check if we also need to show streak extended screen
    try {
      const pendingStreak = await AsyncStorage.getItem("pendingStreakExtended");
      if (pendingStreak === "true") {
        await AsyncStorage.removeItem("pendingStreakExtended");
        router.replace("/lesson/streak-extended");
        return;
      }
    } catch (e) {
      console.log(e);
    }

    router.replace("/(tabs)");
  }, [clearNewlyUnlockedAchievements, router]);

  // If somehow reached here without achievements, go back
  useEffect(() => {
    if (!newlyUnlockedAchievements || newlyUnlockedAchievements.length === 0) {
      handleContinue();
    }
  }, [newlyUnlockedAchievements, handleContinue]);

  if (!newlyUnlockedAchievements || newlyUnlockedAchievements.length === 0) {
    return null;
  }

  const achievement = newlyUnlockedAchievements[0];
  const count = newlyUnlockedAchievements.length;
  const iconStyle = getAchievementIconStyle(achievement.code);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.medalContainer, animatedMedalStyle]}>
          <AchievementMedal
            size={140}
            icon={iconStyle.icon}
            iconColor={iconStyle.color}
            ringGradient={["#D9AC5C", "#C4922E"]}
            surfaceColor={colors.background}
            lockedRing={colors.border}
          />
          <View style={styles.stampBadge}>
            <HankoStamp size={56} delay={350} />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.title}>Thành tựu mới!</Text>
          <Text style={styles.achievementName}>{achievement.name}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          {count > 1 && (
            <Animated.Text
              entering={FadeIn.delay(800)}
              style={styles.extraCount}
            >
              và {count - 1} thành tựu khác!
            </Animated.Text>
          )}
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        style={styles.buttonContainer}
      >
        <GradientButton title="TUYỆT VỜI" onPress={handleContinue} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  medalContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.eight,
    ...Shadows.glow("#C4922E"),
  },
  stampBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
  },
  textContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: Spacing.six,
    borderRadius: 24,
    width: "100%",
    ...Shadows.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    fontFamily: Fonts.rounded,
    color: Colors.accent,
    marginBottom: Spacing.two,
  },
  achievementName: {
    fontSize: 28,
    fontWeight: "900",
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    marginVertical: Spacing.two,
    textAlign: "center",
  },
  description: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.rounded,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  extraCount: {
    marginTop: Spacing.four,
    fontSize: FontSizes.sm,
    fontWeight: "bold",
    color: Colors.primary,
  },
  buttonContainer: {
    paddingBottom: Spacing.four,
  },
});
