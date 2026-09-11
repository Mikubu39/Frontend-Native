/**
 * Authentication Context
 *
 * Provides authentication state throughout the app.
 * Wrap your root layout with <AuthProvider> and use the useAuth() hook.
 *
 * Example:
 *   const { user, isAuthenticated, signIn, signInWithGoogle, signOut } = useAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { GOOGLE_WEB_CLIENT_ID } from "@/config/google-auth";
import { FACEBOOK_APP_ID, FACEBOOK_CLIENT_TOKEN } from "@/config/facebook-auth";

import { apiClient, TOKEN_KEY } from "@/services/api/client";
import { authService } from "@/services/api/auth";
import { AuthResponse } from "@/types/api";
import { storage } from "@/services/storage/async-storage";
import { useToast } from "@/contexts/toast-context";
import { extractApiErrorMessage } from "@/utils/error-handler";

let GoogleSignin: any;
let statusCodes: any = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
};

try {
  const GoogleSignInModule = require("@react-native-google-signin/google-signin");
  GoogleSignin = GoogleSignInModule.GoogleSignin;
  if (GoogleSignInModule.statusCodes) {
    statusCodes = GoogleSignInModule.statusCodes;
  }
} catch (e) {
  console.warn(
    "Google Sign-In native module is not available. Falling back to mock (Expo Go support).",
  );
  GoogleSignin = {
    configure: () => {},
    hasPlayServices: async () => true,
    signIn: async () => {
      return {
        type: "success",
        data: {
          idToken: "mock-google-id-token",
          user: {
            id: "google-mock-id",
            email: "mock-expo-go-user@example.com",
            name: "Expo Go Mock User",
            photo: "https://lh3.googleusercontent.com/a/mock-photo",
          },
        },
      };
    },
    signOut: async () => {},
  };
}

let FBLoginManager: any;
let FBAccessToken: any;

try {
  const FBSDKModule = require("react-native-fbsdk-next");
  FBLoginManager = FBSDKModule.LoginManager;
  FBAccessToken = FBSDKModule.AccessToken;
  // Belt-and-suspenders: native AndroidManifest meta-data is the source of
  // truth for the SDK's own auto-init, but setting it here too covers builds
  // where that meta-data hasn't been added yet.
  FBSDKModule.Settings?.setAppID?.(FACEBOOK_APP_ID);
  FBSDKModule.Settings?.setClientToken?.(FACEBOOK_CLIENT_TOKEN);
} catch (e) {
  console.warn(
    "Facebook SDK native module is not available. Falling back to mock (Expo Go support).",
  );
  FBLoginManager = {
    logInWithPermissions: async () => ({
      isCancelled: false,
      declinedPermissions: [],
    }),
  };
  FBAccessToken = {
    getCurrentAccessToken: async () => ({
      accessToken: "mock-facebook-access-token",
    }),
  };
}

interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  roles: string[];
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * True chỉ khi tài khoản vừa được tạo (email/password) trên THIẾT BỊ NÀY và
   * chưa đi hết luồng (onboarding) — xem completeOnboarding(). Đăng nhập
   * Google/Facebook không set cờ này vì API social login là "create-or-login"
   * chung, không có field phân biệt tài khoản mới/cũ để dựa vào mà không đoán mò.
   */
  needsOnboarding: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (fields: Partial<User>) => Promise<void>;
  /** Đánh dấu (onboarding) đã hoàn tất — gọi khi user thực sự vào tới /(tabs). */
  completeOnboarding: () => Promise<void>;
}

