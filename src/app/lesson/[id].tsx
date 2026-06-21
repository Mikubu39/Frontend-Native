/**
 * Lesson Detail Screen - Shows lesson sub-items grid.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LessonGrid } from '@/components/lessons/lesson-grid';
import { HIRAGANA_LESSON_DETAIL } from '@/data';
import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = HIRAGANA_LESSON_DETAIL;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{detail.title}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LessonGrid
          items={detail.subItems}
          onItemPress={(item) => {
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes('writing')) {
              router.push(`/lesson/character/writing-hiragana`);
            } else if (titleLower.includes('listening')) {
              router.push(`/voice/listen`);
            } else if (titleLower.includes('speaking')) {
              router.push(`/voice/record`);
            } else {
              router.push(`/quiz/ready?lessonId=${item.id}`);
            }
          }}
          overallQuiz={detail.overallQuiz}
          onQuizPress={(quizItem) => router.push(`/quiz/ready?lessonId=${quizItem.id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scroll: {
    padding: Spacing.six,
    paddingBottom: 40,
  },
});
