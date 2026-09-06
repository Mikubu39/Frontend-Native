/**
 * PromotionModal — Màn hình ăn mừng thăng hạng chuẩn phong cách Duolingo.
 * Thay thế cho Alert.alert thô sơ khi người học thăng hạng mới.
 */

import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  ZoomIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Fonts,
} from "@/constants/theme";
import { GradientButton } from "@/components/ui/gradient-button";
import { useTheme } from "@/contexts/theme-context";

interface PromotionModalProps {
  visible: boolean;
  newRankName: string;
  onClose: () => void;
}

interface RankStyle {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: [string, string];
}

const RANK_CONFIG: Record<string, RankStyle> = {
  BRONZE: {
    label: "HẠNG ĐỒNG",
    icon: "medal",
    color: "#CD7F32",
    gradient: ["#E29054", "#8C4A19"],
  },
  SILVER: {
    label: "HẠNG BẠC",
    icon: "medal",
    color: "#94A3B8",
    gradient: ["#E0E7FF", "#94A3B8"],
  },
  GOLD: {
    label: "HẠNG VÀNG",
    icon: "medal",
    color: "#C4922E",
    gradient: ["#DDAF5C", "#C4922E"],
  },
  PLATINUM: {
    label: "HẠNG BẠCH KIM",
    icon: "shield-checkmark",
    color: "#38BDF8",
    gradient: ["#38BDF8", "#0284C7"],
  },
  DIAMOND: {
    label: "HẠNG KIM CƯƠNG",
    icon: "diamond",
    color: "#5E6FA8",
    gradient: ["#8E9BC9", "#3B4C82"],
  },
};

export function PromotionModal({
  visible,
  newRankName,
  onClose,
}: PromotionModalProps) {
  const { colors, isDark } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.6);

  const upperRank = (newRankName || "BRONZE").toUpperCase();
  const config = RANK_CONFIG[upperRank] || RANK_CONFIG.GOLD;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      scale.value = withSpring(1, { damping: 9, stiffness: 120 });
      rotation.value = withRepeat(
        withTiming(360, { duration: 16000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      scale.value = 0.6;
    }
  }, [visible, scale, rotation]);

  const haloAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? "#1B1D2B" : "#FFFFFF",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : colors.border,
            },
          ]}
        >
          {/* Background Rotating Sunburst / Halo */}
          <Animated.View style={[styles.haloContainer, haloAnimStyle]}>
            <LinearGradient
              colors={[config.color + "33", "transparent"]}
              style={styles.haloGradient}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Badge & Mascot Icon */}
          <Animated.View style={[styles.badgeWrap, badgeAnimStyle]}>
            <LinearGradient
              colors={config.gradient}
              style={styles.badgeCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                testID="promotion-badge-icon"
                name={config.icon}
                size={44}
                color="#FFFFFF"
              />
            </LinearGradient>
          </Animated.View>

          {/* Heading */}
          <Text style={[styles.eyebrow, { color: config.color }]}>
            XUẤT SẮC THĂNG HẠNG!
          </Text>

          <Text
            style={[
              styles.rankTitle,
              { color: isDark ? "#FFFFFF" : Colors.textPrimary },
            ]}
          >
            {config.label}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: isDark ? "rgba(255,255,255,0.7)" : colors.textSecondary,
              },
            ]}
          >
            Chúc mừng bạn đã nỗ lực hoàn thành xuất sắc các bài học và vươn lên
            bảng xếp hạng mới. Hãy tiếp tục giữ vững phong độ nhé!
          </Text>

          {/* CTA Button */}
          <GradientButton
            title="TIẾP TỤC →"
            onPress={onClose}
            style={styles.continueBtn}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.68)",
    paddingHorizontal: Spacing.five,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.seven,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  haloContainer: {
    position: "absolute",
    width: 280,
    height: 280,
    top: -40,
    borderRadius: 140,
  },
  haloGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
  },
  badgeWrap: {
    marginBottom: Spacing.four,
  },
  badgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  eyebrow: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1,
    marginBottom: Spacing.one,
    textAlign: "center",
  },
  rankTitle: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  description: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.six,
  },
  continueBtn: {
    width: "100%",
  },
});
