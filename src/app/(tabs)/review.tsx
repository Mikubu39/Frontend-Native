/**
 * Leaderboard / League Screen - Redesigned to match Duolingo League
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
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
    paddingBottom: Spacing.six,
  },
  leagueBanner: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
    marginBottom: Spacing.four,
  },
  leagueEmoji: {
    fontSize: 70,
  },
  leagueName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    marginTop: Spacing.two,
  },
  leagueTimer: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  promoCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    marginTop: Spacing.four,
    marginHorizontal: Spacing.six,
  },
  promoText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContainer: {
    paddingHorizontal: Spacing.four,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginHorizontal: Spacing.four,
    marginVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
  },
  currentUserRow: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F0FF',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  avatar: {
    fontSize: 28,
    marginHorizontal: Spacing.three,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  currentUserText: {
    color: Colors.primary,
  },
  youBadge: {
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  xpText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textSecondary,
  },
});
