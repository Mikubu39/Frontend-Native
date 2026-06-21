/**
 * ModalCard - White card overlay with close button.
 * Used for "Ready to learn?" and other modal dialogs.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface ModalCardProps {
  children: React.ReactNode;
  onClose?: () => void;
  style?: ViewStyle;
}

export function ModalCard({ children, onClose, style }: ModalCardProps) {
  return (
    <View style={styles.overlay}>
      <View style={[styles.card, style]}>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
        {children}
      </View>
    </View>
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
});
