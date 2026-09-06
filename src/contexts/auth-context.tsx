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
  type ReactNode,
} from "react";
import { Alert } from "react-native";

import { GOOGLE_WEB_CLIENT_ID } from "@/config/google-auth";
import { FACEBOOK_APP_ID, FACEBOOK_CLIENT_TOKEN } from "@/config/facebook-auth";

import { apiClient, TOKEN_KEY } from "@/services/api/client";
import { authService } from "@/services/api/auth";
import { AuthResponse } from "@/types/api";
import { storage } from "@/services/storage/async-storage";

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
  username?: string;
  avatarUrl?: string;
  roles?: string[];
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

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
          setUser(JSON.parse(userDataStr));
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setIsLoading(false);
      }
    };
    const unsubscribeUnauthorized = apiClient.onUnauthorized(() => {
      setUser(null);
    });

    loadSession();

    return () => {
      unsubscribeUnauthorized();
    };
  }, []);

  const persistSession = useCallback(async (response: AuthResponse) => {
    await storage.set(TOKEN_KEY, response.accessToken);
    const userData: User = {
      id: response.user.id.toString(),
      email: response.user.email,
      displayName: response.user.displayName || response.user.username,
      username: response.user.username,
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
        Alert.alert(
          "Lỗi",
          "Không nhận được token từ Google. Vui lòng thử lại.",
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
        Alert.alert(
          "Lỗi",
          "Google Play Services không khả dụng trên thiết bị này.",
        );
      } else {
        console.error("Google Sign-In error:", typedError.message);
        Alert.alert(
          "Lỗi đăng nhập Google",
          typedError.message || "Không thể đăng nhập bằng Google.",
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const signInWithFacebook = useCallback(async () => {
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
        Alert.alert(
          "Thiếu quyền truy cập",
          "Ứng dụng cần quyền Email từ Facebook để đăng nhập.",
        );
        return false;
      }

      const tokenData = await FBAccessToken.getCurrentAccessToken();
      if (!tokenData?.accessToken) {
        Alert.alert(
          "Lỗi",
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
      Alert.alert(
        "Lỗi đăng nhập Facebook",
        error?.message || "Không thể đăng nhập bằng Facebook.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Best-effort server-side logout; local session is cleared regardless.
      try {
        await authService.logout();
      } catch {
        // Ignore — token may already be invalid/expired.
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

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateUser,
    }),
    [
      user,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateUser,
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
