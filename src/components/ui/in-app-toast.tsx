/**
 * InAppToast - Premium animated toast notification for React Native.
 * Features glassmorphism, kawaii emoji badges, haptic feedback, and spring animations.
 */

import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import type { ToastOptions } from "@/types";

interface InAppToastProps {
  toast: ToastOptions | null;
  onDismiss: () => void;
}

const TOAST_CONFIG = {
  success: {
    emoji: "🎉",
    accentColor: Colors.success,
    bgColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(76, 175, 80, 0.3)",
    haptic: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      ),
  },
  error: {
    emoji: "⚠️",
    accentColor: Colors.error,
    bgColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    haptic: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      ),
  },
  warning: {
    emoji: "⚡",
    accentColor: Colors.warning,
    bgColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(255, 184, 0, 0.3)",
    haptic: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      ),
  },
  info: {
    emoji: "💡",
    accentColor: Colors.primary,
    bgColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    haptic: () =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  },
};

export function InAppToast({ toast, onDismiss }: InAppToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toast) {
      const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
      config.haptic();

      const duration = toast.duration || 3500;
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  return (
    <View
      style={[
        styles.overlayContainer,
        { top: insets.top + (Platform.OS === "android" ? 12 : 8) },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        entering={FadeInUp.duration(220)}
        exiting={FadeOutUp.duration(200)}
        style={styles.animatedWrapper}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onDismiss}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`${toast.type === "error" ? "Lỗi" : "Thông báo"}: ${toast.title}. ${toast.message || ""}`}
          style={[
            styles.toastCard,
            {
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
              shadowColor: config.accentColor,
            },
          ]}
        >
          {/* Left Emoji Badge */}
          <View
            style={[
              styles.emojiBadge,
              { backgroundColor: `${config.accentColor}18` },
            ]}
          >
            <Text style={styles.emojiText}>{toast.icon || config.emoji}</Text>
          </View>

          {/* Toast Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.toastTitle} numberOfLines={1}>
              {toast.title}
            </Text>
            {toast.message ? (
              <Text style={styles.toastMessage} numberOfLines={2}>
                {toast.message}
              </Text>
            ) : null}
          </View>

          {/* Close Icon / Pill indicator */}
          <View style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 9999,
    alignItems: "center",
  },
  animatedWrapper: {
    width: "100%",
    maxWidth: 500,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    gap: Spacing.three,
    ...Shadows.md,
    elevation: 8,
  },
  emojiBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  toastMessage: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "bold",
  },
});
