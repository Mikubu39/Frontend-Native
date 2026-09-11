import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/contexts/toast-context";
import QuizScreen from "../[id]";
import { lessonAttemptApi } from "@/services/api/lessons";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import { useSoundEffect } from "@/hooks/use-sound-effect";
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
jest.mock("@/hooks/use-sound-effect", () => ({
  useSoundEffect: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({ lessonId: "1" }),
}));

const mockedApi = lessonAttemptApi as jest.Mocked<typeof lessonAttemptApi>;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseAudio = useAudio as jest.Mock;
const mockedUseSoundEffect = useSoundEffect as jest.Mock;

const mockPlayCorrect = jest.fn();
const mockPlayIncorrect = jest.fn();

const QUIZ_RESPONSE: StartLessonResponse = {
  lessonId: 1,
  lessonType: "NORMAL",
  totalEnergyDeducted: 0,
  isReplay: false,
  questions: [
    {
      questionId: 101,
      questionType: "TRANSLATE_TO_VN",
      content: "Neko nghĩa là gì?",
      audioUrl: "/uploads/audios/words/neko.mp3",
      metadataJson: { kana: "ねこ", romaji: "neko" },
      options: [
        { optionId: 1, content: "Con mèo", isCorrect: true },
        { optionId: 2, content: "Con chó", isCorrect: false },
      ],
    },
  ],
};

/** Ba câu để kiểm chứng bậc thang combo leo lên rồi rơi lại sau khi sai. */
const LADDER_RESPONSE: StartLessonResponse = {
  ...QUIZ_RESPONSE,
  questions: [
    QUIZ_RESPONSE.questions[0],
    {
      questionId: 102,
      questionType: "TRANSLATE_TO_VN",
      content: "Inu nghĩa là gì?",
      audioUrl: "/uploads/audios/words/inu.mp3",
      metadataJson: { kana: "いぬ", romaji: "inu" },
      options: [
        { optionId: 3, content: "Con chó", isCorrect: true },
        { optionId: 4, content: "Con mèo", isCorrect: false },
      ],
    },
    {
      questionId: 103,
      questionType: "TRANSLATE_TO_VN",
      content: "Tori nghĩa là gì?",
      audioUrl: "/uploads/audios/words/tori.mp3",
      metadataJson: { kana: "とり", romaji: "tori" },
      options: [
        { optionId: 5, content: "Con chim", isCorrect: true },
        { optionId: 6, content: "Con cá", isCorrect: false },
      ],
    },
  ],
};

async function renderQuiz() {
  return await render(
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

describe("QuizScreen Sound Effects Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      colors: {
        background: "#FFF",
        card: "#FFF",
        border: "#EEE",
        text: "#000",
        textSecondary: "#666",
        primary: "#8B5CF6",
      },
      isDark: false,
    });
    mockedUseGamification.mockReturnValue({
      deductEnergy: jest.fn(),
      maxEnergy: 100,
    });
    mockedUseAudio.mockReturnValue({
      isPlaying: false,
      play: jest.fn(),
      stop: jest.fn(),
    });
    mockedUseSoundEffect.mockReturnValue({
      playCorrect: mockPlayCorrect,
      playIncorrect: mockPlayIncorrect,
      soundEnabled: true,
      setSoundEnabled: jest.fn(),
      toggleSoundEnabled: jest.fn(),
    });
    mockedApi.startLesson.mockResolvedValue(QUIZ_RESPONSE);
  });

  it("phát âm thanh Đúng khi người học chọn đáp án chính xác", async () => {
    const { findByText, getByText, getByTestId } = await renderQuiz();

    // Bỏ qua thẻ giới thiệu từ nếu có
    const skipButton = await findByText("TÔI ĐÃ BIẾT — BỎ QUA");
    await fireEvent.press(skipButton);

    // Tìm và chọn đáp án đúng
    const correctOption = getByTestId("answer-1");
    await fireEvent.press(correctOption);

    // Bấm nút KIỂM TRA
    await fireEvent.press(getByText("KIỂM TRA"));

    expect(mockPlayCorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayIncorrect).not.toHaveBeenCalled();
  });

  it("phát âm thanh Sai khi người học chọn đáp án chưa chính xác", async () => {
    const { findByText, getByText, getByTestId } = await renderQuiz();

    // Bỏ qua thẻ giới thiệu từ nếu có
    const skipButton = await findByText("TÔI ĐÃ BIẾT — BỎ QUA");
    await fireEvent.press(skipButton);

    // Tìm và chọn đáp án sai
    const wrongOption = getByTestId("answer-2");
    await fireEvent.press(wrongOption);

    // Bấm nút KIỂM TRA
    await fireEvent.press(getByText("KIỂM TRA"));

    expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
    expect(mockPlayCorrect).not.toHaveBeenCalled();
  });

  it("nâng bậc cao độ theo chuỗi câu đúng liên tiếp", async () => {
    mockedApi.startLesson.mockResolvedValue(LADDER_RESPONSE);
    const { findByText, getByText, getByTestId } = await renderQuiz();

    await fireEvent.press(await findByText("TÔI ĐÃ BIẾT — BỎ QUA"));

    await fireEvent.press(getByTestId("answer-1"));
    await fireEvent.press(getByText("KIỂM TRA"));
    // Câu đúng đầu tiên phát bậc thấp nhất của thang yo.
    expect(mockPlayCorrect).toHaveBeenLastCalledWith(0);

    await fireEvent.press(getByText("TIẾP TỤC"));
    await fireEvent.press(getByTestId("answer-3"));
    await fireEvent.press(getByText("KIỂM TRA"));
    // Câu đúng thứ hai leo lên một bậc.
    expect(mockPlayCorrect).toHaveBeenLastCalledWith(1);
    expect(mockPlayCorrect).toHaveBeenCalledTimes(2);
  });

  it("rơi lại bậc thấp nhất sau khi trả lời sai", async () => {
    mockedApi.startLesson.mockResolvedValue(LADDER_RESPONSE);
    const { findByText, getByText, getByTestId } = await renderQuiz();

    await fireEvent.press(await findByText("TÔI ĐÃ BIẾT — BỎ QUA"));

    await fireEvent.press(getByTestId("answer-1"));
    await fireEvent.press(getByText("KIỂM TRA"));
    expect(mockPlayCorrect).toHaveBeenLastCalledWith(0);

    await fireEvent.press(getByText("TIẾP TỤC"));
    await fireEvent.press(getByTestId("answer-4"));
    await fireEvent.press(getByText("KIỂM TRA"));
    expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);

    // Chuỗi đứt thì bậc phải về 0. Nếu không reset, câu đúng kế tiếp sẽ phát
    // bậc 1 vì combo cũ vẫn còn.
    await fireEvent.press(getByText("TIẾP TỤC"));
    await fireEvent.press(getByTestId("answer-5"));
    await fireEvent.press(getByText("KIỂM TRA"));
    expect(mockPlayCorrect).toHaveBeenLastCalledWith(0);
  });
});
