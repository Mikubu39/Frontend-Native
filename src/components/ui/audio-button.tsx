/**
 * AudioButton - Circular button for audio playback.
 * Yellow variant for speaker, pink variant for microphone.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface AudioButtonProps {
  variant?: 'speaker' | 'mic';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  label?: string;
  isPlaying?: boolean;
}

const SIZE_MAP = {
  small: 40,
  medium: 64,
  large: 180,
} as const;

export function AudioButton({
  variant = 'speaker',
  size = 'small',
  onPress,
  label,
  isPlaying = false,
}: AudioButtonProps) {
  const buttonSize = SIZE_MAP[size];
  const isSpeaker = variant === 'speaker';
  const bgColor = isPlaying 
    ? (isSpeaker ? Colors.accentLight : Colors.secondaryLight)
    : (isSpeaker ? Colors.accent : '#FFB6C1');
  const iconSize = size === 'large' ? 60 : size === 'medium' ? 32 : 18;

  return (
    <View style={styles.wrapper}>
      {size === 'large' && (
        <View
          style={[
            styles.outerRing,
            {
              width: buttonSize + 60,
              height: buttonSize + 60,
              borderRadius: (buttonSize + 60) / 2,
              backgroundColor: isSpeaker ? Colors.accentPale : '#FFD1DC',
            },
          ]}
        />
      )}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: bgColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, { fontSize: iconSize }]}>
          {isSpeaker ? '🔊' : '🎤'}
        </Text>
      </TouchableOpacity>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  outerRing: {
    position: 'absolute',
    opacity: 0.4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.two,
  },
});
