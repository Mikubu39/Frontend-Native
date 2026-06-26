/**
 * Leaderboard / League Screen - Redesigned to match Duolingo League
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarEmoji: string;
  xp: number;
  isCurrentUser?: boolean;
  change?: 'up' | 'down' | 'same';
}

const LEAGUE_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'Hoàng', avatarEmoji: '🦊', xp: 1450, change: 'up' },
  { rank: 2, name: 'uyên', avatarEmoji: '🐱', xp: 1320, change: 'up' },
  { rank: 3, name: 'dunn', avatarEmoji: '🐼', xp: 1100, change: 'same' },
  { rank: 4, name: 'Bạn (User)', avatarEmoji: '🦉', xp: 980, isCurrentUser: true, change: 'up' },
  { rank: 5, name: 'Jaime', avatarEmoji: '🦁', xp: 850, change: 'down' },
  { rank: 6, name: 'Hà Thạch', avatarEmoji: '🐰', xp: 720, change: 'same' },
  { rank: 7, name: 'Trang', avatarEmoji: '🐨', xp: 600, change: 'same' },
  { rank: 8, name: 'Happy', avatarEmoji: '🦄', xp: 520, change: 'down' },
  { rank: 9, name: 'Minh', avatarEmoji: '🐸', xp: 480, change: 'same' },
  { rank: 10, name: 'Linh', avatarEmoji: '🐙', xp: 350, change: 'down' },
];

export default function LeaderboardScreen() {
  const renderItem = ({ item }: { item: LeaderboardUser }) => {
    const isTop3 = item.rank <= 3;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

    return (
      <View style={[styles.userRow, item.isCurrentUser && styles.currentUserRow]}>
        {/* Rank Number / Badge */}
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <View style={[styles.rankBadge, { backgroundColor: rankColors[item.rank - 1] }]}>
              <Text style={styles.rankBadgeText}>{item.rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>

        {/* User Info */}
        <Text style={styles.avatar}>{item.avatarEmoji}</Text>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, item.isCurrentUser && styles.currentUserText]}>
            {item.name}
          </Text>
          {item.isCurrentUser && <Text style={styles.youBadge}>Bạn</Text>}
        </View>

        {/* XP Status */}
        <Text style={styles.xpText}>{item.xp} XP</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* League Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bảng xếp hạng</Text>
      </View>

      <FlatList
        data={LEAGUE_USERS}
        keyExtractor={(item) => item.rank.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.leagueBanner}>
            <Text style={styles.leagueEmoji}>🛡️</Text>
            <Text style={styles.leagueName}>Giải đấu Ngọc Lục Bảo</Text>
            <Text style={styles.leagueTimer}>Thời gian còn lại: 2 ngày 5 giờ</Text>
            
            {/* Promo card */}
            <View style={styles.promoCard}>
              <Text style={styles.promoText}>
                Top 10 người đứng đầu sẽ được thăng cấp lên Giải đấu Hồng Ngọc!
              </Text>
            </View>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  leagueBanner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    marginBottom: Spacing.six,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  leagueEmoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  leagueName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primaryDark,
  },
  leagueTimer: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: FontWeights.bold,
  },
  promoCard: {
    backgroundColor: Colors.cream,
    borderColor: Colors.inputBorder,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    marginTop: Spacing.five,
    width: '100%',
  },
  promoText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: FontWeights.bold,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    gap: Spacing.four,
  },
  currentUserRow: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF', // Light purple tint
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.sm,
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  avatar: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  currentUserText: {
    color: Colors.primaryDark,
    fontWeight: FontWeights.extrabold,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  xpText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
});
