/**
 * SignOutModal - Hộp thoại xác nhận đăng xuất chuẩn theme Nihongo.
 *
 * Thay thế hoàn toàn hộp thoại native `Alert.alert` của hệ điều hành, mang lại
 * trải nghiệm đồng bộ visual identity với ứng dụng: nền mờ, icon cảnh báo đỏ,
 * typography bo tròn ZenMaruGothic/Nunito, và các nút bấm phong cách 3D.
 */

import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ModalCard } from "@/components/ui/modal-card";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  BorderRadius,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";

export interface SignOutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function SignOutModal({
  visible,
  onClose,
  onConfirm,
  loading = false,
}: SignOutModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <ModalCard
        onClose={loading ? undefined : onClose}
        style={[
          styles.card,
          {
            borderColor: isDark ? colors.border : "rgba(255,255,255,0.8)",
          },
        ]}
      >
        <View style={styles.content}>
          {/* Icon cảnh báo đỏ */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.18)"
                  : "rgba(239, 68, 68, 0.10)",
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={34} color={Colors.error} />
          </View>

          {/* Tiêu đề */}
          <Text
            style={[
              styles.title,
              { color: colors.text, fontFamily: Fonts.rounded },
            ]}
          >
            Đăng xuất tài khoản?
          </Text>

          {/* Lời giải thích */}
          <Text
            style={[
              styles.message,
              { color: colors.textSecondary, fontFamily: Fonts.sans },
            ]}
          >
            Bạn có chắc chắn muốn đăng xuất không? Tiến trình học tập của bạn
            vẫn được lưu trữ an toàn trên máy chủ.
          </Text>

          {/* Nhóm nút bấm 3D */}
          <View style={styles.buttonGroup}>
            <AnimatedPressable
              testID="sign-out-cancel-btn"
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderBottomColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.12)",
                },
              ]}
              onPress={onClose}
              pressScale={0.97}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Ở lại học"
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: colors.text, fontFamily: Fonts.rounded },
                ]}
              >
                Ở LẠI HỌC
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              testID="sign-out-confirm-btn"
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: Colors.error,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={onConfirm}
              pressScale={0.97}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Xác nhận đăng xuất"
            >
              <Ionicons
                name="log-out"
                size={18}
                color="#FFFFFF"
                style={styles.btnIcon}
              />
              <Text
                style={[styles.confirmBtnText, { fontFamily: Fonts.rounded }]}
              >
                {loading ? "ĐANG ĐĂNG XUẤT..." : "ĐĂNG XUẤT"}
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </ModalCard>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 340,
    alignSelf: "center",
  },
  content: {
    alignItems: "center",
    paddingTop: Spacing.two,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  message: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.two,
  },
  buttonGroup: {
    width: "100%",
    gap: Spacing.three,
  },
  cancelBtn: {
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
  },
  cancelBtnText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  confirmBtn: {
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3.5,
    borderBottomColor: "#B91C1C",
  },
  btnIcon: {
    marginRight: Spacing.two,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
});
