/**
 * Welcome / Entry Screen
 * Enhanced with animated mascot entrance, gradient accents, and premium 3D buttons.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, AnimationPresets, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const mascotScale = useSharedValue(0);
  const mascotRotate = useSharedValue(-15);

  useEffect(() => {
    mascotScale.value = withDelay(
      200,
      withSpring(1, AnimationPresets.springBouncy)
    );
    mascotRotate.value = withDelay(
      200,
      withSequence(
        withSpring(8, { damping: 8, stiffness: 100 }),
        withSpring(0, { damping: 10, stiffness: 120 })
      )
    );
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: mascotScale.value },
      { rotate: `${mascotRotate.value}deg` },
    ],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Mascot & Brand Header */}
        <View style={styles.mascotContainer}>
          <Animated.Text style={[styles.mascotEmoji, mascotStyle]}>🦉</Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.brandTitle}
          >
            Kotodama
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(600).duration(500)}
            style={styles.brandSubtitle}
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
            onPress={() => router.push('/(auth)/signup')}
            pressScale={0.97}
          >
            <View style={styles.primaryButtonShadow} />
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonText}>BẮT ĐẦU NGAY</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
            pressScale={0.97}
          >
            <View style={styles.secondaryButtonShadow} />
            <View style={styles.secondaryButtonContent}>
              <Text style={styles.secondaryButtonText}>TÔI ĐÃ CÓ TÀI KHOẢN</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.eight,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
    width: '100%',
  },
  mascotEmoji: {
    fontSize: 120,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 46,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(139, 92, 246, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  // 3D Primary Button Style
  primaryButton: {
    width: '100%',
    height: 58,
    position: 'relative',
  },
  primaryButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 5,
    bottom: -5,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
  },
  primaryButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
  // 3D Secondary Button Style
  secondaryButton: {
    width: '100%',
    height: 58,
    position: 'relative',
  },
  secondaryButtonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 5,
    bottom: -5,
    backgroundColor: Colors.creamDark,
    borderRadius: BorderRadius.lg,
  },
  secondaryButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.creamDark,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
  },
});

