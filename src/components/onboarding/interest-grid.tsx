/**
 * InterestGrid - 2-column image grid for interest selection.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ONBOARDING_INTERESTS } from '@/data';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface InterestGridProps {
  selectedInterests: string[];
  onToggle: (id: string) => void;
}

export function InterestGrid({ selectedInterests, onToggle }: InterestGridProps) {
  return (
    <View style={styles.grid}>
      {ONBOARDING_INTERESTS.map((interest) => {
        const isSelected = selectedInterests.includes(interest.id);
        return (
          <TouchableOpacity
            key={interest.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onToggle(interest.id)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: interest.imageUrl }} style={styles.image} />
            {isSelected && (
              <View style={styles.overlay}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              </View>
            )}
            <Text style={styles.label}>{interest.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    justifyContent: 'center',
  },
  card: {
    width: '45%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.secondary,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233, 30, 142, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.textOnDark,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
});
