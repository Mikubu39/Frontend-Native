/**
 * More / Menu Screen - Displays vertical tabs for Profile, Characters, and Practice Hub
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xem thêm</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
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
                <Text style={styles.itemDesc}>{item.subtitle}</Text>
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
  },
  menuList: {
    gap: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: Spacing.four,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  itemDesc: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
});
