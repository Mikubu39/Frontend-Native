import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { userService } from "@/services/api/user";
import { useTheme } from "@/contexts/theme-context";
import { resolveAvatarUri } from "@/utils/media";
import { translateRank } from "@/utils/rank-tier";
import { PublicProfileResponse } from "@/types/api";
import { BackButton } from "@/components/ui/back-button";
import {
  ProfileCard,
  ProfileCardStat,
} from "@/components/friends/profile-card";

export default function ViewSearchProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    level: string;
    isFollowing: string;
  }>();

  const [isFollowing, setIsFollowing] = useState(params.isFollowing === "true");
  const [loading, setLoading] = useState(false);
  const [publicProfile, setPublicProfile] =
    useState<PublicProfileResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const id = Number(params.id);
    if (!id) return;

    userService
      .getPublicProfile(id)
      .then((data) => {
        if (isMounted) {
          setPublicProfile(data);
          setIsFollowing(data.isFollowing);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch public profile:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleToggleFollow = async () => {
    const id = Number(params.id);
    if (!id) return;

    setLoading(true);
    try {
      const newStatus = await userService.toggleFollow(id);
      setIsFollowing(newStatus);
      if (publicProfile) {
        setPublicProfile({
          ...publicProfile,
          followerCount: newStatus
            ? publicProfile.followerCount + 1
            : Math.max(0, publicProfile.followerCount - 1),
          isFollowing: newStatus,
        });
      }
    } catch (e) {
      console.error("Toggle follow failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const stats: ProfileCardStat[] = publicProfile
    ? [
        {
          key: "following",
          value: publicProfile.followingCount,
          label: "Đang theo dõi",
        },
        {
          key: "followers",
          value: publicProfile.followerCount,
          label: "Người theo dõi",
        },
        {
          key: "streak",
          value: `🔥 ${publicProfile.currentStreak}`,
          label: "Streak",
        },
      ]
    : [
        {
          key: "level",
          value: `Lv ${params.level || "1"}`,
          label: "Cấp độ",
        },
      ];

  const avatarUrl =
    params.avatarUrl && params.avatarUrl !== "null"
      ? resolveAvatarUri(params.avatarUrl)
      : null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.text }]}>Hồ sơ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ProfileCard
          displayName={params.displayName}
          avatarUrl={avatarUrl}
          stats={stats}
          rankLabel={
            publicProfile?.rankName
              ? `Hạng ${translateRank(publicProfile.rankName)}`
              : undefined
          }
          isFollowing={isFollowing}
          onToggleFollow={handleToggleFollow}
          followLoading={loading}
          colors={colors}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.six,
  },
});
