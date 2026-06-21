/**
 * Add Friends Screen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';

const OPTIONS = [
  { id: 'find', icon: '👥', title: 'Find buddies', subtitle: 'Find partners to study together' },
  { id: 'share', icon: '📤', title: 'Share', subtitle: 'Invite friends to join' },
  { id: 'voucher', icon: '🎁', title: 'Promote voucher', subtitle: 'Get rewards for inviting' },
];

export default function FriendsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <TouchableOpacity key={option.id} style={styles.optionCard} activeOpacity={0.7}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    gap: Spacing.six,
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
  options: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
    gap: Spacing.one,
  },
  optionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: FontSizes.xxl,
    color: Colors.textSecondary,
  },
});
