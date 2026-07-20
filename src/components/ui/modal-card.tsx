/**
 * ModalCard - White card overlay with animated entrance.
 * Card scales in from 0.9 → 1 with a spring, backdrop fades in.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows, AnimationPresets } from '@/constants/theme';

interface ModalCardProps {
  children: React.ReactNode;
  onClose?: () => void;
  style?: ViewStyle;
}

export function ModalCard({ children, onClose, style }: ModalCardProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(AnimationPresets.duration.fast)}
      style={styles.overlay}
    >
      <Animated.View
        entering={FadeInDown.duration(AnimationPresets.duration.normal)
          .springify()
          .damping(AnimationPresets.spring.damping)
          .stiffness(AnimationPresets.spring.stiffness)
        }
        style={[styles.card, style]}
      >
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    zIndex: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    width: '100%',
    maxWidth: 360,
    ...Shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: Colors.lockedBg,
  },
  closeIcon: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: FontWeights.bold,
  },
});
