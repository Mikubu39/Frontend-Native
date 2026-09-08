import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  Shadows,
} from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { StaggeredList } from "@/components/ui/staggered-list";
import { useToast } from "@/contexts/toast-context";
import { userService } from "@/services/api/user";
import * as Contacts from "expo-contacts";
import { UserOverviewResponse } from "@/types/user-api";
import { useTheme } from "@/hooks/use-theme";
import { resolveAvatarUri } from "@/utils/media";

interface FriendOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
}

const OPTIONS: FriendOption[] = [
  {
    id: "find",
    icon: "search-outline",
    title: "Tìm kiếm bạn bè",
    subtitle: "Tìm theo tên hiển thị hoặc username",
    color: Colors.primary,
  },
  {
    id: "sync",
    icon: "phone-portrait-outline",
    title: "Tìm từ danh bạ",
    subtitle: "Kết nối với bạn bè trong danh bạ",
    color: Colors.success,
  },
  {
    id: "share",
    icon: "qr-code-outline",
    title: "Chia sẻ mã cá nhân",
    subtitle: "Mã QR để bạn bè kết nối nhanh chóng",
    color: Colors.accent,
  },
  {
    id: "scan",
    icon: "scan-outline",
    title: "Quét mã QR",
    subtitle: "Quét mã của bạn bè để kết nối",
    color: Colors.secondary,
  },
];

export default function FriendsScreen() {
  const router = useRouter();
  const themeColors = useTheme();
  const { showError, showWarning, showInfo } = useToast();
  const [syncResults, setSyncResults] = useState<UserOverviewResponse[] | null>(
    null,
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncContacts = async () => {
    try {
      setIsSyncing(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        showWarning(
          "Quyền bị từ chối",
          "Ứng dụng cần quyền truy cập danh bạ để tìm bạn bè.",
        );
        setIsSyncing(false);
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        const phoneNumbers = data
          .map((c) => c.phoneNumbers?.[0]?.number)
          .filter(Boolean) as string[];

        // Remove spaces and special characters for a clean match
        const cleanedNumbers = phoneNumbers.map((num) =>
          num.replace(/[^a-zA-Z0-9+]/g, ""),
        );

        // Send both raw and cleaned formats to maximize matching chance (increased limit to 1000 to not cut off test contacts)
        const toSync = Array.from(
          new Set([...phoneNumbers, ...cleanedNumbers]),
        ).slice(0, 1000);

        console.log("Found raw contacts:", phoneNumbers.length);
        console.log("Sending to backend:", toSync.length);

        const results = await userService.syncContacts({
          phoneNumbers: toSync,
        });
        console.log("Backend returned results:", results);
        setSyncResults(results);
      } else {
        setSyncResults([]);
      }
    } catch (e) {
      console.error(e);
      showError("Lỗi", "Không thể đồng bộ danh bạ.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOptionPress = (id: string) => {
    if (id === "find") {
      router.push("/friends/search");
    } else if (id === "sync") {
      handleSyncContacts();
    } else if (id === "share") {
      router.push("/profile/qr");
    } else if (id === "scan") {
      router.push("/friends/scan");
    } else {
      showInfo("Thông báo", "Tính năng đang phát triển.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: themeColors.card,
            borderBottomColor: themeColors.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Thêm Bạn Bè
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/friends/scan")}
          style={styles.backBtn}
          accessibilityLabel="Quét mã QR"
        >
          <Ionicons name="scan-outline" size={22} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.options}>
        <StaggeredList staggerDelay={50}>
          {OPTIONS.map((option) => (
            <AnimatedPressable
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.borderSubtle,
                },
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={option.id === "sync" && isSyncing}
              pressScale={0.98}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "15" },
                ]}
              >
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: themeColors.text }]}>
                  {option.title}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {option.subtitle}
                </Text>
              </View>
              {option.id === "sync" && isSyncing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <View
                  style={[
                    styles.arrowContainer,
                    { backgroundColor: themeColors.backgroundElement },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themeColors.textSecondary}
                  />
                </View>
              )}
            </AnimatedPressable>
          ))}
        </StaggeredList>
      </View>

      <Modal
        visible={syncResults !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themeColors.background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: themeColors.borderSubtle },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Kết quả đồng bộ
              </Text>
              <TouchableOpacity
                onPress={() => setSyncResults(null)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={syncResults || []}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    setSyncResults(null);
                    router.push({
                      pathname: "/friends/view-search-profile",
                      params: {
                        id: item.id?.toString() || "",
                        username: (item as any).username || item.id?.toString(),
                        displayName: item.displayName || "Người dùng",
                        avatarUrl: item.avatarUrl || "",
                        level: item.level?.toString() || "1",
                        isFollowing: "false",
                      },
                    });
                  }}
                >
                  {item.avatarUrl ? (
                    <Image
                      source={{ uri: resolveAvatarUri(item.avatarUrl) }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {item.displayName
                          ? String(item.displayName).charAt(0).toUpperCase()
                          : "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text
                      style={[styles.fullName, { color: themeColors.text }]}
                    >
                      {item.displayName || "Người dùng"}
                    </Text>
                    <Text
                      style={[
                        styles.userLevel,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Lv {item.level || 1}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themeColors.textSecondary}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={themeColors.textSecondary}
                    style={{ marginBottom: Spacing.four }}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Không tìm thấy bạn bè nào dùng ứng dụng này trong danh bạ
                    của bạn.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  options: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.four,
  },
  optionText: {
    flex: 1,
    justifyContent: "center",
  },
  optionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.four,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  listContainer: {
    padding: Spacing.four,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.four,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.four,
  },
  avatarText: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  userLevel: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: FontWeights.semibold,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.sixteen,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
