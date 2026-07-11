/**
 * Practice Hub / Trung Tâm Luyện Tập Screen - Enhanced with larger icons,
 * press animations, animated badges, and staggered entrance.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows, AnimationPresets } from '@/constants/theme';

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
      color: '#10B981',
    },
  ];

  const renderCard = (item: PracticeItem) => (
    <AnimatedPressable
      key={item.id}
      style={styles.card}
      onPress={() => router.push(item.route as any)}
      pressScale={0.97}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '18' }]}>
        <Text style={styles.itemIcon}>{item.icon}</Text>
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
      <View style={styles.arrowContainer}>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trung tâm luyện tập</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Banner */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.introBanner}
        >
          <Text style={styles.introEmoji}>🏋️</Text>
          <View style={styles.introInfo}>
            <Text style={styles.introTitle}>Nâng cao phản xạ tiếng Nhật</Text>
            <Text style={styles.introDesc}>
              Ôn luyện hằng ngày giúp bạn nhớ lâu hơn gấp 4 lần.
            </Text>
          </View>
        </Animated.View>

        {/* Section 1 */}
        <Animated.Text
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.sectionTitle}
        >
          Bài học tập trung
        </Animated.Text>
        <StaggeredList staggerDelay={80} initialDelay={200}>
          {primaryItems.map(renderCard)}
        </StaggeredList>

        {/* Section 2 */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.sectionTitle, { marginTop: Spacing.two }]}
        >
          Các hoạt động ôn tập
        </Animated.Text>
        <StaggeredList staggerDelay={80} initialDelay={400}>
          {additionalItems.map(renderCard)}
        </StaggeredList>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    marginBottom: Spacing.six,
    gap: Spacing.four,
    ...Shadows.md,
  },
  introEmoji: {
    fontSize: 52,
  },
  introInfo: {
    flex: 1,
  },
  introTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  introDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    gap: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.3,
  },
  itemDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

