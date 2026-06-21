/**
 * CategoryGrid - 3-column search category grid with images.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SEARCH_CATEGORIES } from '@/data';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface CategoryGridProps {
  onCategoryPress: (categoryId: string) => void;
}

export function CategoryGrid({ onCategoryPress }: CategoryGridProps) {
  return (
    <View style={styles.grid}>
      {SEARCH_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.card}
          onPress={() => onCategoryPress(category.id)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: category.imageUrl }} style={styles.image} />
          <Text style={styles.label}>{category.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '30%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});
