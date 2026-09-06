import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { userService } from "@/services/api/user";
import { FollowUserDto } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { resolveAvatarUri } from "@/utils/media";
import { BackButton } from "@/components/ui/back-button";

/**
 * Danh sách người theo dõi / đang theo dõi của 1 user (theo id).
 * `type` quyết định gọi GET /users/{id}/followers hay .../following - 2 API
 * cùng shape (FollowUserDto[] phân trang cursor).
 */
export default function ConnectionsScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    type: "followers" | "following";
  }>();
  const router = useRouter();
  const colors = useTheme();

  const userId = parseInt(params.userId || "0", 10);
  const isFollowers = params.type !== "following";

  const [items, setItems] = useState<FollowUserDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const page = isFollowers
          ? await userService.getFollowers(userId)
          : await userService.getFollowing(userId);
        if (isMounted) {
          setItems(page.items);
          setNextCursor(page.nextCursor);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (userId) load();
    return () => {
      isMounted = false;
    };
  }, [userId, isFollowers]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const page = isFollowers
        ? await userService.getFollowers(userId, nextCursor)
        : await userService.getFollowing(userId, nextCursor);
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleFollow = async (id: number, index: number) => {
    try {
      const newStatus = await userService.toggleFollow(id);
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], isFollowing: newStatus };
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <BackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.text }]}>
          {isFollowers ? "Người theo dõi" : "Đang theo dõi"}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={Colors.primary}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: Spacing.four }}
                size="small"
                color={Colors.primary}
              />
            ) : null
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.userCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderSubtle,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/friends/view-search-profile",
                  params: {
                    id: item.id.toString(),
                    displayName: item.displayName,
                    avatarUrl: item.avatarUrl || "null",
                    level: "1",
                    isFollowing: item.isFollowing?.toString() || "false",
                  },
                })
              }
            >
              {item.avatarUrl ? (
                <Image
                  source={{ uri: resolveAvatarUri(item.avatarUrl) }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text
                style={[styles.fullName, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.displayName}
              </Text>
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  item.isFollowing && [
                    styles.followingBtn,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.borderSubtle,
                    },
                  ],
                ]}
                onPress={() => handleToggleFollow(item.id, index)}
              >
                <Text
                  style={[
                    styles.followBtnText,
                    item.isFollowing && [
                      styles.followingBtnText,
                      { color: colors.text },
                    ],
                  ]}
                >
                  {item.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isFollowers ? "Chưa có ai theo dõi bạn." : "Chưa theo dõi ai."}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: FontSizes.xxl,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  loader: {
    marginTop: Spacing.eight,
  },
  listContainer: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
  avatarText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  fullName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  followingBtn: {
    borderWidth: 1,
  },
  followBtnText: {
    color: "white",
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  followingBtnText: {},
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.eight,
  },
});
