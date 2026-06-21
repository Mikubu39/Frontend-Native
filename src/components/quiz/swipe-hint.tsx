/**
 * SwipeHint - Animated hint text suggesting a swiping action.
 * Figma screen 15/25
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface SwipeHintProps {
  text?: string;
  visible?: boolean;
}

export function SwipeHint({ text = 'Swipe to continue', visible = true }: SwipeHintProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: bounceAnim }],
        },
      ]}
    >
      <Text style={styles.text}>{text} →</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: Spacing.three,
  },
  text: {
    color: Colors.textOnCream,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
