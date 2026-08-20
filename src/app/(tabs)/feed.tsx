/**
 * Feed / Bảng Tin Screen - Enhanced with animated like button,
 * staggered card entrances, and improved card design.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  actionText: string;
  timeAgo: string;
  type: "phrase" | "streak";
  phraseJa?: string;
  phraseVi?: string;
  streakDays?: number;
  likesCount: number;
  likedByText: string;
  isLiked?: boolean;
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: "p1",
    authorName: "uyên",
    authorAvatar: "👩‍🎤",
    actionText: "đã chia sẻ một câu",
    timeAgo: "3 ngày",
    type: "phrase",
    phraseJa: "ベトナム人です。",
    phraseVi: "Tôi là người Việt Nam.",
    likesCount: 693,
    likedByText: "Hoàng và nhiều người khác đã thích",
    isLiked: false,
  },
  {
    id: "p2",
    authorName: "dunn và Jaime",
    authorAvatar: "🦊",
    actionText: "",
    timeAgo: "2 ngày",
    type: "streak",
    streakDays: 725,
    likesCount: 2933,
    likedByText: "Hà Thạch và nhiều người khác đã thích",
    isLiked: true,
  },
  {
    id: "p3",
    authorName: "Happy và Trang",
    authorAvatar: "🦄",
    actionText: "",
    timeAgo: "22 tiếng",
    type: "streak",
    streakDays: 485,
    likesCount: 1485,
    likedByText: "Minh và nhiều người khác đã thích",
    isLiked: false,
  },
];

/** Animated like button with heart bounce */
function LikeButton({
  isLiked,
  count,
  onPress,
}: {
  isLiked: boolean;
  count: number;
  onPress: () => void;
}) {
  const heartScale = useSharedValue(1);

  const handlePress = () => {
    heartScale.value = withSequence(
      withTiming(0.6, { duration: 60 }),
      withSpring(1.3, AnimationPresets.springBouncy),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    onPress();
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.likeButton, isLiked && styles.likedButton]}
      onPress={handlePress}
      pressScale={0.95}
    >
      <Animated.Text style={[styles.likeIcon, heartStyle]}>
        {isLiked ? "❤️" : "♡"}
      </Animated.Text>
      <Text style={[styles.likeText, isLiked && { color: Colors.secondary }]}>
        {count}
      </Text>
    </AnimatedPressable>
  );
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const colors = useTheme();

  const toggleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      }),
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Bảng tin</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {posts.map((post, index) => (
            <Animated.View
              key={post.id}
              entering={FadeIn.delay(
                index * AnimationPresets.staggerDelay,
              ).duration(400)}
            >
              <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle, shadowColor: "transparent", borderWidth: 1, elevation: 0 }]}>
                {/* Post Author / Header */}
                <View style={styles.authorRow}>
                  {post.id === "p2" ? (
                    // Double avatar for dual streak
                    <View style={styles.doubleAvatarContainer}>
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: "#60A5FA", zIndex: 2 },
                        ]}
                      >
                        <Text style={styles.avatarMiniText}>🦊</Text>
                      </View>
                      <View
                        style={[
                          styles.avatarCircle,
                          styles.avatarOffset,
                          { backgroundColor: "#F59E0B" },
                        ]}
                      >
                        <Text style={styles.avatarMiniText}>🦁</Text>
                      </View>
                    </View>
                  ) : post.id === "p3" ? (
                    <View style={styles.doubleAvatarContainer}>
                      <View
                        style={[
                          styles.avatarCircle,
                          { backgroundColor: "#A78BFA", zIndex: 2 },
                        ]}
                      >
                        <Text style={styles.avatarMiniText}>🦄</Text>
                      </View>
                      <View
                        style={[
                          styles.avatarCircle,
                          styles.avatarOffset,
                          { backgroundColor: "#F472B6" },
                        ]}
                      >
                        <Text style={styles.avatarMiniText}>🐰</Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.singleAvatar,
                        { backgroundColor: "#F472B6" },
                      ]}
                    >
                      <Text style={styles.singleAvatarText}>
                        {post.authorAvatar}
                      </Text>
                    </View>
                  )}

                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, { color: colors.text }]}>
                      {post.authorName}{" "}
                      {post.actionText ? (
                        <Text style={styles.actionText}>{post.actionText}</Text>
                      ) : null}
                    </Text>
                    <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                  </View>
                </View>

                {/* Post Content */}
                {post.type === "phrase" ? (
                  <View style={styles.contentPhraseContainer}>
                    {/* Speech Bubble */}
                    <View style={[styles.speechBubble, { backgroundColor: colors.backgroundElement }]}>
                      <Text style={styles.flagEmoji}>🇯🇵</Text>
                      <Text style={[styles.japaneseText, { color: colors.text }]}>{post.phraseJa}</Text>
                      <Text style={styles.vietnameseText}>{post.phraseVi}</Text>
                    </View>
                    {/* Mascot standing next to bubble */}
                    <View style={styles.mascotStand}>
                      <Text style={styles.mascotStandEmoji}>💁‍♀️</Text>
                    </View>
                  </View>
                ) : (
                  // Streak achievement post
                  <View style={[styles.contentStreakContainer, { backgroundColor: colors.backgroundElement }]}>
                    <View style={styles.streakInfo}>
                      <Text style={[styles.streakText, { color: colors.text }]}>
                        Đã chạm mốc {post.streakDays} ngày{"\n"}Streak bạn bè!
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
                <View style={[styles.postFooter, { borderTopColor: colors.borderSubtle }]}>
                  <LikeButton
                    isLiked={post.isLiked ?? false}
                    count={post.likesCount}
                    onPress={() => toggleLike(post.id)}
                  />
                  <Text style={styles.likedBy}>{post.likedByText}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
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
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.four,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    marginBottom: Spacing.four,
    ...Shadows.sm,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  singleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  singleAvatarText: {
    fontSize: 26,
  },
  doubleAvatarContainer: {
    position: "relative",
    width: 48,
    height: 48,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    top: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarMiniText: {
    fontSize: 20,
  },
  avatarOffset: {
    left: 14,
    top: 14,
    zIndex: 1,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  actionText: {
    fontWeight: FontWeights.regular,
    color: Colors.textSecondary,
  },
  timeAgo: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Phrase post styling
  contentPhraseContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: Spacing.four,
    gap: Spacing.two,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
  },
  flagEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  japaneseText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  vietnameseText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  mascotStand: {
    width: 50,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotStandEmoji: {
    fontSize: 48,
  },
  // Streak post styling
  contentStreakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: Spacing.four,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
  },
  streakInfo: {
    flex: 1,
  },
  streakText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  streakBadgeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 80,
    height: 80,
  },
  streakBadgeEmoji: {
    fontSize: 64,
  },
  badgeAvatars: {
    position: "absolute",
    flexDirection: "row",
    bottom: 12,
  },
  badgeAvatarText: {
    fontSize: 16,
    marginHorizontal: -2,
  },
  // Footer
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.lockedBg,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.two,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: Spacing.four,
  },
  likedButton: {
    borderColor: Colors.secondary,
    backgroundColor: "#FFF1F2",
  },
  likeIcon: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  likeText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  likedBy: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
