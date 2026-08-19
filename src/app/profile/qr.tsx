import React, { useRef } from "react";
import { View, Text, StyleSheet, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";

export default function MyQRScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const username = user?.email?.split("@")[0] || "user";
  const profileUrl = `nihongoapp://profile/@${username}`;
  const viewShotRef = useRef<ViewShot>(null);

  const [status, requestPermission] = MediaLibrary.usePermissions();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thêm tôi trên Kotodama: ${profileUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveImage = async () => {
    if (!status?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        showWarning(
          "Cần cấp quyền",
          "Cần quyền truy cập thư viện ảnh để lưu mã QR.",
        );
        return;
      }
    }

    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        showSuccess("Thành công!", "Mã QR đã được lưu vào thư viện ảnh.");
      }
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Không thể lưu mã QR vào thư viện ảnh.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backBtn} onPress={() => router.back()}>
          ←
        </Text>
        <Text style={styles.headerTitle}>Mã QR của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
          <View style={styles.qrCard}>
            <Text style={styles.displayName}>{user?.displayName}</Text>
            <Text style={styles.username}>@{username}</Text>

            <View style={styles.qrWrapper}>
              <QRCode
                value={profileUrl}
                size={200}
                color={Colors.primary}
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text style={styles.hint}>Quét mã để kết bạn với tôi</Text>
          </View>
        </ViewShot>

        <View style={styles.actions}>
          <GradientButton
            title="Lưu thành ảnh"
            onPress={handleSaveImage}
            style={styles.actionBtn}
          />
          <Text style={styles.shareTextBtn} onPress={handleShare}>
            Chia sẻ liên kết
          </Text>
        </View>
      </View>
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
  },
  backBtn: {
    fontSize: FontSizes.xxl,
    width: 40,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.six,
    gap: Spacing.eight,
    marginTop: Spacing.eight,
  },
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    padding: Spacing.eight,
    alignItems: "center",
    width: "100%",
    ...Shadows.md,
  },
  displayName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  username: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.six,
  },
  qrWrapper: {
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.six,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.four,
  },
  actionBtn: {
    width: "100%",
  },
  shareTextBtn: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    padding: Spacing.three,
  },
});
