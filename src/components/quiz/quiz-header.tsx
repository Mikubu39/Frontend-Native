/**
 * QuizHeader - Japan flag + progress bar + close button.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors, Spacing } from '@/constants/theme';

interface QuizHeaderProps {
  progress: number;
  onClose: () => void;
  lessonType?: string;
  heartsRemaining?: number;
}

export function QuizHeader({ progress, onClose, lessonType, heartsRemaining }: QuizHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.flag}>
          <Text style={styles.flagEmoji}>🇯🇵</Text>
        </View>
        <View style={styles.spacer} />
        
        {lessonType === 'JUMP_TEST' && heartsRemaining !== undefined && (
          <View style={styles.heartsContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <FontAwesome5 
                key={i} 
                name="heart" 
                size={20} 
                color={i < heartsRemaining ? "#FF4B4B" : Colors.lockedBg} 
                solid={i < heartsRemaining}
              />
            ))}
          </View>
        )}
        
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
    borderRadius: 20,
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
  heartsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginRight: Spacing.four,
  },
});
