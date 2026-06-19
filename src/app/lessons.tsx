/**
 * Lessons Screen — Duolingo-style S-curve path layout.
 *
 * Keeps the exact visual design from the app:
 * - Cream/yellow background
 * - Header: red dot, Level dropdown, profile avatar
 * - Progress/Calendar tabs
 * - White cards with yellow border, each containing an S-curve lesson path
 * - Pink circles with checkmarks (completed), gray circles (locked)
 *
 * Only the LAYOUT of lesson dots is changed from horizontal rows → S-curve path.
 */

import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LessonsHeader,
  ProgressTabs,
  SectionCard,
  PAGE_BG,
} from '@/components/lessons';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { LESSON_SECTIONS } from '@/data';

export default function LessonsScreen() {
  const safeAreaInsets = useSafeAreaInsets();

  const contentPadding = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    },
    ios: {
      paddingBottom: BottomTabInset + Spacing.three,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.four,
    },
  });

  // Track global index for continuous S-curve across sections
  let globalIndex = 0;

  return (
    <ScrollView
      style={styles.scrollView}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.scrollContent, contentPadding]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <LessonsHeader />
        <ProgressTabs />

        {LESSON_SECTIONS.map((section) => {
          const startIdx = globalIndex;
          globalIndex += section.lessons.length;

          return (
            <SectionCard
              key={section.id}
              section={section}
              globalStartIndex={startIdx}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
  },
});
