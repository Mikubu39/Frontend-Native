import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { userService } from "@/services/api/user";
import { UserProfileResponse } from "@/types/user-api";
import { resolveAvatarUri } from "@/utils/media";
import { BackButton } from "@/components/ui/back-button";
import { ProfileCard, ProfileCardStat } from "@/components/friends/profile-card";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!username) return;
    try {
      const cleanUsername = (username as string).replace(/^@/, "").trim();
      const data = await userService.getProfileByUsername(cleanUsername);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username, loadProfile]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const newStatus = await userService.toggleFollow(profile.id);
      setProfile({
        ...profile,
        isFollowing: newStatus,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Không tìm thấy người dùng
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={{ color: Colors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const stats: ProfileCardStat[] = [
    { key: "level", value: `Lv ${profile.level}`, label: "Cấp độ" },
  ];

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
          displayName={profile.displayName}
          username={profile.username}
          avatarUrl={
            profile.avatarUrl ? resolveAvatarUri(profile.avatarUrl) : null
          }
          stats={stats}
          isFollowing={profile.isFollowing}
          onToggleFollow={handleToggleFollow}
          followLoading={toggling}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.six,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  goBackButton: {
    marginTop: Spacing.five,
  },
});