const ONBOARDING_PENDING_PREFIX = "onboarding_pending_";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Starts true: index.tsx redirects based on isAuthenticated as soon as
  // isLoading is false, so it must stay true until the persisted session
  // has actually been read — otherwise it redirects to /welcome before
  // loadSession() below has a chance to restore the logged-in user.
  const [isLoading, setIsLoading] = useState(true);
  // Facebook SDK không tự chống gọi trùng như Google (IN_PROGRESS code) —
  // chặn tay để tap nhanh không mở 2 phiên đăng nhập Facebook song song.
  const fbSignInInProgressRef = useRef(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { showError, showWarning } = useToast();

  // Configure Google Sign-In once when the provider mounts
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });

    const loadSession = async () => {
      try {
        const token = await storage.get(TOKEN_KEY);
        const userDataStr = await storage.get("user_data");
        if (token && userDataStr) {
          const restoredUser: User = JSON.parse(userDataStr);
          setUser(restoredUser);
          const pending = await storage.get(
            ONBOARDING_PENDING_PREFIX + restoredUser.id,
          );
          setNeedsOnboarding(pending === "true");
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setIsLoading(false);
      }
    };
    const unsubscribeUnauthorized = apiClient.onUnauthorized(() => {
      setUser(null);
      showWarning(
        "Hết hạn phiên",
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    });

    loadSession();

    return () => {
      unsubscribeUnauthorized();
    };
  }, [showWarning]);

  const persistSession = useCallback(async (response: AuthResponse) => {
    await storage.set(TOKEN_KEY, response.accessToken);
    const userData: User = {
      id: String(response.user.id),
      email: response.user.email,
      displayName: response.user.displayName || response.user.username,
      username: response.user.username,
      avatarUrl: response.user.avatarUrl,
      roles: [response.user.role],
      phoneNumber: response.user.phoneNumber,
    };
    await storage.set("user_data", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await authService.login({ email, password });
        await persistSession(response);
      } catch (e: any) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      try {
        const response = await authService.register({
          email,
          password,
          displayName,
        });
        await persistSession(response);
        // Tài khoản vừa tạo trên máy này chưa đi qua (onboarding)/placement —
        // đánh dấu để index.tsx không nhảy thẳng vào /(tabs) nếu app bị tắt
        // giữa chừng trước khi hoàn tất.
        await storage.set(ONBOARDING_PENDING_PREFIX + response.user.id, "true");
        setNeedsOnboarding(true);
      } catch (e: any) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check Google Play Services availability
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Trigger the Google Sign-In popup
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled") {
        console.log("Google Sign-In cancelled by user");
        return false;
      }

      const idToken = response.data?.idToken;

      if (!idToken) {
        console.error("Google Sign-In succeeded but no idToken returned");
        showError(
          "Lỗi đăng nhập Google",
          "Không nhận được mã xác thực từ Google. Vui lòng thử lại.",
        );
        return false;
      }

      const authResponse = await authService.loginWithGoogle({ idToken });
      await persistSession(authResponse);
      return true;
    } catch (error: unknown) {
      const typedError = error as { code?: string; message?: string };
      if (typedError.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-In cancelled by user");
      } else if (typedError.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-In already in progress");
      } else if (typedError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showError(
          "Lỗi đăng nhập Google",
          "Google Play Services không khả dụng trên thiết bị này.",
        );
      } else {
        console.error("Google Sign-In error:", typedError.message);
        showError(
          "Lỗi đăng nhập Google",
          extractApiErrorMessage(error, "Không thể đăng nhập bằng Google."),
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession, showError]);

  const signInWithFacebook = useCallback(async () => {
    if (fbSignInInProgressRef.current) return false;
    fbSignInInProgressRef.current = true;
    setIsLoading(true);
    try {
      const loginResult = await FBLoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (loginResult.isCancelled) {
        console.log("Facebook Sign-In cancelled by user");
        return false;
      }

      if (loginResult.declinedPermissions?.includes("email")) {
        showWarning(
          "Thiếu quyền truy cập",
          "Ứng dụng cần quyền Email từ Facebook để đăng nhập.",
        );
        return false;
      }

      const tokenData = await FBAccessToken.getCurrentAccessToken();
      if (!tokenData?.accessToken) {
        showError(
          "Lỗi đăng nhập Facebook",
          "Không nhận được access token từ Facebook. Vui lòng thử lại.",
        );
        return false;
      }

      const authResponse = await authService.loginWithFacebook({
        accessToken: tokenData.accessToken,
      });
      await persistSession(authResponse);
      return true;
    } catch (error: any) {
      console.error("Facebook Sign-In error:", error?.message);
      showError(
        "Lỗi đăng nhập Facebook",
        extractApiErrorMessage(error, "Không thể đăng nhập bằng Facebook."),
      );
      return false;
    } finally {
      setIsLoading(false);
      fbSignInInProgressRef.current = false;
    }
  }, [persistSession, showError, showWarning]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Best-effort server-side logout; local session is cleared regardless.
      try {
        await Promise.race([
          authService.logout(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Logout timeout")), 4000),
          ),
        ]);
      } catch {
        // Ignore — token may already be invalid/expired or request timed out.
      }
      // Sign out from Google as well
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore errors if user wasn't signed in with Google
      }
      await storage.remove(TOKEN_KEY);
      await storage.remove("user_data");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      await storage.set("user_data", JSON.stringify(updatedUser));
      setUser(updatedUser);
    },
    [user],
  );

  const completeOnboarding = useCallback(async () => {
    setNeedsOnboarding(false);
    if (user) {
      await storage.set(ONBOARDING_PENDING_PREFIX + user.id, "false");
    }
  }, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      needsOnboarding,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateUser,
      completeOnboarding,
    }),
    [
      user,
      isLoading,
      needsOnboarding,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateUser,
      completeOnboarding,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useOptionalAuth(): AuthContextType | undefined {
  return useContext(AuthContext);
}
