/**
 * SearchHeader - Search input bar + filter chips.
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SEARCH_FILTERS } from '@/data';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface SearchHeaderProps {
  query: string;
  onQueryChange: (text: string) => void;
  activeFilter: string | null;
  onFilterPress: (filterId: string) => void;
}

export function SearchHeader({ query, onQueryChange, activeFilter, onFilterPress }: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Hiragana, Kanji"
          value={query}
          onChangeText={onQueryChange}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.filters}>
        {SEARCH_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.filterActive,
            ]}
            onPress={() => onFilterPress(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.four,
    height: 48,
    gap: Spacing.three,
  },
  searchIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  filterChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  filterTextActive: {
    color: Colors.textOnDark,
  },
});
