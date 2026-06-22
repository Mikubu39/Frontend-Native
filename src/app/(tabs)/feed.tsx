/**
 * Feed / Bảng Tin Screen - Recreates the user's shared Duolingo Feed screenshot.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  actionText: string;
  timeAgo: string;
  type: 'phrase' | 'streak';
  phraseJa?: string;
  phraseVi?: string;
  streakDays?: number;
  likesCount: number;
  likedByText: string;
  isLiked?: boolean;
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'p1',
    authorName: 'uyên',
    authorAvatar: '👩‍🎤',
    actionText: 'đã chia sẻ một câu',
    timeAgo: '3 ngày',
    type: 'phrase',
    phraseJa: 'ベトナム人です。',
    phraseVi: 'Tôi là người Việt Nam.',
    likesCount: 693,
    likedByText: 'Hoàng và nhiều người khác đã thích',
    isLiked: false,
  },
  {
    id: 'p2',
    authorName: 'dunn và Jaime',
    authorAvatar: '🦊', // We'll show double avatar in render
    actionText: '',
    timeAgo: '2 ngày',
    type: 'streak',
    streakDays: 725,
    likesCount: 2933,
    likedByText: 'Hà Thạch và nhiều người khác đã thích',
    isLiked: true,
  },
  {
    id: 'p3',
    authorName: 'Happy và Trang',
    authorAvatar: '🦄',
    actionText: '',
    timeAgo: '22 tiếng',
    type: 'streak',
    streakDays: 485,
    likesCount: 1485,
    likedByText: 'Minh và nhiều người khác đã thích',
    isLiked: false,
  },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);

  const toggleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bảng tin</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Author / Header */}
            <View style={styles.authorRow}>
              {post.id === 'p2' ? (
                // Double avatar for dual streak
                <View style={styles.doubleAvatarContainer}>
                  <Text style={styles.avatarMini}>🦊</Text>
                  <Text style={[styles.avatarMini, styles.avatarOffset]}>🦁</Text>
                </View>
              ) : post.id === 'p3' ? (
                <View style={styles.doubleAvatarContainer}>
                  <Text style={styles.avatarMini}>🦄</Text>
                  <Text style={[styles.avatarMini, styles.avatarOffset]}>🐰</Text>
                </View>
              ) : (
                <Text style={styles.avatar}>{post.authorAvatar}</Text>
              )}
              
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.authorName}{' '}
                  {post.actionText ? (
                    <Text style={styles.actionText}>{post.actionText}</Text>
                  ) : null}
                </Text>
                <Text style={styles.timeAgo}>{post.timeAgo}</Text>
              </View>
            </View>

            {/* Post Content */}
            {post.type === 'phrase' ? (
              <View style={styles.contentPhraseContainer}>
                {/* Speech Bubble */}
                <View style={styles.speechBubble}>
                  <Text style={styles.flagEmoji}>🇯🇵</Text>
                  <Text style={styles.japaneseText}>{post.phraseJa}</Text>
                  <Text style={styles.vietnameseText}>{post.phraseVi}</Text>
                </View>
                {/* Mascot standing next to bubble */}
                <View style={styles.mascotStand}>
                  <Text style={styles.mascotStandEmoji}>💁‍♀️</Text>
                </View>
              </View>
            ) : (
              // Streak achievement post
              <View style={styles.contentStreakContainer}>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakText}>
                    Đã chạm mốc {post.streakDays} ngày{'\n'}Streak bạn bè!
                  </Text>
                </View>
                {/* Double Flame Badge */}
                <View style={styles.streakBadgeContainer}>
                  <Text style={styles.streakBadgeEmoji}>🔥</Text>
                  <View style={styles.badgeAvatars}>
                    <Text style={styles.badgeAvatarText}>🦊</Text>
                    <Text style={styles.badgeAvatarText}>🦁</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Post Footer (Likes / Actions) */}
            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={[styles.likeButton, post.isLiked && styles.likedButton]}
                onPress={() => toggleLike(post.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.likeIcon}>{post.isLiked ? '❤️' : '♡'}</Text>
                <Text style={styles.likeText}>{post.likesCount}</Text>
              </TouchableOpacity>
              
              <Text style={styles.likedBy}>{post.likedByText}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B', // Sleek dark mode background matching screenshot
  },
  header: {
    backgroundColor: '#0F172A',
    paddingVertical: Spacing.four,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    fontSize: 32,
    backgroundColor: '#F472B6',
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: 'center',
    lineHeight: 44,
  },
  doubleAvatarContainer: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  avatarMini: {
    fontSize: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#60A5FA',
    textAlign: 'center',
    lineHeight: 32,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  avatarOffset: {
    left: 12,
    top: 12,
    backgroundColor: '#F59E0B',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
  },
  actionText: {
    fontWeight: FontWeights.regular,
    color: '#94A3B8',
  },
  timeAgo: {
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginTop: 2,
  },
  // Phrase post styling
  contentPhraseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: Spacing.four,
    gap: Spacing.two,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#334155',
    position: 'relative',
  },
  flagEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  japaneseText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  vietnameseText: {
    fontSize: FontSizes.sm,
    color: '#94A3B8',
    marginTop: 4,
  },
  mascotStand: {
    width: 50,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotStandEmoji: {
    fontSize: 48,
  },
  // Streak post styling
  contentStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.four,
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  streakInfo: {
    flex: 1,
  },
  streakText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  streakBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 80,
    height: 80,
  },
  streakBadgeEmoji: {
    fontSize: 64,
  },
  badgeAvatars: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 12,
  },
  badgeAvatarText: {
    fontSize: 16,
    marginHorizontal: -2,
  },
  // Footer
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
  },
  likedButton: {
    borderColor: Colors.secondary,
  },
  likeIcon: {
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  likeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#FFFFFF',
  },
  likedBy: {
    fontSize: FontSizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
});
