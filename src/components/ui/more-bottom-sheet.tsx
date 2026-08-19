import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

interface MoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function MoreBottomSheet({ visible, onClose }: MoreBottomSheetProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const handleNavigate = (route: any) => {
    onClose();
    router.push(route);
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
        <View style={[styles.dragIndicator, { backgroundColor: isDark ? colors.border : Colors.lockedBg }]} />
        <Text style={[styles.sheetTitle, { color: colors.text }]}>Khám phá thêm</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleNavigate("/(tabs)/profile")}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: Colors.primary + "15" },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={28}
                color={Colors.primary}
              />
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>Hồ sơ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleNavigate("/characters")}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: Colors.accent + "15" },
              ]}
            >
              <Ionicons
                name="language-outline"
                size={28}
                color={Colors.accent}
              />
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>Chữ Kana</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleNavigate("/review")}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#10B98115" }]}
            >
              <Ionicons name="barbell-outline" size={28} color="#10B981" />
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>Trung tâm luyện tập</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: Spacing.eight + Spacing.eight, // Extra padding for bottom inset
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
  optionsContainer: {
    gap: Spacing.four,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.four,
  },
  optionText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});
