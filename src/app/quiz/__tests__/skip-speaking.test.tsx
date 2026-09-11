import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
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

const START_RESPONSE: StartLessonResponse = {
  lessonId: 1,
  lessonType: "NORMAL",
  totalEnergyDeducted: 5,
  isReplay: false,
  questions: [
    {
      questionId: 101,
      questionType: "SPEAKING",
      content: "Nhấn vào micro và đọc to câu sau: こんにちは",
      metadataJson: {
        jp: "こんにちは",
        vn: "Xin chào",
        romaji: "konnichiwa",
      },
      options: [
        {
          optionId: 1,
          content: "こんにちは",
          isCorrect: true,
          metadataJson: { romaji: "konnichiwa" },
        },
      ],
    },
    {
      questionId: 102,
      questionType: "TRANSLATE_TO_VN",
      content: "Chọn nghĩa đúng của từ",
      metadataJson: {
        jp: "ねこ",
        vn: "con mèo",
      },
      options: [
        { optionId: 2, content: "con mèo", isCorrect: true },
        { optionId: 3, content: "con chó", isCorrect: false },
      ],
    },
  ],
};

function renderQuiz() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <ToastProvider>
        <QuizScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

describe("Tính năng bỏ qua câu hỏi nói (Skip Speaking)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: {
        background: "#FFF",
        text: "#000",
        textSecondary: "#666",
      },
      isDark: false,
    });
    mockedUseGamification.mockReturnValue({
      deductEnergy: jest.fn(),
      maxEnergy: 25,
      refillEnergy: jest.fn(),
      watchAdToRefill: jest.fn(),
    });
    mockedUseAudio.mockReturnValue({
      isPlaying: false,
      play: jest.fn(),
      stop: jest.fn(),
    });
    mockedApi.startLesson.mockResolvedValue(START_RESPONSE);
  });

  it("hiển thị nút 'Không thể nói lúc này?' ở thanh đáy khi vào câu phát âm và bỏ qua thành công", async () => {
    const { getByText, queryByText, findByText } = await renderQuiz();

    // Nếu có thẻ dạy học, bấm bỏ qua để vào câu hỏi
    const skipTeachBtn = await findByText("TÔI ĐÃ BIẾT — BỎ QUA");
    fireEvent.press(skipTeachBtn);

    // Đợi tải xong câu hỏi đầu tiên (câu phát âm)
    expect(await findByText("Không thể nói lúc này?")).toBeTruthy();

    // Bấm nút "Không thể nói lúc này?"
    fireEvent.press(getByText("Không thể nói lúc này?"));

    // Kiểm tra đã tự động chuyển sang câu tiếp theo (câu từ vựng con mèo)
    expect(await findByText("con mèo")).toBeTruthy();
    expect(queryByText("Không thể nói lúc này?")).toBeNull();
  });
});
