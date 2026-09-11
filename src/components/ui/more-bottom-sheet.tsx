/**
 * MoreBottomSheet - Menu "Thêm" (khám phá thêm) của thanh điều hướng đáy.
 *
 * Tinh gọn và phân nhóm chuẩn UX:
 * - Nhóm 1 (Học tập & Cá nhân): Hồ sơ, Luyện tập, Chữ Kana, Sổ tay từ điển.
 * - Nhóm 2 (Hệ thống): Cài đặt, Đăng xuất.
 * - Đã loại bỏ hoàn toàn các mục dư thừa/trùng lặp: Bảng xếp hạng (đã có tab riêng),
 *   Bạn bè (đã có tab riêng & nút trong Hồ sơ), Trợ giúp (tính năng rỗng).
 * - Sử dụng `SignOutModal` thiết kế riêng thay vì `Alert.alert` mặc định của Android.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { SignOutModal } from "@/components/ui/sign-out-modal";

interface MoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface MoreOption {
  id: string;
  title: string;
  subtitle?: string;
  section: "learning" | "system";
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

export function MoreBottomSheet({ visible, onClose }: MoreBottomSheetProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!visible) return null;

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setShowSignOutModal(false);
      onClose();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      setShowSignOutModal(false);
      onClose();
    } finally {
      setIsSigningOut(false);
    }
  };

  const options: MoreOption[] = [
    // Nhóm 1: Học tập & Cá nhân
    {
      id: "profile",
      title: "Hồ sơ cá nhân",
      subtitle: "Cấp độ, chuỗi ngày & thành tích",
      section: "learning",
      icon: "person-outline",
      color: Colors.primary,
      route: "/(tabs)/profile",
    },
    {
      id: "review",
      title: "Trung tâm luyện tập",
      subtitle: "Ôn từ vựng, ngữ pháp & sửa lỗi",
      section: "learning",
      icon: "barbell-outline",
      color: Colors.success,
      route: "/(tabs)/review",
    },
    {
      id: "characters",
      title: "Bảng chữ Kana",
      subtitle: "Luyện bảng chữ cái Hiragana & Katakana",
      section: "learning",
      icon: "language-outline",
      color: Colors.accent,
      route: "/(tabs)/characters",
    },
    {
      id: "dictionary",
      title: "Sổ tay từ điển",
      subtitle: "Tra cứu từ vựng bạn đã tích lũy",
      section: "learning",
      icon: "book-outline",
      color: Colors.secondary,
      route: "/(tabs)/dictionary",
    },
    // Nhóm 2: Hệ thống
    {
      id: "settings",
      title: "Cài đặt",
      subtitle: "Âm thanh, thông báo & tài khoản",
      section: "system",
      icon: "settings-outline",
      color: colors.textSecondary,
      route: "/settings",
    },
    {
      id: "signout",
      title: "Đăng xuất",
      subtitle: "Thoát tài khoản khỏi thiết bị",
      section: "system",
      icon: "log-out-outline",
      color: Colors.error,
      isDestructive: true,
      onPress: () => setShowSignOutModal(true),
    },
  ];

  const learningOptions = options.filter((o) => o.section === "learning");
  const systemOptions = options.filter((o) => o.section === "system");

  const handlePress = (option: MoreOption) => {
    if (option.route) handleNavigate(option.route);
    else option.onPress?.();
  };

  const renderOption = (option: MoreOption) => {
    const isDestructive = option.isDestructive;
    return (
      <TouchableOpacity
        key={option.id}
        testID={`more-option-${option.id}`}
        style={[
          styles.optionButton,
          {
            backgroundColor: colors.card,
            borderColor: isDestructive
              ? isDark
                ? "rgba(239, 68, 68, 0.35)"
                : "rgba(239, 68, 68, 0.25)"
              : colors.border,
          },
        ]}
        onPress={() => handlePress(option)}
        accessibilityRole="button"
        accessibilityLabel={option.title}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: option.color + "18" },
          ]}
        >
          <Ionicons name={option.icon} size={22} color={option.color} />
        </View>

        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionTitle,
              {
                color: isDestructive ? Colors.error : colors.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            {option.title}
          </Text>
          {option.subtitle ? (
            <Text
              style={[
                styles.optionSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: Fonts.sans,
                },
              ]}
              numberOfLines={1}
            >
              {option.subtitle}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            isDestructive ? Colors.error + "80" : colors.textSecondary + "70"
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(AnimationPresets.duration.fast)}
        style={styles.overlayContainer}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => {
            if (!showSignOutModal && !isSigningOut) {
              onClose();
            }
          }}
          disabled={showSignOutModal || isSigningOut}
          accessibilityLabel="Đóng menu khám phá"
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.duration(AnimationPresets.duration.normal)}
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Tay kéo bottom sheet */}
          <View
            style={[
              styles.dragIndicator,
              { backgroundColor: isDark ? colors.border : Colors.lockedBg },
            ]}
          />

          <Text
            style={[
              styles.sheetTitle,
              { color: colors.text, fontFamily: Fonts.rounded },
            ]}
          >
            Khám phá thêm
          </Text>

          <ScrollView
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* NHÓM 1: HỌC TẬP & CÁ NHÂN */}
            <Text
              style={[
                styles.sectionHeader,
                { color: colors.textSecondary, fontFamily: Fonts.sans },
              ]}
            >
              HỌC TẬP & CÁ NHÂN
            </Text>
            {learningOptions.map(renderOption)}

            {/* VẠCH NGĂN CÁCH NHÓM */}
            <View
              style={[
                styles.sectionDivider,
                { backgroundColor: colors.border },
              ]}
            />

            {/* NHÓM 2: HỆ THỐNG */}
            <Text
              style={[
                styles.sectionHeader,
                { color: colors.textSecondary, fontFamily: Fonts.sans },
              ]}
            >
              HỆ THỐNG
            </Text>
            {systemOptions.map(renderOption)}
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Modal xác nhận đăng xuất thiết kế riêng */}
      <SignOutModal
        visible={showSignOutModal}
        loading={isSigningOut}
        onClose={() => {
          if (!isSigningOut) {
            setShowSignOutModal(false);
          }
        }}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.eight,
    maxHeight: "85%",
    ...Shadows.xl,
  },
  dragIndicator: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: Spacing.four,
  },
  sheetTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    marginBottom: Spacing.four,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  sectionDivider: {
    height: 1,
    marginVertical: Spacing.three,
    marginHorizontal: Spacing.one,
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionsContainer: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },
  optionContent: {
    flex: 1,
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: FontSizes.xs,
    lineHeight: 16,
  },
});
