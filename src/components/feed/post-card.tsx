/**
 * PostCard - One item in the community feed. Renders a plain USER_STATUS
 * status update, or a distinct gold-styled card for BE-generated
 * SYSTEM_ACHIEVEMENT posts (auto-created when the user unlocks an
 * achievement - see FE_API_GUIDE_SOCIAL_FEED.md section 9).
 */

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  AnimationPresets,
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { FeedPostResponse } from "@/types/api";
import { resolveMediaUrl } from "@/utils/media";
import { formatRelativeTime } from "@/utils/relative-time";

interface PostCardProps {
  post: FeedPostResponse;
  isOwnPost: boolean;
  cardColor: string;
  borderColor: string;
  textColor: string;
  textSecondaryColor: string;
  backgroundElementColor: string;
  onToggleLike: (post: FeedPostResponse) => void;
  onOpenComments: (post: FeedPostResponse) => void;
  onDelete: (post: FeedPostResponse) => void;
}

function AuthorAvatar({
  avatarUrl,
  displayName,
}: {
  avatarUrl: string | null;
  displayName: string;
}) {
  const resolved = resolveMediaUrl(avatarUrl);
  if (resolved) {
    return <Image source={{ uri: resolved }} style={styles.avatar} />;
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarPlaceholderText}>
        {displayName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export function PostCard({
  post,
  isOwnPost,
  cardColor,
  borderColor,
  textColor,
  textSecondaryColor,
  backgroundElementColor,
  onToggleLike,
  onOpenComments,
  onDelete,
}: PostCardProps) {
  const heartScale = useSharedValue(1);
  const isAchievement = post.postType === "SYSTEM_ACHIEVEMENT";

  const handleLikePress = () => {
    heartScale.value = withSequence(
      withTiming(0.6, { duration: 60 }),
      withSpring(1.3, AnimationPresets.springBouncy),
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    onToggleLike(post);
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardColor, borderColor: borderColor },
      ]}
    >
      <View style={styles.authorRow}>
        <AuthorAvatar
          avatarUrl={post.author.avatarUrl}
          displayName={post.author.displayName}
        />
        <View style={styles.authorInfo}>
          <Text
            style={[styles.authorName, { color: textColor }]}
            numberOfLines={1}
          >
            {post.author.displayName}
          </Text>
          <Text style={styles.timeAgo}>
            {formatRelativeTime(post.createdAt)}
          </Text>
        </View>
        {isOwnPost && (
          <AnimatedPressable
            onPress={() => onDelete(post)}
            pressScale={0.9}
            style={styles.deleteBtn}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={textSecondaryColor}
            />
          </AnimatedPressable>
        )}
      </View>

      {isAchievement ? (
        <View style={styles.achievementContent}>
          <Text style={styles.achievementEmoji}>🏆</Text>
          <Text style={styles.achievementText}>{post.content}</Text>
        </View>
      ) : (
        <View
          style={[
            styles.statusBubble,
            { backgroundColor: backgroundElementColor },
          ]}
        >
          <Text style={[styles.statusText, { color: textColor }]}>
            {post.content}
          </Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <AnimatedPressable
          style={[
            styles.actionBtn,
            post.likedByMe && styles.actionBtnActive,
            { borderColor },
          ]}
          onPress={handleLikePress}
          pressScale={0.95}
        >
          <Animated.Text style={[styles.actionIcon, heartStyle]}>
            {post.likedByMe ? "❤️" : "♡"}
          </Animated.Text>
          <Text
            style={[
              styles.actionText,
              { color: textColor },
              post.likedByMe && { color: Colors.secondary },
            ]}
          >
            {post.likeCount}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[styles.actionBtn, { borderColor }]}
          onPress={() => onOpenComments(post)}
          pressScale={0.95}
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={textColor as string}
          />
          <Text style={[styles.actionText, { color: textColor }]}>
            {post.commentCount}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.five,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
  },
  timeAgo: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: Spacing.two,
  },
  statusBubble: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginTop: Spacing.four,
  },
  statusText: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  achievementContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "#FFF7E6",
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginTop: Spacing.four,
    borderWidth: 1,
    borderColor: "#F5A623",
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    lineHeight: 22,
    // Achievement card keeps a fixed light-gold background in both themes,
    // so its text must stay a fixed dark color instead of following textColor.
    color: "#7A4F01",
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.three,
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    marginTop: Spacing.four,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: Spacing.four,
  },
  actionBtnActive: {
    borderColor: Colors.secondary,
    backgroundColor: "#FFF1F2",
  },
  actionIcon: {
    fontSize: FontSizes.lg,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
