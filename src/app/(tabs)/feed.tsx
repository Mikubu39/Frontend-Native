/**
 * Feed / Bảng Tin Screen - bài của mình + người đang follow (GET /api/v1/feed),
 * đăng trạng thái, like, bình luận. Xem FE_API_GUIDE_SOCIAL_FEED.md.
 */

import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { ComposeBar } from "@/components/feed/compose-bar";
import { PostCard } from "@/components/feed/post-card";
import { CommentsModal } from "@/components/feed/comments-modal";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { feedApi } from "@/services/api/feed";
import { FeedPostResponse } from "@/types/api";

export default function FeedScreen() {
  const colors = useTheme();
  const { user } = useAuth();
  const { showError } = useToast();
  const currentUserId = user?.id ? Number(user.id) : null;

  const [posts, setPosts] = useState<FeedPostResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [activePost, setActivePost] = useState<FeedPostResponse | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      const page = await feedApi.getFeed();
      setPosts(page.items);
      setNextCursor(page.nextCursor);
    } catch (e) {
      console.error(e);
      showError("Lỗi", "Không thể tải bảng tin.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await feedApi.getFeed(nextCursor);
      setPosts((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleLike = async (post: FeedPostResponse) => {
    const wasLiked = post.likedByMe;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likedByMe: !wasLiked,
              likeCount: p.likeCount + (wasLiked ? -1 : 1),
            }
          : p,
      ),
    );
    try {
      if (wasLiked) await feedApi.unlikePost(post.id);
      else await feedApi.likePost(post.id);
    } catch (e) {
      console.error(e);
      // rollback on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: wasLiked, likeCount: post.likeCount }
            : p,
        ),
      );
    }
  };

  const handlePost = async () => {
    const content = composeText.trim();
    if (!content) return;
    setPosting(true);
    try {
      await feedApi.createPost({ content });
      setComposeText("");
      await loadFeed();
    } catch (e) {
      console.error(e);
      showError("Lỗi", "Không thể đăng bài.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (post: FeedPostResponse) => {
    try {
      await feedApi.deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (e) {
      console.error(e);
      showError("Lỗi", "Không thể xoá bài đăng.");
    }
  };

  const adjustCommentCount = (postId: number, delta: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p,
      ),
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Bảng tin
          </Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListHeaderComponent={
            <ComposeBar
              value={composeText}
              onChangeText={setComposeText}
              onSubmit={handlePost}
              posting={posting}
              avatarUrl={user?.avatarUrl}
              displayName={user?.displayName}
              cardColor={colors.card}
              textColor={colors.text}
              placeholderColor={colors.textSecondary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Chưa có bài đăng nào. Hãy theo dõi bạn bè hoặc tự đăng 1 bài!
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isOwnPost={item.author.id === currentUserId}
              cardColor={colors.card}
              borderColor={colors.borderSubtle}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              backgroundElementColor={colors.backgroundElement}
              onToggleLike={handleToggleLike}
              onOpenComments={setActivePost}
              onDelete={handleDelete}
            />
          )}
        />

        <CommentsModal
          visible={activePost !== null}
          postId={activePost?.id ?? null}
          currentUserId={currentUserId}
          cardColor={colors.card}
          backgroundColor={colors.background}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          borderColor={colors.borderSubtle}
          onClose={() => setActivePost(null)}
          onCommentAdded={(postId) => adjustCommentCount(postId, 1)}
          onCommentDeleted={(postId) => adjustCommentCount(postId, -1)}
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
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.eight,
    fontSize: FontSizes.sm,
    paddingHorizontal: Spacing.six,
  },
});
