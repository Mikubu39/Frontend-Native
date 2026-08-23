/**
 * Signup Screen - Redesigned to match Duolingo style
 */

import { SocialAuthSection } from "@/components/auth/social-auth-section";
import { StyledTextInput } from "@/components/ui/text-input";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";

export default function SignupScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { signUp } = useAuth();
  const { showError, showWarning } = useToast();

  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      showWarning("Thiếu thông tin", "Vui lòng điền Email và Mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name || "User");
      router.replace("/(onboarding)/goal");
    } catch (error: any) {
      showError(
        "Đăng ký thất bại",
        error.message || "Không thể tạo tài khoản lúc này.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header navigation bar */}
        <View
          style={[styles.header, { borderBottomColor: colors.borderSubtle }]}
        >
          <TouchableOpacity
            onPress={() => router.replace("/welcome")}
            style={styles.closeButton}
          >
            <Text
              style={[styles.closeButtonText, { color: colors.textSecondary }]}
            >
              ✕
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
            Tạo hồ sơ
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Title & Mascot Section */}
        <View style={styles.titleSection}>
          <View style={styles.mascotContainer}>
            <LottieView
              source={require("@/assets/animations/hi_mascot.json")}
              autoPlay
              loop
              style={styles.mascot}
            />
          </View>
          <Text style={[styles.titleText, { color: colors.text }]}>
            Tạo hồ sơ của bạn
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          <StyledTextInput
            placeholder="Tuổi"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          <StyledTextInput
            placeholder="Tên (tùy chọn)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <StyledTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <StyledTextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* 3D Secondary (Rose/Pink) Signup Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.submitButtonShadow} />
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>
                {loading ? "ĐANG XỬ LÝ..." : "TẠO HỒ SƠ"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Auth */}
        <SocialAuthSection
          onGooglePress={async () => {
            await signUp("google@user.com", "googlepwd", "Google User");
            router.replace("/(onboarding)/goal");
          }}
          onFacebookPress={async () => {
            await signUp("facebook@user.com", "fbpwd", "Facebook User");
            router.replace("/(onboarding)/goal");
          }}
          onApplePress={async () => {
            await signUp("apple@user.com", "applepwd", "Apple User");
            router.replace("/(onboarding)/goal");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing.eight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closeButtonText: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  headerPlaceholder: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    alignItems: "center",
  },
  mascotContainer: {
    width: 140,
    height: 140,
    marginBottom: Spacing.two,
  },
  mascot: {
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    alignSelf: "flex-start",
  },
  formContainer: {
    paddingHorizontal: Spacing.six,
    gap: Spacing.four,
  },
  submitButton: {
    width: "100%",
    height: 52,
    marginTop: Spacing.four,
    position: "relative",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 4,
    bottom: -4,
    backgroundColor: "#C81B75",
    borderRadius: BorderRadius.md,
  },
  submitButtonContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.8,
  },
});
