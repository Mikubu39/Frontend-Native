import React, { useRef } from "react";
import { View, Text, StyleSheet, Share, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/hooks/use-theme";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
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
  const themeColors = useTheme();

  const username = user?.username || user?.email?.split("@")[0] || "user";
  const profileUrl = `nihongo://friends/profile/${username}`;
  const viewShotRef = useRef<ViewShot>(null);

  const [status, requestPermission] = MediaLibrary.usePermissions();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Thêm tôi trên Nihongo: ${profileUrl}`,
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Mã QR cá nhân
        </Text>
        {/* Chỗ giữ chỗ để tiêu đề luôn canh giữa - nút quét mã đã bị bỏ vì
            trùng chức năng với tab "Quét mã" của segmented control bên dưới. */}
        <View style={styles.headerRightBtn} />
      </View>

      <View style={styles.segmentWrapper}>
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.borderSubtle,
            },
          ]}
        >
          <View style={[styles.segmentBtn, styles.segmentBtnActive]}>
            <Ionicons name="qr-code" size={16} color="#FFFFFF" />
            <Text style={styles.segmentTextActive}>Mã của tôi</Text>
          </View>
          <TouchableOpacity
            style={styles.segmentBtn}
            onPress={() => router.push("/friends/scan")}
            accessibilityLabel="Chuyển sang Quét mã QR"
          >
            <Ionicons
              name="scan-outline"
              size={16}
              color={themeColors.textSecondary}
            />
            <Text
              style={[styles.segmentText, { color: themeColors.textSecondary }]}
            >
              Quét mã
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
          <View
            style={[
              styles.qrCard,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.displayName, { color: themeColors.text }]}>
              {user?.displayName || "Người học Nihongo"}
            </Text>
            <Text
              style={[styles.username, { color: themeColors.textSecondary }]}
            >
              @{username}
            </Text>

            <View style={styles.qrWrapper}>
              <QRCode
                value={profileUrl}
                size={200}
                color={Colors.primary}
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text style={[styles.hint, { color: themeColors.textSecondary }]}>
              Quét mã để kết bạn với tôi trên Nihongo
            </Text>
          </View>
        </ViewShot>

        <View style={styles.actions}>
          <GradientButton
            title="Lưu thành ảnh"
            onPress={handleSaveImage}
            style={styles.actionBtn}
          />
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareBtnWrapper}
            accessibilityLabel="Chia sẻ liên kết cá nhân"
          >
            <Ionicons
              name="share-social-outline"
              size={18}
              color={Colors.primary}
            />
            <Text style={styles.shareTextBtn}>Chia sẻ liên kết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  headerRightBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentWrapper: {
    alignItems: "center",
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.full,
    padding: 4,
    borderWidth: 1,
    width: "100%",
    maxWidth: 280,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  segmentTextActive: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: "#FFFFFF",
  },
  segmentText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.six,
    gap: Spacing.six,
    marginTop: Spacing.four,
  },
  qrCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.eight,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    ...Shadows.md,
  },
  displayName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: 2,
    textAlign: "center",
  },
  username: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.six,
    textAlign: "center",
  },
  qrWrapper: {
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  hint: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.six,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    gap: Spacing.three,
  },
  actionBtn: {
    width: "100%",
  },
  shareBtnWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
  },
  shareTextBtn: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
});
