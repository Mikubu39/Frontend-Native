/**
 * Dictionary Screen - My dictionary with Words/Phrases/History tabs.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WordCard } from '@/components/dictionary/word-card';
import { MOCK_WORDS, MOCK_PHRASES } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

const TABS = ['Words', 'Phrases', 'History'] as const;

export default function DictionaryScreen() {
  const [activeTab, setActiveTab] = useState(0);

  const entries = activeTab === 0 ? MOCK_WORDS : activeTab === 1 ? MOCK_PHRASES : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My dictionary</Text>
        <TouchableOpacity>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(index)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeTab === index && styles.tabTextActive,
            ]}>
              {tab}
            </Text>
            {activeTab === index && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {entries.map((entry) => (
          <WordCard key={entry.id} entry={entry} />
        ))}
        {activeTab === 2 && (
          <Text style={styles.emptyText}>No history yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.six,
    gap: Spacing.seven,
  },
  tabItem: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  tabText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  tabUnderline: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  list: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    paddingTop: Spacing.eight,
  },
});
