/**
 * OptionCard - Selectable card with animated selection feedback.
 * Scales + bounces on select with a checkmark entrance.
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, AnimationPresets, Shadows } from '@/constants/theme';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'default' | 'accent';
}

export function OptionCard({
  title,
  subtitle,
  selected = false,
  onPress,
  variant = 'default',
}: OptionCardProps) {
  const selectionAnim = useSharedValue(selected ? 1 : 0);
  const bounceScale = useSharedValue(1);

  useEffect(() => {
    if (selected) {
      selectionAnim.value = withSpring(1, AnimationPresets.springSnappy);
      bounceScale.value = withSequence(
        withTiming(0.95, { duration: 80 }),
        withSpring(1.02, AnimationPresets.springTab),
        withSpring(1, { damping: 20, stiffness: 200 })
      );
    } else {
      selectionAnim.value = withSpring(0, AnimationPresets.springSnappy);
    }
  }, [selected]);

  const cardAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      ['transparent', Colors.accent]
    );
    const backgroundColor = interpolateColor(
      selectionAnim.value,
      [0, 1],
      [Colors.accentPale, Colors.accent]
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ scale: bounceScale.value }],
    };
  });

  const isAccent = variant === 'accent' || selected;

  return (
    <AnimatedPressable
      onPress={onPress}
      pressScale={0.97}
      disableAnimation={false}
    >
      <Animated.View style={[styles.card, cardAnimStyle]}>
        <View style={styles.content}>
          <Text style={[styles.title, isAccent && styles.titleAccent]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, isAccent && styles.subtitleAccent]}>{subtitle}</Text>}
        </View>
        {/* Checkmark */}
        {selected && (
          <Animated.View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accentPale,
    borderWidth: 2.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  titleAccent: {
    color: Colors.textOnDark,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitleAccent: {
    color: 'rgba(255,255,255,0.85)',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.four,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: FontWeights.extrabold,
  },
});
