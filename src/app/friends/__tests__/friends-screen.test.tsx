import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FriendsScreen from "../index";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "expo-router";
import { userService } from "@/services/api/user";
import * as Contacts from "expo-contacts";

jest.mock("@/contexts/toast-context", () => ({
  useToast: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: () => ({
    colors: {
      background: "#FDFBF7",
      card: "#FFFFFF",
      borderSubtle: "#E5E7EB",
      border: "#E5E7EB",
      text: "#1F2937",
      textSecondary: "#6B7280",
      backgroundElement: "#F3F4F6",
    },
    isDark: false,
    theme: "light",
    themeMode: "light",
    setThemeMode: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    background: "#FDFBF7",
    card: "#FFFFFF",
    borderSubtle: "#E5E7EB",
    border: "#E5E7EB",
    text: "#1F2937",
    textSecondary: "#6B7280",
    backgroundElement: "#F3F4F6",
  }),
}));

jest.mock("@/services/api/user", () => ({
  userService: {
    syncContacts: jest.fn(),
  },
}));

jest.mock("expo-contacts", () => ({
  requestPermissionsAsync: jest.fn(),
  getContactsAsync: jest.fn(),
  Fields: {
    PhoneNumbers: "phoneNumbers",
  },
}));

async function renderScreen() {
  return await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <FriendsScreen />
    </SafeAreaProvider>,
  );
}

describe("FriendsScreen (Thêm Bạn Bè & Danh Bạ)", () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockToast = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it("renders screen header and 4 friend discovery options", async () => {
    const { getByText } = await renderScreen();

    expect(getByText("Thêm Bạn Bè")).toBeTruthy();
    expect(getByText("Tìm kiếm bạn bè")).toBeTruthy();
    expect(getByText("Tìm từ danh bạ")).toBeTruthy();
    expect(getByText("Chia sẻ mã cá nhân")).toBeTruthy();
    expect(getByText("Quét mã QR")).toBeTruthy();
  });

  it("navigates to /friends/search when clicking 'Tìm kiếm bạn bè'", async () => {
    const { getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByText("Tìm kiếm bạn bè"));
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/friends/search");
  });

  it("navigates to /profile/qr when clicking 'Chia sẻ mã cá nhân'", async () => {
    const { getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByText("Chia sẻ mã cá nhân"));
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/profile/qr");
  });

  it("navigates to /friends/scan when clicking 'Quét mã QR'", async () => {
    const { getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByText("Quét mã QR"));
    });
    expect(mockRouter.push).toHaveBeenCalledWith("/friends/scan");
  });

  it("shows warning toast when contacts permission is denied", async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByText("Tìm từ danh bạ"));
    });

    await waitFor(() => {
      expect(Contacts.requestPermissionsAsync).toHaveBeenCalled();
      expect(mockToast.showWarning).toHaveBeenCalledWith(
        "Quyền bị từ chối",
        "Ứng dụng cần quyền truy cập danh bạ để tìm bạn bè.",
      );
      expect(userService.syncContacts).not.toHaveBeenCalled();
    });
  });

  it("syncs contacts and opens results modal, navigating to view-search-profile on selection", async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    (Contacts.getContactsAsync as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "c1",
          name: "Kenji Sato",
          phoneNumbers: [{ number: "0912345678" }],
        },
      ],
    });

    (userService.syncContacts as jest.Mock).mockResolvedValue([
      {
        id: 42,
        displayName: "Kenji Sato",
        avatarUrl: "https://example.com/kenji.png",
        level: 5,
        username: "kenji_s",
      },
    ]);

    const { getByText } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByText("Tìm từ danh bạ"));
    });

    await waitFor(() => {
      expect(userService.syncContacts).toHaveBeenCalledWith({
        phoneNumbers: expect.arrayContaining(["0912345678"]),
      });
      expect(getByText("Kết quả đồng bộ")).toBeTruthy();
      expect(getByText("Kenji Sato")).toBeTruthy();
      expect(getByText("Lv 5")).toBeTruthy();
    });

    // Press user card to view profile
    await act(async () => {
      fireEvent.press(getByText("Kenji Sato"));
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/friends/view-search-profile",
      params: {
        id: "42",
        username: "kenji_s",
        displayName: "Kenji Sato",
        avatarUrl: "https://example.com/kenji.png",
        level: "5",
        isFollowing: "false",
      },
    });
  });
});
