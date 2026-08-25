import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/contexts/toast-context";
import QuizScreen from "../[id]";
import { lessonAttemptApi } from "@/services/api/lessons";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import type { StartLessonResponse } from "@/types/api";

jest.mock("@/services/api/lessons", () => ({
  lessonAttemptApi: {
    startLesson: jest.fn(),
    submitLesson: jest.fn(),
  },
}));

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/contexts/gamification-context", () => ({
  useGamification: jest.fn(),
}));
jest.mock("@/hooks/use-audio", () => ({ useAudio: jest.fn() }));

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: mockBack,
    replace: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({ lessonId: "1" }),
}));

const mockedApi = lessonAttemptApi as jest.Mocked<typeof lessonAttemptApi>;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseAudio = useAudio as jest.Mock;
const play = jest.fn();
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

/**
 * Bài 1 thật của bộ demo: người học chưa biết một chữ tiếng Nhật nào mà câu đầu
 * tiên đã hỏi thẳng "Chữ 「あ」 đọc là gì?". Test này khoá lại hành vi đúng —
 * phải dạy mặt chữ trước, rồi mới hỏi.
 */
const START_RESPONSE: StartLessonResponse = {
  lessonId: 1,
  lessonType: "NORMAL",
  totalEnergyDeducted: 5,
  isReplay: false,
  questions: [
    {
      questionId: 1,
      questionType: "TRANSLATE_TO_VN",
      content: "Chữ 「あ」 đọc là gì?",
      audioUrl: "/uploads/audios/kana/kana-a.mp3",
      metadataJson: { symbol: "あ", romaji: "a", type: "HIRAGANA" },
      options: [
        { optionId: 1, content: "i", isCorrect: false },
        { optionId: 4, content: "a", isCorrect: true },
      ],
    },
    {
      questionId: 2,
      questionType: "TRANSLATE_TO_VN",
      content: "Chữ 「い」 đọc là gì?",
      audioUrl: "/uploads/audios/kana/kana-i.mp3",
      metadataJson: { symbol: "い", romaji: "i", type: "HIRAGANA" },
      options: [
        { optionId: 5, content: "a", isCorrect: false },
        { optionId: 8, content: "i", isCorrect: true },
      ],
    },
  ],
};

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <ToastProvider>
        <QuizScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

describe("QuizScreen — dạy trước khi hỏi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        text: "#1A1A2E",
        textSecondary: "#6B7280",
        background: "#FFF8E7",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
    });
    mockedUseGamification.mockReturnValue({
      deductEnergy: jest.fn(),
      refillEnergy: jest.fn(),
      watchAdToRefill: jest.fn(),
    });
    mockedUseAudio.mockReturnValue({ isPlaying: false, play, stop: jest.fn() });
    mockedApi.startLesson.mockResolvedValue(START_RESPONSE);
  });

  it("giới thiệu từng chữ mới rồi mới hỏi, và tự phát âm thanh của thẻ", async () => {
    const { findByText, getByText, queryByText } = await renderScreen();

    // Thẻ dạy chữ đầu tiên — KHÔNG phải câu hỏi.
    expect(await findByText("CHỮ MỚI 1/2")).toBeTruthy();
    expect(getByText("あ")).toBeTruthy();
    expect(getByText("a")).toBeTruthy();
    expect(queryByText("Từ này nghĩa là gì?")).toBeNull();

    // Nghe được ngay khi thẻ hiện ra: đây là điểm hỏng người dùng báo lại
    // (nút loa không ra tiếng vì URL tương đối chưa được ghép base URL).
    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(mockedUseAudio).toHaveBeenCalledWith(
      `${API_BASE}/uploads/audios/kana/kana-a.mp3`,
    );

    fireEvent.press(getByText("TIẾP TỤC"));

    // Thẻ thứ hai.
    expect(await findByText("CHỮ MỚI 2/2")).toBeTruthy();
    expect(getByText("い")).toBeTruthy();

    // Hết thẻ thì nút đổi nhãn và mới vào phần luyện tập.
    fireEvent.press(getByText("BẮT ĐẦU LUYỆN TẬP"));
    // Yêu cầu tách hẳn khỏi đề bài: dòng trên là "phải làm gì", bong bóng chỉ
    // còn đúng chữ cần xử lý — không còn nguyên câu "Chữ 「あ」 đọc là gì?".
    expect(await findByText("Từ này nghĩa là gì?")).toBeTruthy();
    expect(getByText("あ")).toBeTruthy();
  });

  it("cho phép bỏ qua phần dạy để vào thẳng câu hỏi", async () => {
    const { findByText, getByText } = await renderScreen();

    expect(await findByText("CHỮ MỚI 1/2")).toBeTruthy();
    fireEvent.press(getByText("TÔI ĐÃ BIẾT — BỎ QUA"));

    expect(await findByText("Từ này nghĩa là gì?")).toBeTruthy();
  });

  it("báo lỗi khi nộp bài thất bại thay vì im lặng nuốt mất kết quả", async () => {
    // Trước đây `moveToNextQuestion` chỉ console.error rồi tắt spinner: người
    // học đứng ở câu cuối, không biết mình vừa mất sạch kết quả, cũng chẳng có
    // gì để bấm tiếp.
    mockedApi.submitLesson.mockRejectedValue(new Error("Network Error"));

    const { findByText, getByText, getByTestId } = await renderScreen();

    expect(await findByText("CHỮ MỚI 1/2")).toBeTruthy();
    await fireEvent.press(getByText("TÔI ĐÃ BIẾT — BỎ QUA"));

    // Câu 1 → chọn đáp án đúng → KIỂM TRA → TIẾP TỤC.
    expect(await findByText("Từ này nghĩa là gì?")).toBeTruthy();
    await fireEvent.press(getByTestId("answer-4"));
    await fireEvent.press(getByText("KIỂM TRA"));
    await fireEvent.press(await findByText("TIẾP TỤC"));

    // Câu 2 là câu cuối → nút đổi thành HOÀN THÀNH, bấm là gọi submit.
    expect(await findByText("い")).toBeTruthy();
    await fireEvent.press(getByTestId("answer-8"));
    await fireEvent.press(getByText("KIỂM TRA"));
    await fireEvent.press(await findByText("HOÀN THÀNH"));

    await waitFor(() => expect(mockedApi.submitLesson).toHaveBeenCalled());
    expect(await findByText("Chưa nộp được bài")).toBeTruthy();
  });
});
