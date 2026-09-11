/**
 * ModalCard - White card overlay with animated entrance.
 *
 * Vào bằng một nhịp trượt-mờ đơn giản, KHÔNG nảy. Hộp thoại là thứ chắn đường
 * người dùng để hỏi một câu — nó cần đứng yên cho người ta đọc, chứ không phải
 * rung thêm hai nhịp nữa. Nảy để dành cho màn thưởng/ăn mừng.
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import {
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
  Shadows,
  AnimationPresets,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

interface ModalCardProps {
  children: React.ReactNode;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ModalCard({ children, onClose, style }: ModalCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(AnimationPresets.duration.fast)}
      style={styles.overlayContainer}
    >
      <BlurView intensity={45} tint="dark" style={styles.overlay} />
      <Animated.View
        entering={FadeInDown.duration(AnimationPresets.duration.normal)}
        style={[
          styles.card,
          {
            backgroundColor: colors.cardElevated,
            // Vien phai theo theme. Truoc day no co dinh o trang 80%: tren nen
            // toi do la vien sang co y do, nhung tren the mau trang o theme
            // sang thi trang tren trang - the mat han duong vien.
            borderColor: isDark ? "rgba(255,255,255,0.8)" : colors.border,
          },
          style,
        ]}
      >
        {onClose && (
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
    zIndex: 2000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.six,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1.5,
    ...Shadows.float,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
  },
  closeIcon: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});
