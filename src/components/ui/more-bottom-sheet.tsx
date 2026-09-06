import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface MoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface MoreOption {
  id: string;
  title: string;
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
  const { showInfo } = useToast();

  if (!visible) return null;

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleSignOut = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          onClose();
          signOut();
        },
      },
    ]);
  };

  const options: MoreOption[] = [
    {
      id: "profile",
      title: "Hồ sơ",
      icon: "person-outline",
      color: Colors.primary,
      route: "/(tabs)/profile",
    },
    {
      id: "characters",
      title: "Chữ Kana",
      icon: "language-outline",
      color: Colors.accent,
      route: "/characters",
    },
    {
      id: "review",
      title: "Trung tâm luyện tập",
      icon: "barbell-outline",
      color: Colors.success,
      route: "/review",
    },
    {
      id: "friends",
      title: "Bạn bè & Theo dõi",
      icon: "people-outline",
      color: Colors.primary,
      route: "/friends",
    },
    {
      id: "leaderboard",
      title: "Bảng xếp hạng",
      icon: "trophy-outline",
      color: Colors.secondary,
      route: "/(tabs)/leaderboard",
    },
    {
      id: "settings",
      title: "Cài đặt",
      icon: "settings-outline",
      color: colors.textSecondary,
      route: "/settings",
    },
    {
      id: "help",
      title: "Trợ giúp & Phản hồi",
      icon: "help-circle-outline",
      color: colors.textSecondary,
      onPress: () => showInfo("Trợ giúp", "Tính năng đang được hoàn thiện."),
    },
    {
      id: "signout",
      title: "Đăng xuất",
      icon: "log-out-outline",
      color: Colors.error,
      isDestructive: true,
      onPress: handleSignOut,
    },
  ];

  const handlePress = (option: MoreOption) => {
    if (option.route) handleNavigate(option.route);
    else option.onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(AnimationPresets.duration.fast)}
      style={styles.overlayContainer}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>

      <Animated.View
        entering={SlideInDown.duration(AnimationPresets.duration.normal)}
        style={[styles.sheetContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.dragIndicator,
            { backgroundColor: isDark ? colors.border : Colors.lockedBg },
          ]}
        />
        <Text style={[styles.sheetTitle, { color: colors.text }]}>
          Khám phá thêm
        </Text>

        <ScrollView
          style={styles.optionsScroll}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => handlePress(option)}
              accessibilityRole="button"
              accessibilityLabel={option.title}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "15" },
                ]}
              >
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: option.isDestructive ? Colors.error : colors.text,
                  },
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.View>
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight,
    maxHeight: "80%",
    ...Shadows.xl,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.lockedBg,
    alignSelf: "center",
    marginBottom: Spacing.five,
  },
  sheetTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    marginBottom: Spacing.six,
    textAlign: "center",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionsContainer: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.four,
  },
  optionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
});
