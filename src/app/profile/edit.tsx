import { BackButton } from "@/components/ui/back-button";
import { GradientButton } from "@/components/ui/gradient-button";
import { StyledTextInput } from "@/components/ui/text-input";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { userService } from "@/services/api/user";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";

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
      Alert.alert("Huỷ thay đổi?", "Các thay đổi chưa lưu sẽ bị mất.", [
        { text: "Ở lại", style: "cancel" },
        {
          text: "Huỷ thay đổi",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]);
      return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (!displayName || !username) {
      showWarning(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ tên hiển thị và username.",
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

      showSuccess("Thành công!", "Cập nhật hồ sơ thành công!");
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (e: any) {
      showError("Lỗi cập nhật", e.message || "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setLoading(false);
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
          Chỉnh sửa Hồ sơ
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Tên hiển thị
          </Text>
          <StyledTextInput
            placeholder="Tên hiển thị"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <StyledTextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            Dùng để kết bạn và hiển thị trên mã QR.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Số điện thoại
          </Text>
          <StyledTextInput
            placeholder="Số điện thoại mới"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
});
