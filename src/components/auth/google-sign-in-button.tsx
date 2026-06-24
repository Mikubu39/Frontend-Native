/**
 * Google Sign-In Button
 *
 * A styled button that triggers Google authentication.
 * Uses the useAuth() hook to call signInWithGoogle().
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";

interface GoogleSignInButtonProps {
  /** Optional custom style overrides */
  style?: object;
}

export function GoogleSignInButton({ style }: GoogleSignInButtonProps) {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <TouchableOpacity
      style={[styles.button, style, isLoading && styles.buttonDisabled]}
      onPress={signInWithGoogle}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <GoogleIcon />
          </View>
          <Text style={styles.text}>Đăng nhập bằng Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Simple Google "G" logo drawn with basic shapes.
 * Avoids needing an SVG library or image asset.
 */
function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F1F1F",
    letterSpacing: 0.2,
  },
});
