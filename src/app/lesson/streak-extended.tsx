import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  withSpring,
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";

export default function StreakExtendedScreen() {
  const router = useRouter();
  const { streak, frozenToday } = useGamification();
  const { playStreak } = useSoundEffect();

  // Animation values
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    playStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const celebrationInfo = React.useMemo(() => {
    if (streak <= 1) {
      return {
        title: "Bắt đầu chuỗi mới!",
        description:
          "Khởi đầu tuyệt vời! Hãy chăm chỉ học mỗi ngày để ngọn lửa luôn bùng cháy nhé.",
      };
    }
    if (frozenToday) {
      return {
        title: "Khiên băng đã bảo vệ bạn!",
        description:
          "Đóng băng chuỗi đã bảo vệ trọn vẹn chuỗi học của bạn. Ngọn lửa đã bùng cháy trở lại!",
      };
    }
    return {
      title: "Chuỗi học đã tăng!",
      description:
        "Tuyệt vời! Bạn đang giữ lửa rất tốt. Hãy tiếp tục học mỗi ngày nhé!",
    };
  }, [streak, frozenToday]);

  useEffect(() => {
    // Delayed past the screen's own reveal transition so the flame visibly
    // pops in once the user is already looking at the screen, not mid-slide.
    scale.value = withDelay(250, withSpring(1, { damping: 12, stiffness: 90 }));
    rotation.value = withDelay(
      250,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 150, easing: Easing.linear }),
          withTiming(5, { duration: 150, easing: Easing.linear }),
          withTiming(0, { duration: 150, easing: Easing.linear }),
        ),
        -1, // infinite
        true,
      ),
    );
  }, [rotation, scale]);

  const animatedFireStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <LinearGradient
      colors={Colors.gradients.reward}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      {/* Reveal like a celebration, not a lateral page push */}
      <Stack.Screen
        options={{ animation: "fade_from_bottom", animationDuration: 350 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.fireContainer, animatedFireStyle]}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(550).springify()}
            style={styles.textContainer}
          >
            <Text style={styles.title}>{celebrationInfo.title}</Text>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.subtitle}>Ngày học liên tiếp</Text>
            <Text style={styles.description}>
              {celebrationInfo.description}
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(850).springify()}
          style={styles.buttonContainer}
        >
          <GradientButton
            title="TUYỆT VỜI"
            onPress={() => router.replace("/(tabs)")}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.six,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fireContainer: {
    width: 180,
    height: 180,
    backgroundColor: "#FFFCF5",
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.eight,
    ...Shadows.glow(Colors.accentLight),
  },
  fireEmoji: {
    fontSize: 100,
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
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.two,
  },
  streakNumber: {
    fontSize: 64,
    fontFamily: Fonts.display,
    color: Colors.secondary,
    marginVertical: Spacing.two,
    textShadowColor: "rgba(190, 74, 52, 0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.four,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: Spacing.four,
  },
});
