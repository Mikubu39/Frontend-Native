/**
 * Practice Hub / Trung Tâm Luyện Tập Screen - Redesigned to match Duolingo
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface PracticeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: string;
  color: string;
}

export default function PracticeHubScreen() {
  const router = useRouter();

  const primaryItems: PracticeItem[] = [
    {
      id: 'p1',
      title: 'Luyện tập Lỗi Sai',
      description: 'Xem lại và giải quyết các câu bạn từng làm sai.',
      icon: '⚠️',
      route: '/quiz/ready?lessonId=lp5',
      badge: 'Cần thiết',
      color: Colors.error,
    },
    {
      id: 'p2',
      title: 'Sổ tay Từ điển',
      description: 'Ôn tập và kiểm tra từ vựng bạn đã mở khóa.',
      icon: '📓',
      route: '/dictionary',
      color: Colors.primary,
    },
  ];

  const additionalItems: PracticeItem[] = [
    {
      id: 'p3',
      title: 'Thử thách thời gian',
      description: 'Luyện phản xạ nhanh để giành thêm Đá quý.',
      icon: '⚡',
      route: '/quiz/ready?lessonId=lp1',
      color: Colors.accent,
    },
    {
      id: 'p4',
      title: 'Luyện phát âm chuyên sâu',
      description: 'Nghe giọng bản xứ và tập nói lại chuẩn xác.',
      icon: '🗣️',
      route: '/voice/record',
      color: '#10B981', // Emerald green
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trung tâm luyện tập</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Banner */}
        <View style={styles.introBanner}>
          <Text style={styles.introEmoji}>🏋️</Text>
          <View style={styles.introInfo}>
            <Text style={styles.introTitle}>Nâng cao phản xạ tiếng Nhật</Text>
            <Text style={styles.introDesc}>
              Ôn luyện hằng ngày giúp bạn nhớ lâu hơn gấp 4 lần.
            </Text>
          </View>
        </View>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>Bài học tập trung</Text>
        <View style={styles.itemsList}>
          {primaryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Text style={[styles.itemIcon, { color: item.color }]}>{item.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.badge ? (
                    <View style={[styles.badge, { backgroundColor: item.color }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>Các hoạt động ôn tập</Text>
        <View style={styles.itemsList}>
          {additionalItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Text style={[styles.itemIcon, { color: item.color }]}>{item.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    marginBottom: Spacing.six,
    gap: Spacing.four,
  },
  introEmoji: {
    fontSize: 48,
  },
  introInfo: {
    flex: 1,
  },
  introTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  introDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  itemsList: {
    gap: Spacing.four,
    marginBottom: Spacing.six,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: Spacing.four,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FontWeights.extrabold,
  },
  itemDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
});
