import { BackButton } from "@/components/ui/back-button";
import { GradientButton } from "@/components/ui/gradient-button";
import { StyledTextInput } from "@/components/ui/text-input";
import { ModalCard } from "@/components/ui/modal-card";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { userService } from "@/services/api/user";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { extractApiErrorMessage } from "@/utils/error-handler";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const colors = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(
    user?.username || user?.email?.split("@")[0] || "",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  // Nếu người dùng bấm Lưu rồi rời màn hình ngay (back) trước khi request
  // trả về, đừng để callback muộn gọi thêm router.back() lần nữa.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Snapshot of the loaded values, used to detect unsaved edits when the
  // user tries to leave via the back button (fix: discard-changes gap).
  const initialValuesRef = useRef({
    displayName: user?.displayName || "",
    username: user?.username || user?.email?.split("@")[0] || "",
    phoneNumber: "",
  });

  const isDirty = () => {
    const initial = initialValuesRef.current;
    return (
      displayName !== initial.displayName ||
      username !== initial.username ||
      phoneNumber !== initial.phoneNumber
    );
  };

  const handleBack = () => {
    if (isDirty()) {
      setShowDiscardModal(true);
      return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (!displayName || !username) {
      showWarning(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ tên hiển thị và tên người dùng.",
      );
      return;
    }

    setLoading(true);
    try {
      await userService.updateProfile({
        displayName,
        username,
      });

      if (phoneNumber.trim()) {
        await userService.updatePhoneNumber({
          phoneNumber: phoneNumber.trim(),
        });
        await updateUser({ phoneNumber: phoneNumber.trim() });
      }

      await updateUser({ displayName, username });

      initialValuesRef.current = { displayName, username, phoneNumber };

      if (!isMountedRef.current) return;
      showSuccess("Thành công!", "Cập nhật hồ sơ thành công!");
      setTimeout(() => {
        if (isMountedRef.current) router.back();
      }, 500);
    } catch (e: any) {
      if (!isMountedRef.current) return;
      showError(
        "Lỗi cập nhật",
        extractApiErrorMessage(e, "Có lỗi xảy ra khi cập nhật hồ sơ."),
      );
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <BackButton onPress={handleBack} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Chỉnh sửa hồ sơ
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Tên hiển thị
          </Text>
          <StyledTextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tên của bạn"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Tên người dùng (@username)
          </Text>
          <StyledTextInput
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Số điện thoại
          </Text>
          <StyledTextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Chưa cập nhật"
            keyboardType="phone-pad"
          />
          <Text style={styles.hint}>Nhập số nếu bạn muốn cập nhật.</Text>
        </View>

        <GradientButton
          title={loading ? "Đang cập nhật..." : "Lưu thay đổi"}
          onPress={handleSave}
          disabled={loading}
        />
      </ScrollView>

      {/* Modal xác nhận huỷ thay đổi theme-aware */}
      {showDiscardModal && (
        <ModalCard onClose={() => setShowDiscardModal(false)}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Huỷ thay đổi?
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              Các thay đổi bạn vừa nhập chưa được lưu và sẽ bị mất.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalStayBtn,
                  { borderColor: colors.borderSubtle },
                ]}
                onPress={() => setShowDiscardModal(false)}
              >
                <Text style={[styles.modalStayText, { color: colors.text }]}>
                  Ở LẠI
                </Text>
              </Pressable>
              <Pressable
                style={styles.modalDiscardBtn}
                onPress={() => {
                  setShowDiscardModal(false);
                  router.back();
                }}
              >
                <Text style={styles.modalDiscardText}>HUỶ BỎ</Text>
              </Pressable>
            </View>
          </View>
        </ModalCard>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
  },
  backBtn: {
    fontSize: FontSizes.xxl,
    width: 40,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  content: {
    padding: Spacing.six,
    gap: Spacing.six,
  },
  formGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  modalContent: {
    alignItems: "center",
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.three,
    width: "100%",
    marginTop: Spacing.two,
  },
  modalStayBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalStayText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  modalDiscardBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDiscardText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: "#FFFFFF",
  },
});
