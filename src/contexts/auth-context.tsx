/**
 * Authentication Context
 *
 * Provides authentication state throughout the app.
 * Wrap your root layout with <AuthProvider> and use the useAuth() hook.
 *
 * Example:
 *   const { user, isAuthenticated, signIn, signInWithGoogle, signOut } = useAuth();
 */

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

import { GOOGLE_WEB_CLIENT_ID } from "@/config/google-auth";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configure Google Sign-In once when the provider mounts
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      setUser({
        id: "1",
        email: email || "user@example.com",
        displayName: email ? email.split('@')[0] : "User",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    try {
      setUser({
        id: "1",
        email: email || "user@example.com",
        displayName: displayName || "User",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check Google Play Services availability
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Trigger the Google Sign-In popup
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled") {
        console.log("Google Sign-In cancelled by user");
        return;
      }

      const idToken = response.data?.idToken;

      if (!idToken) {
        console.error("Google Sign-In succeeded but no idToken returned");
        Alert.alert("Lỗi", "Không nhận được token từ Google. Vui lòng thử lại.");
        return;
      }

      console.log("\n\n====== GOOGLE ID TOKEN ======\n" + idToken + "\n==============================\n\n");
      console.log("⚠️ Backend chưa có endpoint /api/v1/auth/google.");
      console.log("📋 idToken đã sẵn sàng để gửi cho Backend khi endpoint ready.");

      const googleUser = response.data?.user;
      setUser({
        id: googleUser?.id ?? "google-user",
        email: googleUser?.email ?? "",
        displayName: googleUser?.name ?? googleUser?.email ?? "Google User",
        avatarUrl: googleUser?.photo ?? undefined,
      });

      Alert.alert(
        "Google Sign-In OK ✅",
        `Đăng nhập Google thành công!\n\nEmail: ${googleUser?.email}\nTên: ${googleUser?.name}\n\n⚠️ Backend chưa có endpoint /api/v1/auth/google nên chưa lấy được JWT. idToken đã log ra console.`,
      );
    } catch (error: unknown) {
      const typedError = error as { code?: string; message?: string };
      if (typedError.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-In cancelled by user");
      } else if (typedError.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-In already in progress");
      } else if (typedError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Lỗi", "Google Play Services không khả dụng trên thiết bị này.");
      } else {
        console.error("Google Sign-In error:", typedError.code, typedError.message);
        Alert.alert(
          "Lỗi đăng nhập Google",
          `Code: ${typedError.code}\nMessage: ${typedError.message}`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Sign out from Google as well
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore errors if user wasn't signed in with Google
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
