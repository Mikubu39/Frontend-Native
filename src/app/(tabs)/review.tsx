/**
 * Review Screen - Review lessons with week/stage toggle.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabSwitcher } from '@/components/ui/tab-switcher';
import { WeekList } from '@/components/review/week-list';
import { SkillProgressCard } from '@/components/review/skill-progress-card';
import { SearchHeader } from '@/components/search/search-header';
import { REVIEW_WEEKS, SKILL_PROGRESS } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function ReviewScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Review lessons</Text>

      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        activeFilter={null}
        onFilterPress={() => {}}
      />

      <TabSwitcher
        tabs={['Week', 'Stage']}
        activeIndex={activeTab}
        onTabPress={setActiveTab}
        activeColor={Colors.secondary}
      />

      {activeTab === 0 ? (
        <WeekList weeks={REVIEW_WEEKS} onWeekPress={() => {}} />
      ) : (
        <View style={styles.progressList}>
          {SKILL_PROGRESS.map((skill) => (
            <SkillProgressCard key={skill.id} skill={skill} />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    gap: Spacing.five,
    paddingTop: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  progressList: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
});
