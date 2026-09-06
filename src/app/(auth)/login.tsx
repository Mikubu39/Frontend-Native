/**
 * Login Screen - Enhanced with animated form entrance,
 * animated mascot, and press-animated buttons.
 */

import { SocialAuthSection } from "@/components/auth/social-auth-section";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { GradientButton } from "@/components/ui/gradient-button";
import { StyledTextInput } from "@/components/ui/text-input";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const { showError, showWarning } = useToast();
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUser || !password) {
      showWarning(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ thông tin đăng nhập.",
      );
      return;
    }
    setLoading(true);
    try {
      await signIn(emailOrUser, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      showError(
        "Đăng nhập thất bại",
        error.message || "Email hoặc mật khẩu không chính xác.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/*
        `behavior="padding"` cho CẢ Android chứ không chỉ iOS.
        Từ Android 15 trở lên, chế độ edge-to-edge khiến
        `android:windowSoftInputMode="adjustResize"` bị BỎ QUA - bàn phím
        che mất input/nút submit nếu không có KeyboardAvoidingView.
      */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header navigation bar */}
        <View
          style={[styles.header, { borderBottomColor: colors.borderSubtle }]}
        >
          <AnimatedPressable
            onPress={() => router.replace("/welcome")}
            style={[
              styles.closeButton,
              { backgroundColor: colors.cardElevated },
            ]}
            pressScale={0.9}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
          >
            <Text
              style={[styles.closeButtonText, { color: colors.textSecondary }]}
            >
              ✕
            </Text>
          </AnimatedPressable>
          <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
            Đăng nhập
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Title & Mascot Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.titleSection}
        >
          <View style={styles.mascotContainer}>
            <LottieView
              source={require("@/assets/animations/hi_mascot.json")}
              autoPlay
              loop
              style={styles.mascot}
            />
          </View>
          <Text style={[styles.titleText, { color: colors.text }]}>
            Đăng nhập
          </Text>
        </Animated.View>

        {/* Inputs */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.formContainer}
        >
          <StyledTextInput
            placeholder="Email hoặc tên đăng nhập"
            value={emailOrUser}
            onChangeText={setEmailOrUser}
            autoCapitalize="none"
          />

          <StyledTextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <GradientButton
            title="ĐĂNG NHẬP"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitButton}
          />
        </Animated.View>

        {/* Social Auth */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SocialAuthSection
            onGooglePress={async () => {
              const success = await signInWithGoogle();
              if (success) router.replace("/(tabs)");
            }}
            onFacebookPress={async () => {
              const success = await signInWithFacebook();
              if (success) router.replace("/(tabs)");
            }}
          />
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
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
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: Colors.cream,
  },
  closeButtonText: {
    fontSize: 20,
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
    width: 150,
    height: 150,
    marginBottom: Spacing.two,
  },
  mascot: {
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: FontSizes.title,
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
    marginTop: Spacing.four,
  },
});
