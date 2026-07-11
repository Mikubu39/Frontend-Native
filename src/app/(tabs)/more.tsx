/**
 * More / Menu Screen - Enhanced with larger icons, press animations,
 * animated chevrons, and staggered entrance.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { StaggeredList } from '@/components/ui/staggered-list';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    title: 'Hồ sơ cá nhân',
    subtitle: 'Xem thành tích, cấp độ và thông tin tài khoản',
    icon: '👤',
    route: '/profile',
    color: Colors.primary,
  },
  {
    id: 'm2',
    title: 'Học chữ cái (Kana & Kanji)',
    subtitle: 'Tra cứu bảng chữ Hiragana, Katakana và tập viết',
    icon: 'あ',
    route: '/characters',
    color: Colors.accent,
  },
  {
    id: 'm3',
    title: 'Trung tâm luyện tập',
    subtitle: 'Ôn tập lỗi sai, học từ vựng và luyện phát âm',
    icon: '🏋️',
    route: '/review',
    color: '#10B981', // Emerald green
  },
];

export default function MoreMenuScreen() {
  const router = useRouter();

  return (
    <AnimatedScreen>
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xem thêm</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StaggeredList staggerDelay={80}>
          {MENU_ITEMS.map((item) => (
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
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.subtitle}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </AnimatedPressable>
          ))}
        </StaggeredList>
      </ScrollView>
    </SafeAreaView>
    </AnimatedScreen>
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
    paddingVertical: Spacing.six,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    gap: Spacing.four,
    marginBottom: Spacing.four,
    ...Shadows.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 36,
  },
  cardContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
