import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { parseUsernameFromQR } from "@/utils/qr";
import { GradientButton } from "@/components/ui/gradient-button";
import {
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
} from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCANNER_SIZE = Math.min(SCREEN_WIDTH * 0.72, 280);

export default function QRScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showWarning, showError, showSuccess } = useToast();

  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Animated laser beam moving up and down inside viewfinder
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isScanning && process.env.NODE_ENV !== "test") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    }
    return () => {
      animation?.stop();
    };
  }, [isScanning, scanLineAnim]);

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const currentUsername = (
    user?.username ||
    user?.email?.split("@")[0] ||
    ""
  ).toLowerCase();

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (!isScanning) return;

      const rawData = result.data;
      if (!rawData) return;

      setIsScanning(false);

      const targetUsername = parseUsernameFromQR(rawData);

      if (!targetUsername) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
        } catch {}
        showError(
          "Mã QR không hợp lệ",
          "Mã QR này không thuộc định dạng hồ sơ Nihongo.",
        );
        // Resume scanning after delay
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          setIsScanning(true);
        }, 2500);
        return;
      }

      // Check if user scanned their own QR code
      if (currentUsername && targetUsername.toLowerCase() === currentUsername) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
        } catch {}
        showWarning("Mã cá nhân", "Đây là mã QR của chính bạn!");
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          setIsScanning(true);
        }, 2500);
        return;
      }

      // Success: Haptic feedback & navigate to friend's profile
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch {}
      showSuccess("Đã tìm thấy bạn bè!", `@${targetUsername}`);

      // Small delay for smooth transition
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = setTimeout(() => {
        router.replace({
          pathname: "/friends/profile/[username]",
          params: { username: targetUsername },
        });
      }, 350);
    },
    [isScanning, currentUsername, showError, showWarning, showSuccess, router],
  );

  // Permission not determined yet or denied
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loadingText}>Đang khởi tạo máy ảnh...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Khi người dùng đã từ chối vĩnh viễn ("don't ask again" trên Android,
    // hoặc bất kỳ lần từ chối nào trên iOS), `requestPermission()` chỉ trả
    // về false ngay lập tức mà không hiện lại hộp thoại hệ thống - phải dẫn
    // người dùng sang Cài đặt thiết bị mới có đường ra.
    const canAskAgain = permission.canAskAgain !== false;

    return (
      <SafeAreaView style={[styles.container, styles.permissionContainer]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityLabel="Đóng"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.permissionContent}>
          <View style={styles.permissionIconCircle}>
            <Ionicons name="camera-outline" size={56} color={Colors.primary} />
          </View>

          <Text style={styles.permissionTitle}>Cần quyền truy cập Máy ảnh</Text>
          <Text style={styles.permissionDesc}>
            {canAskAgain
              ? "Để quét mã QR kết bạn nhanh chóng, ứng dụng Nihongo cần quyền sử dụng máy ảnh của bạn."
              : "Bạn đã từ chối quyền truy cập máy ảnh. Vui lòng bật quyền này trong Cài đặt thiết bị để có thể quét mã QR."}
          </Text>

          <GradientButton
            title={canAskAgain ? "Cấp quyền máy ảnh" : "Mở Cài đặt"}
            onPress={canAskAgain ? requestPermission : Linking.openSettings}
            style={styles.permissionBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const laserTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, SCANNER_SIZE - 12],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      />

      {/* Semi-transparent Dark Overlay with Cutout Viewfinder */}
      <SafeAreaView style={styles.overlaySafeArea} pointerEvents="box-none">
        {/* Top bar controls */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconCircleBtn}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>Quét mã QR</Text>

          <TouchableOpacity
            onPress={() => setTorchEnabled((prev) => !prev)}
            style={[
              styles.iconCircleBtn,
              torchEnabled && styles.torchActiveBtn,
            ]}
            accessibilityLabel="Bật hoặc tắt đèn flash"
          >
            <Ionicons
              name={torchEnabled ? "flash" : "flash-outline"}
              size={22}
              color={torchEnabled ? Colors.warning : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Center Viewfinder */}
        <View style={styles.centerContainer} pointerEvents="none">
          <View
            style={[
              styles.viewFinder,
              { width: SCANNER_SIZE, height: SCANNER_SIZE },
            ]}
          >
            {/* 4 Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Laser Scanning Line */}
            {isScanning && (
              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    transform: [{ translateY: laserTranslateY }],
                  },
                ]}
              />
            )}
          </View>

          <Text style={styles.guideHint}>
            Căn chỉnh mã QR bạn bè vào trong khung ngắm
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.myQrShortcutBtn}
            onPress={() => router.replace("/profile/qr")}
            accessibilityLabel="Mở mã QR của tôi"
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.myQrShortcutText}>Mã QR của tôi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: FontSizes.md,
  },
  overlaySafeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  torchActiveBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  viewFinder: {
    borderRadius: BorderRadius.lg,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BorderRadius.md,
  },
  laserLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  guideHint: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginTop: Spacing.six,
    textAlign: "center",
    paddingHorizontal: Spacing.eight,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomBar: {
    paddingHorizontal: Spacing.six,
    paddingBottom: Spacing.six,
    alignItems: "center",
  },
  myQrShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: BorderRadius.full,
  },
  myQrShortcutText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.six,
  },
  permissionHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: Spacing.two,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  permissionIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(59, 76, 130, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
  permissionDesc: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
  permissionBtn: {
    width: "100%",
  },
});
