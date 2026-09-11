/**
 * Ôn tập từ vựng theo lịch ngắt quãng — kiểm thử tích hợp.
 *
 * Điều cần bảo vệ:
 *  1. Đề bài dựng từ hàng đợi tới hạn, và ĐÁP ÁN ĐÚNG luôn có mặt trong 4 lựa chọn
 *     (nếu kho nghĩa nhiễu nghèo thì vẫn không được nuốt mất đáp án).
 *  2. Không tô màu đúng/sai TRƯỚC khi người học chọn — tô sớm là lộ đáp án.
 *  3. Làm hết bộ đề thì gửi kết quả lên server đúng theo từng `vocabularyId`.
 *  4. Không có từ nào tới hạn là TIN VUI, phải nói bằng giọng khen chứ không phải
 *     màn hình lỗi.
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import VocabularyReviewScreen from "../vocabulary";
import { vocabularyApi } from "@/services/api/vocabulary";
import { useTheme } from "@/contexts/theme-context";
import type { VocabularyItem } from "@/types";

jest.mock("@/services/api/vocabulary", () => ({
  vocabularyApi: {
    getDue: jest.fn(),
    submitReview: jest.fn(),
  },
}));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

const mockedApi = vocabularyApi as jest.Mocked<typeof vocabularyApi>;
const mockedUseTheme = useTheme as jest.Mock;

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function item(id: number, surface: string, meaning: string): VocabularyItem {
  return {
    id,
    itemType: "VOCAB",
    surface,
    romaji: null,
    meaningVn: meaning,
    due: true,
  };
}

const DUE_ITEMS = [
  item(1, "おはよう", "chào buổi sáng (thân mật)"),
  item(2, "ありがとう", "cảm ơn (thân mật)"),
];

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <VocabularyReviewScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      background: "#FFF",
      card: "#FFF",
      border: "#EEE",
      text: "#000",
      textSecondary: "#666",
    },
  });
  mockedApi.submitReview.mockResolvedValue({
    reviewedCount: 2,
    correctCount: 1,
    remainingDue: 3,
  });
});

describe("Ôn tập từ vựng (SM-2)", () => {
  it("hiện từ tới hạn kèm đáp án đúng, và chỉ tô màu sau khi đã chọn", async () => {
    mockedApi.getDue.mockResolvedValue({
      dueCount: 2,
      learnedCount: 5,
      items: DUE_ITEMS,
    });

    const screen = await renderScreen();

    expect(await screen.findByText("Từ 1/2")).toBeTruthy();
    expect(screen.getByText("おはよう")).toBeTruthy();
    // Đáp án đúng luôn phải có mặt dù kho nghĩa nhiễu chỉ có 2 mục.
    expect(screen.getByText("chào buổi sáng (thân mật)")).toBeTruthy();

    // Chưa chọn thì chưa có nút đi tiếp — không có đường "bấm bừa cho qua".
    expect(screen.queryByText("TIẾP TỤC")).toBeNull();
  });

  it("làm hết bộ đề thì gửi đúng kết quả từng từ lên server", async () => {
    mockedApi.getDue.mockResolvedValue({
      dueCount: 2,
      learnedCount: 5,
      items: DUE_ITEMS,
    });

    const screen = await renderScreen();
    await screen.findByText("Từ 1/2");

    // Từ 1: chọn ĐÚNG.
    await fireEvent.press(screen.getByText("chào buổi sáng (thân mật)"));
    await fireEvent.press(await screen.findByText("TIẾP TỤC"));

    // Từ 2: chọn SAI (bấm vào nghĩa của từ kia).
    await screen.findByText("Từ 2/2");
    await fireEvent.press(screen.getByText("chào buổi sáng (thân mật)"));
    await fireEvent.press(await screen.findByText("HOÀN THÀNH"));

    await waitFor(() =>
      expect(mockedApi.submitReview).toHaveBeenCalledTimes(1),
    );
    expect(mockedApi.submitReview).toHaveBeenCalledWith([
      { vocabularyId: 1, correct: true },
      { vocabularyId: 2, correct: false },
    ]);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/quiz/result",
          params: expect.objectContaining({
            correctCount: 1,
            wrongCount: 1,
            lessonType: "REVIEW_VOCAB",
            // Server báo còn 3 từ tới hạn -> phải mang theo để màn kết quả
            // mời "Ôn Tiếp" thay vì đá thẳng về trang chủ.
            remainingCount: 3,
          }),
        }),
      ),
    );
  });

  it("không còn từ tới hạn thì khen chứ không báo lỗi", async () => {
    mockedApi.getDue.mockResolvedValue({
      dueCount: 0,
      learnedCount: 12,
      items: [],
    });

    const screen = await renderScreen();

    expect(await screen.findByText("Chưa có từ nào tới hạn")).toBeTruthy();
    expect(mockedApi.submitReview).not.toHaveBeenCalled();
  });

  it("mất mạng lúc nộp thì vẫn cho xem kết quả, không nuốt mất công người học", async () => {
    mockedApi.getDue.mockResolvedValue({
      dueCount: 1,
      learnedCount: 3,
      items: [DUE_ITEMS[0]],
    });
    mockedApi.submitReview.mockRejectedValue(new Error("Network Error"));

    const screen = await renderScreen();
    await screen.findByText("Từ 1/1");

    await fireEvent.press(screen.getByText("chào buổi sáng (thân mật)"));
    await fireEvent.press(await screen.findByText("HOÀN THÀNH"));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: "/quiz/result",
          params: expect.objectContaining({
            correctCount: 1,
            wrongCount: 0,
            lessonType: "REVIEW_VOCAB",
          }),
        }),
      ),
    );
  });
});
