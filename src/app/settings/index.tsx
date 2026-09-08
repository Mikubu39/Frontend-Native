import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { useTutorial } from "@/contexts/tutorial-context";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import type { ThemeMode } from "@/types";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { startTutorial } = useTutorial();
  const { showInfo, showSuccess } = useToast();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { soundEnabled, setSoundEnabled, playCorrect, playIncorrect } =
    useSoundEffect();
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [soundModalVisible, setSoundModalVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const themeOptions: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: "light",
      label: "Chế độ Sáng",
      description: "Giao diện màu kem tươi sáng, sắc nét",
      icon: "sunny-outline",
    },
    {
      id: "dark",
      label: "Chế độ Tối",
      description: "Giao diện nền tối Obsidian, dịu mắt ban đêm",
      icon: "moon-outline",
    },
    {
      id: "system",
      label: "Theo hệ thống",
      description: "Tự động thay đổi theo cài đặt thiết bị",
      icon: "phone-portrait-outline",
    },
  ];

  const getThemeBadgeText = () => {
    switch (themeMode) {
      case "light":
        return "Sáng ☀️";
      case "dark":
        return "Tối 🌙";
      case "system":
      default:
        return "Hệ thống 📱";
    }
  };

  const renderSection = (
    title: string,
    items: {
      icon: any;
      label: string;
      badge?: string;
      isDestructive?: boolean;
      onPress: () => void;
    }[],
  ) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.item,
              { backgroundColor: colors.card },
              index < items.length - 1 && [
                styles.itemBorder,
                { borderBottomColor: colors.borderSubtle },
              ],
            ]}
            onPress={item.onPress}
          >
            <View style={styles.itemLeft}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.isDestructive ? Colors.error : Colors.primary}
                style={styles.itemIcon}
              />
              <Text
                style={[
                  styles.itemLabel,
                  { color: colors.text },
                  item.isDestructive && styles.itemLabelDestructive,
                ]}
              >
                {item.label}
              </Text>
            </View>
            <View style={styles.itemRight}>
              {item.badge ? (
                <View
                  style={[
                    styles.badgeContainer,
                    { backgroundColor: isDark ? "#2A2A3E" : "#FFF3D0" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isDark ? Colors.accentPale : Colors.primaryDark,
                      },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              ) : null}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Cài đặt
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderSection("Giao diện & Tuỳ chọn", [
          {
            icon: isDark ? "moon-outline" : "sunny-outline",
            label: "Chế độ giao diện",
            badge: getThemeBadgeText(),
            onPress: () => setThemeModalVisible(true),
          },
          {
            icon: "notifications-outline",
            label: "Thông báo",
            onPress: () =>
              showInfo("Thông báo", "Cài đặt thông báo đang được phát triển."),
          },
          {
            icon: "volume-high-outline",
            label: "Âm thanh và hiệu ứng",
            badge: soundEnabled ? "Bật 🔔" : "Tắt 🔕",
            onPress: () => setSoundModalVisible(true),
          },
          {
            icon: "accessibility-outline",
            label: "Trợ năng",
            onPress: () =>
              showInfo(
                "Trợ năng",
                "Ứng dụng đã hỗ trợ Screen Reader (VoiceOver / TalkBack).",
              ),
          },
        ])}

        {renderSection("Tài khoản", [
          {
            icon: "person-circle-outline",
            label: "Thông tin tài khoản",
            onPress: () => router.push("/profile/edit"),
          },
          {
            icon: "lock-closed-outline",
            label: "Đổi mật khẩu",
            onPress: () =>
              showInfo("Đổi mật khẩu", "Tính năng đang được phát triển."),
          },
          {
            icon: "globe-outline",
            label: "Ngôn ngữ",
            onPress: () =>
              showInfo(
                "Ngôn ngữ",
                "Ứng dụng hiện hỗ trợ Tiếng Việt & Tiếng Nhật.",
              ),
          },
        ])}

        {renderSection("Khác", [
          {
            icon: "sparkles-outline",
            label: "Xem lại hướng dẫn",
            // Tour tự điều hướng tới màn hình của từng bước, nên bật tại chỗ là đủ.
            onPress: startTutorial,
          },
          {
            icon: "help-circle-outline",
            label: "Trợ giúp",
            onPress: () =>
              showInfo(
                "Trợ giúp",
                "Mọi thắc mắc xin liên hệ support@nihongo.app",
              ),
          },
          {
            icon: "information-circle-outline",
            label: "Về Nihongo",
            onPress: () =>
              showInfo(
                "Nihongo v1.0.0",
                "Ứng dụng học tiếng Nhật phong cách Gamification.",
              ),
          },
          {
            icon: "log-out-outline",
            label: "Đăng xuất",
            isDestructive: true,
            onPress: handleSignOut,
          },
        ])}
      </ScrollView>

      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThemeModalVisible(false)}
        >
          <View
            style={[
              styles.themeModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeModalHeader}>
              <Text style={[styles.themeModalTitle, { color: colors.text }]}>
                Chọn giao diện
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setThemeModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeOptionsContainer}>
              {themeOptions.map((option) => {
                const isSelected = themeMode === option.id;
                return (
                  <AnimatedPressable
                    key={option.id}
                    style={[
                      styles.themeOptionRow,
                      {
                        borderColor: isSelected
                          ? Colors.primary
                          : colors.border,
                        backgroundColor: isSelected
                          ? isDark
                            ? "#232338"
                            : "#E8EAF4"
                          : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setThemeMode(option.id);
                      setThemeModalVisible(false);
                      showSuccess(
                        "Đã chuyển giao diện",
                        `Đã chọn ${option.label}`,
                      );
                    }}
                    pressScale={0.98}
                  >
                    <View style={styles.themeOptionLeft}>
                      <View
                        style={[
                          styles.themeOptionIconCircle,
                          {
                            backgroundColor: isSelected
                              ? Colors.primary
                              : isDark
                                ? "#2A2A3E"
                                : "#F3F4F6",
                          },
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={isSelected ? "#FFFFFF" : colors.textSecondary}
                        />
                      </View>
                      <View style={{ gap: 2 }}>
                        <Text
                          style={[
                            styles.themeOptionLabel,
                            {
                              color: isSelected ? Colors.primary : colors.text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.themeOptionDesc,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {option.description}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected
                            ? Colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerCircle} />}
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={soundModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSoundModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSoundModalVisible(false)}
        >
          <View
            style={[
              styles.themeModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeModalHeader}>
              <Text style={[styles.themeModalTitle, { color: colors.text }]}>
                Âm thanh & Hiệu ứng
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSoundModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: Spacing.four }}>
              {/* Switch Row */}
              <View
                style={[
                  styles.soundSettingCard,
                  {
                    backgroundColor: isDark ? "#232338" : "#F8FAFC",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 4, paddingRight: Spacing.three }}>
                  <Text
                    style={[styles.soundSettingLabel, { color: colors.text }]}
                  >
                    Hiệu ứng âm thanh (SFX)
                  </Text>
                  <Text
                    style={[
                      styles.soundSettingDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Phát chuông vui tươi khi trả lời đúng và âm trầm nhẹ khi trả
                    lời sai.
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={(val) => {
                    setSoundEnabled(val);
                    showSuccess(
                      "Âm thanh",
                      val
                        ? "Đã bật hiệu ứng âm thanh."
                        : "Đã tắt hiệu ứng âm thanh.",
                    );
                  }}
                  trackColor={{
                    false: isDark ? "#3F3F5A" : "#CBD5E1",
                    true: Colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Sound Preview Section */}
              <View style={{ gap: Spacing.two }}>
                <Text
                  style={[
                    styles.soundPreviewTitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  NGHE THỬ HIỆU ỨNG
                </Text>

                <View style={styles.soundPreviewButtonsRow}>
                  <AnimatedPressable
                    style={[
                      styles.soundPreviewButton,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F0FDF4",
                        borderColor: Colors.success,
                      },
                    ]}
                    onPress={() => playCorrect()}
                    pressScale={0.96}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success}
                    />
                    <Text
                      style={[
                        styles.soundPreviewButtonText,
                        { color: Colors.success },
                      ]}
                    >
                      Âm Đúng 🔔
                    </Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    style={[
                      styles.soundPreviewButton,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FEF2F2",
                        borderColor: Colors.error,
                      },
                    ]}
                    onPress={() => playIncorrect()}
                    pressScale={0.96}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.error}
                    />
                    <Text
                      style={[
                        styles.soundPreviewButtonText,
                        { color: Colors.error },
                      ]}
                    >
                      Âm Sai ❌
                    </Text>
                  </AnimatedPressable>
                </View>
              </View>

              {/* Haptics info note */}
              <View
                style={[
                  styles.soundInfoBox,
                  {
                    backgroundColor: isDark ? "#1C1C2E" : "#F1F5F9",
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={Colors.primary}
                />
                <Text
                  style={[
                    styles.soundInfoText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Phản hồi rung (Haptics) và âm thanh phát âm tiếng Nhật luôn
                  hoạt động song song.
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.two,
    marginLeft: -Spacing.two,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Spacing.five,
    paddingBottom: Spacing.eight,
  },
  section: {
    marginBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    textTransform: "uppercase",
    marginBottom: Spacing.three,
    marginLeft: Spacing.two,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    ...Shadows.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.four,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badgeContainer: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  itemIcon: {
    marginRight: Spacing.four,
  },
  itemLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    fontFamily: Fonts.sans,
  },
  itemLabelDestructive: {
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.five,
  },
  themeModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    borderWidth: 1.5,
    ...Shadows.lg,
  },
  themeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.five,
  },
  themeModalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    fontFamily: Fonts.rounded,
  },
  closeButton: {
    padding: Spacing.one,
  },
  themeOptionsContainer: {
    gap: Spacing.three,
  },
  themeOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  themeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    flex: 1,
  },
  themeOptionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  themeOptionLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  themeOptionDesc: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.sans,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.two,
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  soundSettingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  soundSettingLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  soundSettingDesc: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.sans,
    lineHeight: 18,
  },
  soundPreviewTitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
    letterSpacing: 0.5,
    marginTop: Spacing.one,
  },
  soundPreviewButtonsRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  soundPreviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  soundPreviewButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    fontFamily: Fonts.rounded,
  },
  soundInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  soundInfoText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.sans,
    lineHeight: 16,
  },
});
