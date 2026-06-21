/**
 * RecordButton - Large pink microphone button representing a recorder play control.
 * Figma screen 29
 */

import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  size?: number;
}

export function RecordButton({ isRecording, onPress, size = 160 }: RecordButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.outerContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          {
            width: size - Spacing.four,
            height: size - Spacing.four,
            borderRadius: (size - Spacing.four) / 2,
            transform: [{ scale: pulseAnim }],
            backgroundColor: isRecording ? Colors.secondaryLight : Colors.secondary,
            shadowColor: Colors.secondary,
          },
        ]}
      >
        <Text style={styles.icon}>🎙️</Text>
        <Text style={styles.text}>{isRecording ? 'RECORDING...' : 'TAP TO RECORD'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 142, 0.15)',
    padding: Spacing.two,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  text: {
    color: Colors.textOnDark,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
  },
});
