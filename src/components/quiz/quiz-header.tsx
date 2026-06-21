/**
 * QuizHeader - Japan flag + progress bar + close button.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors, Spacing } from '@/constants/theme';

interface QuizHeaderProps {
  progress: number;
  onClose: () => void;
}

export function QuizHeader({ progress, onClose }: QuizHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.flag}>
          <Text style={styles.flagEmoji}>🇯🇵</Text>
        </View>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  flagEmoji: {
    fontSize: 20,
  },
  spacer: {
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});
