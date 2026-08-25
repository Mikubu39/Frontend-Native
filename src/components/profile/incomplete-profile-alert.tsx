/**
 * IncompleteProfileAlert - Dismissible nudge shown when the account is
 * missing display name / phone number. Theme-aware (the old inline banner
 * hardcoded light-mode colors and went muddy in dark mode).
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { BorderRadius, Shadows, Spacing } from "@/constants/theme";

interface IncompleteProfileAlertProps {
  isDark: boolean;
  onPress: () => void;
  onDismiss: () => void;
}

export function IncompleteProfileAlert({
  isDark,
  onPress,
  onDismiss,
}: IncompleteProfileAlertProps) {
  const tint = isDark
    ? {
        bg: "#3A2A12",
        border: "#8A5A1E",
        icon: "#FFB74D",
        title: "#FFD699",
        desc: "#E8C89A",
      }
    : {
        bg: "#FFF4E5",
        border: "#FFB74D",
        icon: "#F57C00",
        title: "#B45300",
        desc: "#8A5A1E",
      };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tint.bg, borderColor: tint.border },
      ]}
    >
      <AnimatedPressable
        style={styles.content}
        onPress={onPress}
        pressScale={0.97}
      >
        <Ionicons name="alert-circle" size={30} color={tint.icon} />
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: tint.title }]}>
            Tài khoản chưa hoàn tất
          </Text>
          <Text style={[styles.desc, { color: tint.desc }]}>
            Bạn còn thiếu thông tin (số điện thoại, tên). Cập nhật ngay!
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={tint.icon} />
      </AnimatedPressable>
      <Pressable
        style={styles.dismissBtn}
        onPress={onDismiss}
        hitSlop={15}
        accessibilityLabel="Ẩn thông báo"
      >
        <Ionicons name="close" size={18} color={tint.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    ...Shadows.sm,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  desc: {
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 17,
  },
  dismissBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});
