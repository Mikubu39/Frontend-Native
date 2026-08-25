import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "../login";
import { AuthProvider } from "@/contexts/auth-context";
import { authService } from "@/services/api/auth";
import { storage } from "@/services/storage/async-storage";
import { TOKEN_KEY } from "@/services/api/client";

jest.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    background: "#fff",
    borderSubtle: "#eee",
    cardElevated: "#f5f5f5",
    textSecondary: "#666",
    text: "#111",
  }),
}));

jest.mock("@/contexts/toast-context", () => ({
  useToast: () => ({
    showError: jest.fn(),
    showWarning: jest.fn(),
    showSuccess: jest.fn(),
  }),
}));

jest.mock("lottie-react-native", () => "LottieView");

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/services/api/auth", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    loginWithGoogle: jest.fn(),
    loginWithFacebook: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("@/services/storage/async-storage", () => ({
  storage: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockGoogleSignIn = jest.fn();
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: (...args: unknown[]) => mockGoogleSignIn(...args),
    signOut: jest.fn().mockResolvedValue(undefined),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
    IN_PROGRESS: "IN_PROGRESS",
    PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  },
}));

const mockFbLogin = jest.fn();
const mockFbGetCurrentAccessToken = jest.fn();
jest.mock("react-native-fbsdk-next", () => ({
  LoginManager: {
    logInWithPermissions: (...args: unknown[]) => mockFbLogin(...args),
  },
  AccessToken: {
    getCurrentAccessToken: (...args: unknown[]) =>
      mockFbGetCurrentAccessToken(...args),
  },
  Settings: {
    setAppID: jest.fn(),
    setClientToken: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

function renderLoginScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    </SafeAreaProvider>,
  );
}

describe("LoginScreen social auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.get.mockResolvedValue(null);
  });

  it("đăng nhập Google gọi POST /social/google với idToken và lưu session", async () => {
    mockGoogleSignIn.mockResolvedValue({
      type: "success",
      data: { idToken: "test-google-id-token" },
    });
    mockedAuthService.loginWithGoogle.mockResolvedValue({
      accessToken: "jwt-google",
      tokenType: "Bearer",
      user: {
        id: 1,
        email: "g@example.com",
        displayName: "Google User",
        username: "guser",
        role: "LEARNER",
      },
    });

    const { findByLabelText } = await renderLoginScreen();
    const googleButton = await findByLabelText("Đăng nhập bằng Google");
    await fireEvent.press(googleButton);

    await waitFor(() => {
      expect(mockedAuthService.loginWithGoogle).toHaveBeenCalledWith({
        idToken: "test-google-id-token",
      });
    });
    expect(mockedStorage.set).toHaveBeenCalledWith(TOKEN_KEY, "jwt-google");
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("đăng nhập Facebook gọi POST /social/facebook với accessToken và lưu session", async () => {
    mockFbLogin.mockResolvedValue({
      isCancelled: false,
      declinedPermissions: [],
    });
    mockFbGetCurrentAccessToken.mockResolvedValue({
      accessToken: "test-fb-access-token",
    });
    mockedAuthService.loginWithFacebook.mockResolvedValue({
      accessToken: "jwt-facebook",
      tokenType: "Bearer",
      user: {
        id: 2,
        email: "f@example.com",
        displayName: "Facebook User",
        username: "fuser",
        role: "LEARNER",
      },
    });

    const { findByLabelText } = await renderLoginScreen();
    const facebookButton = await findByLabelText("Đăng nhập bằng Facebook");
    await fireEvent.press(facebookButton);

    await waitFor(() => {
      expect(mockedAuthService.loginWithFacebook).toHaveBeenCalledWith({
        accessToken: "test-fb-access-token",
      });
    });
    expect(mockedStorage.set).toHaveBeenCalledWith(TOKEN_KEY, "jwt-facebook");
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });
});
