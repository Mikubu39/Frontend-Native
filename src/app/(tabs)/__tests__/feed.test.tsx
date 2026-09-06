import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FeedScreen from "../feed";
import { feedApi } from "@/services/api/feed";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { Colors } from "@/constants/theme";
import type { FeedPostResponse } from "@/types/api";

jest.mock("@/services/api/feed", () => ({
  feedApi: {
    getFeed: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    getComments: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock("@/contexts/toast-context", () => ({
  useToast: jest.fn(),
}));

const mockedFeedApi = feedApi as jest.Mocked<typeof feedApi>;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const showError = jest.fn();

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <FeedScreen />
    </SafeAreaProvider>,
  );
}

const statusPost: FeedPostResponse = {
  id: 501,
  author: { id: 12, displayName: "Yamada Taro", avatarUrl: null },
  postType: "USER_STATUS",
  content: "Hôm nay học xong bài Kanji N4 đầu tiên!",
  createdAt: "2026-08-24T09:12:00",
  likeCount: 3,
  commentCount: 1,
  likedByMe: false,
};

const achievementPost: FeedPostResponse = {
  id: 500,
  author: { id: 12, displayName: "Yamada Taro", avatarUrl: null },
  postType: "SYSTEM_ACHIEVEMENT",
  content:
    'Đã đạt thành tích "Người mới bắt đầu"! Hoàn thành bài học đầu tiên.',
  createdAt: "2026-08-23T20:00:00",
  likeCount: 5,
  commentCount: 0,
  likedByMe: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAuth.mockReturnValue({
    user: { id: "1", email: "hoc.vien@example.com", displayName: "Hoc Vien" },
  });
  mockedUseTheme.mockReturnValue({ colors: Colors.light, isDark: false });
  mockedUseToast.mockReturnValue({
    showError,
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  });
  mockedFeedApi.getFeed.mockResolvedValue({
    items: [statusPost, achievementPost],
    nextCursor: null,
  });
});

describe("FeedScreen", () => {
  it("loads the feed and renders both status and system-achievement posts", async () => {
    const { findAllByText, findByText } = await renderScreen();

    // Both posts share the same author.
    expect(await findAllByText("Yamada Taro")).toHaveLength(2);
    expect(
      await findByText("Hôm nay học xong bài Kanji N4 đầu tiên!"),
    ).toBeTruthy();
    expect(
      await findByText(
        'Đã đạt thành tích "Người mới bắt đầu"! Hoàn thành bài học đầu tiên.',
      ),
    ).toBeTruthy();
    expect(mockedFeedApi.getFeed).toHaveBeenCalled();
  });

  it("likes a post optimistically and calls the like API", async () => {
    const { findByText } = await renderScreen();

    const likeCount = await findByText("3");
    fireEvent.press(likeCount);

    // Optimistic update: count increments before the request resolves.
    expect(await findByText("4")).toBeTruthy();
    await waitFor(() =>
      expect(mockedFeedApi.likePost).toHaveBeenCalledWith(501),
    );
  });

  it("posts a new status update from the compose bar and refreshes the feed", async () => {
    mockedFeedApi.createPost.mockResolvedValue(undefined);
    const { findByPlaceholderText, findByTestId } = await renderScreen();

    const input = await findByPlaceholderText("Hôm nay bạn học được gì?");
    fireEvent.changeText(input, "Vừa học xong 20 từ mới!");

    const sendButton = await findByTestId("compose-send-button");
    fireEvent.press(sendButton);

    await waitFor(() =>
      expect(mockedFeedApi.createPost).toHaveBeenCalledWith({
        content: "Vừa học xong 20 từ mới!",
      }),
    );
    // Feed reloads after a successful post.
    expect(mockedFeedApi.getFeed).toHaveBeenCalledTimes(2);
  });

  it("does not submit an empty status update", async () => {
    const { findByTestId } = await renderScreen();

    const sendButton = await findByTestId("compose-send-button");
    fireEvent.press(sendButton);

    expect(mockedFeedApi.createPost).not.toHaveBeenCalled();
  });

  it("shows an error toast when the feed fails to load", async () => {
    mockedFeedApi.getFeed.mockRejectedValueOnce(new Error("network"));

    await renderScreen();

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Lỗi", "Không thể tải bảng tin."),
    );
  });
});
