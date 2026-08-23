import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { userService } from "@/services/api/user";
import { GradientButton } from "@/components/ui/gradient-button";
import { useTheme } from "@/hooks/use-theme";
import { resolveMediaUrl } from "@/utils/media";

export default function ViewSearchProfileScreen() {
  const params = useLocalSearchParams<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    level: string;
    isFollowing: string;
  }>();

  const router = useRouter();
  const colors = useTheme();

  const id = parseInt(params.id || "0", 10);
  const [isFollowing, setIsFollowing] = useState(params.isFollowing === "true");
  const [toggling, setToggling] = useState(false);

  const handleToggleFollow = async () => {
    if (!id) return;
    setToggling(true);
    try {
      const newStatus = await userService.toggleFollow(id);
      setIsFollowing(newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Hồ Sơ</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: colors.card,
              shadowColor: "transparent",
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              elevation: 0,
            },
          ]}
        >
          {params.avatarUrl && params.avatarUrl !== "null" ? (
            <Image
              source={{ uri: resolveMediaUrl(params.avatarUrl) }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {params.displayName?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <Text style={[styles.fullName, { color: colors.text }]}>
            {params.displayName}
          </Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                Lv {params.level || "1"}
              </Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <GradientButton
              title={isFollowing ? "Đang Theo dõi" : "Theo dõi"}
              onPress={handleToggleFollow}
              disabled={toggling}
            />
          </View>
        </View>
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
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
  profileHeader: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.four,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four,
  },
  avatarText: {
    fontSize: 40,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  fullName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.six,
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.one,
  },
  actionContainer: {
    width: "100%",
  },
});
