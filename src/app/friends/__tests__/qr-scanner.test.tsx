import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import QRScannerScreen from "../scan";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "expo-router";
import { useCameraPermissions } from "expo-camera";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/contexts/toast-context", () => ({
  useToast: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <QRScannerScreen />
    </SafeAreaProvider>,
  );
}

describe("QRScannerScreen Integration Tests", () => {
  const mockRouter = {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  };

  const mockToast = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
  };

  const mockUser = {
    id: "1",
    displayName: "Taro Yamada",
    username: "taro_dev",
    email: "taro@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: true, canAskAgain: true, status: "granted" },
      jest.fn(),
    ]);
  });

  it("renders camera view and controls when permission is granted", async () => {
    await renderScreen();

    expect(screen.getByTestId("mock-camera-view")).toBeTruthy();
    expect(screen.getByText("Quét mã QR")).toBeTruthy();
    expect(
      screen.getByText("Căn chỉnh mã QR bạn bè vào trong khung ngắm"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Mở mã QR của tôi")).toBeTruthy();
  });

  it("renders permission request view when permission is not granted", async () => {
    const mockRequestPermission = jest.fn();
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false, canAskAgain: true, status: "denied" },
      mockRequestPermission,
    ]);

    await renderScreen();

    expect(screen.getByText("Cần quyền truy cập Máy ảnh")).toBeTruthy();
    const grantBtn = screen.getByText("Cấp quyền máy ảnh");
    fireEvent.press(grantBtn);
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("toggles torch light when flashlight button is pressed", async () => {
    await renderScreen();

    const torchBtn = screen.getByLabelText("Bật hoặc tắt đèn flash");

    expect(screen.getByTestId("mock-camera-view").props.enableTorch).toBe(
      false,
    );

    await act(async () => {
      fireEvent.press(torchBtn);
    });
    expect(screen.getByTestId("mock-camera-view").props.enableTorch).toBe(true);

    await act(async () => {
      fireEvent.press(torchBtn);
    });
    expect(screen.getByTestId("mock-camera-view").props.enableTorch).toBe(
      false,
    );
  });

  it("warns user when scanning their own QR code", async () => {
    await renderScreen();
    const cameraView = screen.getByTestId("mock-camera-view");

    // Simulate scanning current user's QR
    await act(async () => {
      cameraView.props.onBarcodeScanned({
        data: "nihongo://friends/profile/taro_dev",
      });
    });

    expect(mockToast.showWarning).toHaveBeenCalledWith(
      "Mã cá nhân",
      "Đây là mã QR của chính bạn!",
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("shows error toast when scanning invalid QR data", async () => {
    await renderScreen();
    const cameraView = screen.getByTestId("mock-camera-view");

    // Simulate scanning invalid content
    await act(async () => {
      cameraView.props.onBarcodeScanned({
        data: "https://unknownsite.com/invalid/path/to/random",
      });
    });

    expect(mockToast.showError).toHaveBeenCalledWith(
      "Mã QR không hợp lệ",
      "Mã QR này không thuộc định dạng hồ sơ Nihongo.",
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("navigates to friend's profile on scanning valid friend QR code", async () => {
    await renderScreen();
    const cameraView = screen.getByTestId("mock-camera-view");

    // Simulate scanning friend's QR
    await act(async () => {
      cameraView.props.onBarcodeScanned({
        data: "nihongo://friends/profile/hanako_san",
      });
    });

    expect(mockToast.showSuccess).toHaveBeenCalledWith(
      "Đã tìm thấy bạn bè!",
      "@hanako_san",
    );

    await waitFor(
      () => {
        expect(mockRouter.replace).toHaveBeenCalledWith({
          pathname: "/friends/profile/[username]",
          params: { username: "hanako_san" },
        });
      },
      { timeout: 2000 },
    );
  });

  it("navigates to My QR screen when clicking shortcut button", async () => {
    await renderScreen();

    const myQrBtn = screen.getByLabelText("Mở mã QR của tôi");
    fireEvent.press(myQrBtn);

    expect(mockRouter.replace).toHaveBeenCalledWith("/profile/qr");
  });

  it("navigates back when clicking top back button", async () => {
    await renderScreen();

    const backBtn = screen.getByLabelText("Quay lại");
    fireEvent.press(backBtn);

    expect(mockRouter.back).toHaveBeenCalled();
  });
});
