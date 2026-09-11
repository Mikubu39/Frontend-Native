import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { MoreBottomSheet } from "../more-bottom-sheet";
import { ThemeProvider } from "@/contexts/theme-context";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockSignOut = jest.fn();
jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

describe("MoreBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders learning and system groups with subtitles, excluding duplicate/empty items", async () => {
    const handleClose = jest.fn();

    const { getByText, queryByText } = await render(
      <ThemeProvider>
        <MoreBottomSheet visible={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    // Group titles
    expect(getByText("HỌC TẬP & CÁ NHÂN")).toBeTruthy();
    expect(getByText("HỆ THỐNG")).toBeTruthy();

    // Learning items & subtitles
    expect(getByText("Hồ sơ cá nhân")).toBeTruthy();
    expect(getByText("Cấp độ, chuỗi ngày & thành tích")).toBeTruthy();

    expect(getByText("Trung tâm luyện tập")).toBeTruthy();
    expect(getByText("Ôn từ vựng, ngữ pháp & sửa lỗi")).toBeTruthy();

    expect(getByText("Bảng chữ Kana")).toBeTruthy();
    expect(getByText("Luyện bảng chữ cái Hiragana & Katakana")).toBeTruthy();

    expect(getByText("Sổ tay từ điển")).toBeTruthy();
    expect(getByText("Tra cứu từ vựng bạn đã tích lũy")).toBeTruthy();

    // System items & subtitles
    expect(getByText("Cài đặt")).toBeTruthy();
    expect(getByText("Âm thanh, thông báo & tài khoản")).toBeTruthy();

    expect(getByText("Đăng xuất")).toBeTruthy();
    expect(getByText("Thoát tài khoản khỏi thiết bị")).toBeTruthy();

    // Removed duplicate and dead items MUST NOT exist
    expect(queryByText("Bảng xếp hạng")).toBeNull();
    expect(queryByText("Bạn bè & Theo dõi")).toBeNull();
    expect(queryByText("Trợ giúp & Phản hồi")).toBeNull();
  });

  it("navigates to the correct routes when options are pressed", async () => {
    const handleClose = jest.fn();

    const { getByText } = await render(
      <ThemeProvider>
        <MoreBottomSheet visible={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    // Navigate to Profile
    fireEvent.press(getByText("Hồ sơ cá nhân"));
    expect(mockPush).toHaveBeenCalledWith("/(tabs)/profile");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("opens custom SignOutModal and handles cancelation", async () => {
    const handleClose = jest.fn();

    const { getByTestId, getByText, queryByText } = await render(
      <ThemeProvider>
        <MoreBottomSheet visible={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    // Click "Đăng xuất" option
    fireEvent.press(getByTestId("more-option-signout"));

    // Custom theme modal should be visible
    await waitFor(() => {
      expect(getByText("Đăng xuất tài khoản?")).toBeTruthy();
    });
    expect(
      getByText(
        "Bạn có chắc chắn muốn đăng xuất không? Tiến trình học tập của bạn vẫn được lưu trữ an toàn trên máy chủ.",
      ),
    ).toBeTruthy();

    // Click cancel button "Ở LẠI HỌC"
    fireEvent.press(getByTestId("sign-out-cancel-btn"));

    // Modal should close without signing out
    await waitFor(() => {
      expect(queryByText("Đăng xuất tài khoản?")).toBeNull();
    });
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("confirms sign out in custom SignOutModal and calls signOut before closing", async () => {
    const handleClose = jest.fn();
    const callOrder: string[] = [];

    mockSignOut.mockImplementation(async () => {
      callOrder.push("signOut");
    });
    handleClose.mockImplementation(() => {
      callOrder.push("close");
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <MoreBottomSheet visible={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    // Click "Đăng xuất" option
    fireEvent.press(getByTestId("more-option-signout"));

    await waitFor(() => {
      expect(getByText("Đăng xuất tài khoản?")).toBeTruthy();
    });

    // The modal confirm button
    fireEvent.press(getByTestId("sign-out-confirm-btn"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(["signOut", "close"]);
    });
  });

  it("returns null when visible is false", async () => {
    const { queryByText } = await render(
      <ThemeProvider>
        <MoreBottomSheet visible={false} onClose={jest.fn()} />
      </ThemeProvider>,
    );

    expect(queryByText("Khám phá thêm")).toBeNull();
  });
});
