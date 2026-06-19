/**
 * Section card wrapper — contains the category title + S-curve lesson path.
 *
 * Matches the app's design:
 * - White card with yellow/gold rounded border
 * - Category title at top (e.g. "Grammar")
 * - Lesson nodes arranged in S-curve below the title
 */

import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';

import type { LessonSection } from '@/types';

import { LessonNode } from './lesson-node';
import { PathConnector } from './path-connector';
import { CARD_BG, CARD_BORDER, TEXT_PRIMARY, getPathOffset } from './lesson-path-constants';

interface SectionCardProps {
  section: LessonSection;
  /** Global start index for continuous S-curve across sections */
  globalStartIndex: number;
}

export function SectionCard({ section, globalStartIndex }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{section.title}</Text>

      <View style={styles.pathContainer}>
        {section.lessons.map((lesson, lessonIdx) => {
          const globalIdx = globalStartIndex + lessonIdx;
          const offset = getPathOffset(globalIdx);
          const nextOffset =
            lessonIdx < section.lessons.length - 1
              ? getPathOffset(globalStartIndex + lessonIdx + 1)
              : null;

          return (
            <View key={lesson.id}>
              <LessonNode lesson={lesson} offsetX={offset} />
              {nextOffset !== null && (
                <PathConnector fromOffset={offset} toOffset={nextOffset} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  pathContainer: {
    alignItems: 'center',
  },
});
