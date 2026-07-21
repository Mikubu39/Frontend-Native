/**
 * Leaderboard / League Screen - Enhanced with staggered animations,
 * gradient league banner, animated medals, and glowing current user row.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AnimatedScreen } from '@/components/ui/animated-screen';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows, AnimationPresets } from '@/constants/theme';

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
  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const isTop3 = item.rank <= 3;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
    const changeIcon = item.change === 'up' ? '↑' : item.change === 'down' ? '↓' : '—';
    const changeColor = item.change === 'up' ? Colors.success : item.change === 'down' ? Colors.error : Colors.textSecondary;

    return (
      <Animated.View
        entering={FadeIn.delay(index * AnimationPresets.staggerDelay).duration(400)}
      >
        <AnimatedPressable
          style={[styles.userRow, item.isCurrentUser && styles.currentUserRow]}
          onPress={() => {}}
          pressScale={0.98}
        >
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
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{item.avatarEmoji}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, item.isCurrentUser && styles.currentUserText]}>
              {item.name}
            </Text>
            {item.isCurrentUser && <View style={styles.youBadge}><Text style={styles.youBadgeText}>Bạn</Text></View>}
          </View>

          {/* Change indicator + XP */}
          <View style={styles.xpContainer}>
            <Text style={[styles.changeIcon, { color: changeColor }]}>{changeIcon}</Text>
            <Text style={styles.xpText}>{item.xp} XP</Text>
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <AnimatedScreen>
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
          <Animated.View entering={FadeIn.duration(500)}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.leagueBanner}
            >
              <Text style={styles.leagueEmoji}>🛡️</Text>
              <Text style={styles.leagueName}>Giải đấu Ngọc Lục Bảo</Text>
              <Text style={styles.leagueTimer}>Thời gian còn lại: 2 ngày 5 giờ</Text>
              
              {/* Promo card */}
              <View style={styles.promoCard}>
                <Text style={styles.promoText}>
                  Top 10 người đứng đầu sẽ được thăng cấp lên Giải đấu Hồng Ngọc! 🏆
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        }
      />
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
  listContent: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  leagueBanner: {
    alignItems: 'center',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.seven,
    marginBottom: Spacing.six,
    ...Shadows.lg,
  },
  leagueEmoji: {
    fontSize: 72,
    marginBottom: Spacing.three,
  },
  leagueName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  leagueTimer: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    fontWeight: FontWeights.bold,
  },
  promoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginTop: Spacing.five,
    width: '100%',
  },
  promoText: {
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: FontWeights.bold,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    gap: Spacing.three,
    ...Shadows.sm,
  },
  currentUserRow: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF',
    ...Shadows.glow(Colors.primary),
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.md,
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.lockedBg,
  },
  avatar: {
    fontSize: 24,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 22,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
  },
  xpContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  changeIcon: {
    fontSize: 12,
    fontWeight: FontWeights.extrabold,
  },
  xpText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },
});

