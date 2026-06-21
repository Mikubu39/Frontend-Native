/**
 * Search Screen - Category grid with search bar.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchHeader } from '@/components/search/search-header';
import { CategoryGrid } from '@/components/search/category-grid';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SearchHeader
          query={query}
          onQueryChange={setQuery}
          activeFilter={activeFilter}
          onFilterPress={(id) => setActiveFilter(activeFilter === id ? null : id)}
        />
        <CategoryGrid onCategoryPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  scroll: {
    gap: Spacing.six,
    paddingBottom: 100,
  },
});
