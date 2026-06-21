/**
 * More Screen - Settings, profile, and additional options.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  route?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'profile', icon: '👤', title: 'Profile', route: '/profile' },
  { id: 'friends', icon: '👥', title: 'Add Friends', route: '/friends' },
  { id: 'schedule', icon: '📅', title: 'Study Schedule' },
  { id: 'voice', icon: '🎤', title: 'Voice Translate', route: '/voice/translate' },
  { id: 'settings', icon: '⚙️', title: 'Settings' },
  { id: 'help', icon: '❓', title: 'Help & Support' },
  { id: 'about', icon: 'ℹ️', title: 'About Kotodama' },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>More</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
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
    paddingVertical: Spacing.five,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.lg,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  menuArrow: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
  },
});
