import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AlphabetPracticeScreen from "../practice";
import { alphabetApi } from "@/services/api/alphabets";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useAudio } from "@/hooks/use-audio";
import { AlphabetPracticeStartResponse } from "@/types/alphabet";

jest.mock("@/services/api/alphabets", () => ({
  alphabetApi: {
    startPractice: jest.fn(),
    submitPractice: jest.fn(),
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
}));

const mockedApi = alphabetApi as jest.Mocked<typeof alphabetApi>;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGamification = useGamification as jest.Mock;
const mockedUseAudio = useAudio as jest.Mock;
const addExp = jest.fn();

const START_RESPONSE: AlphabetPracticeStartResponse = {
  practiceSessionId: "prac-9988",
  questions: [
    {
      characterId: 1,
      questionType: "MULTIPLE_CHOICE",
      prompt: "Nghe và chọn chữ cái đúng",
      audioUrl: "https://cdn.example.com/audio/a.mp3",
      symbol: null,
      strokeOrderData: null,
      options: [
        { optionId: 101, content: "あ", isCorrect: true },
        { optionId: 102, content: "い", isCorrect: false },
        { optionId: 103, content: "う", isCorrect: false },
        { optionId: 104, content: "え", isCorrect: false },
      ],
    },
    {
      characterId: 5,
      questionType: "DRAWING",
      prompt: "Viết chữ: o",
      audioUrl: null,
      symbol: "お",
      // Backend chưa có dữ liệu nét -> canvas rơi về chế độ viết tự do.
      strokeOrderData: null,
      options: [],
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
      <AlphabetPracticeScreen />
    </SafeAreaProvider>,
  );
}

async function drawStroke(canvas: any) {
  await fireEvent(canvas, "touchStart", {
    nativeEvent: { locationX: 20, locationY: 20 },
  });
  await fireEvent(canvas, "touchEnd", {
    nativeEvent: { locationX: 50, locationY: 50 },
  });
}

describe("AlphabetPracticeScreen", () => {
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
        borderSubtle: "#F3F4F6",
      },
    });
    mockedUseGamification.mockReturnValue({ addExp });
    mockedUseAudio.mockReturnValue({
      isPlaying: false,
      play: jest.fn(),
      stop: jest.fn(),
    });
    mockedApi.startPractice.mockResolvedValue(START_RESPONSE);
    // Shape LẤY TỪ API THẬT: BE trả `promoted` (không phải `isPromoted` như tài
    // liệu) và `newRankName` có giá trị ngay cả khi không thăng hạng.
    mockedApi.submitPractice.mockResolvedValue({
      expEarned: 5,
      promoted: false,
      newRankName: "BRONZE",
      message: "Tuyệt vời! Bạn đã hoàn thành bài luyện tập.",
      currentExp: 135,
    });
  });

  it("requeues a wrong answer and submits the FIRST attempt of every character", async () => {
    const { findByText, getByText, getByTestId } = await renderScreen();

    // Câu 1: trắc nghiệm - trả lời SAI.
    expect(await findByText("Nghe và chọn chữ cái đúng")).toBeTruthy();
    fireEvent.press(getByText("い"));
    fireEvent.press(await findByText("Kiểm tra"));
    expect(
      await findByText("Chưa đúng — chữ này sẽ quay lại ở cuối bài."),
    ).toBeTruthy();
    fireEvent.press(getByText("Tiếp tục"));

    // Câu 2: tập viết (không có strokeOrderData -> viết tự do).
    expect(await findByText("Viết chữ: o")).toBeTruthy();
    expect(
      await findByText("Viết tự do theo chữ mẫu mờ bên dưới."),
    ).toBeTruthy();
    await drawStroke(getByTestId("stroke-order-canvas"));
    fireEvent.press(getByText("Tôi đã viết xong"));
    expect(await findByText("Chính xác!")).toBeTruthy();
    fireEvent.press(getByText("Tiếp tục"));

    // Câu 1 quay lại cuối hàng đợi vì đã trả lời sai.
    expect(await findByText("Nghe và chọn chữ cái đúng")).toBeTruthy();
    expect(mockedApi.submitPractice).not.toHaveBeenCalled();

    fireEvent.press(getByText("あ"));
    fireEvent.press(await findByText("Kiểm tra"));
    expect(await findByText("Chính xác!")).toBeTruthy();
    fireEvent.press(getByText("Tiếp tục"));

    // Lần làm lại đúng chỉ để qua bài; kết quả gửi lên vẫn là lần đầu (sai).
    await waitFor(() =>
      expect(mockedApi.submitPractice).toHaveBeenCalledWith({
        results: [
          { characterId: 1, isCorrect: false },
          { characterId: 5, isCorrect: true },
        ],
      }),
    );

    expect(
      await findByText("Tuyệt vời! Bạn đã hoàn thành bài luyện tập."),
    ).toBeTruthy();
    expect(getByText("+5 EXP")).toBeTruthy();
    expect(addExp).toHaveBeenCalledWith(5);
  });

  it("shows an empty state when the backend has nothing to review", async () => {
    mockedApi.startPractice.mockResolvedValueOnce({
      practiceSessionId: "prac-0",
      questions: [],
    });

    const { findByText, getByText } = await renderScreen();

    expect(await findByText("Không có chữ nào cần ôn lúc này")).toBeTruthy();

    fireEvent.press(getByText("Về bảng chữ cái"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("surfaces a retry action when loading the practice fails", async () => {
    mockedApi.startPractice.mockRejectedValueOnce(new Error("Mất kết nối"));

    const { findByText, getByText } = await renderScreen();

    expect(await findByText("Mất kết nối")).toBeTruthy();

    fireEvent.press(getByText("Thử lại"));
    expect(await findByText("Nghe và chọn chữ cái đúng")).toBeTruthy();
  });

  it("shows the rank-up banner only when the backend flags a promotion", async () => {
    mockedApi.submitPractice.mockResolvedValue({
      expEarned: 5,
      promoted: true,
      newRankName: "SILVER",
      message: "Chúc mừng!",
      currentExp: 500,
    });

    const { findByText, getByText, getByTestId } = await renderScreen();

    await findByText("Nghe và chọn chữ cái đúng");
    fireEvent.press(getByText("あ"));
    fireEvent.press(await findByText("Kiểm tra"));
    fireEvent.press(await findByText("Tiếp tục"));

    await findByText("Viết chữ: o");
    await drawStroke(getByTestId("stroke-order-canvas"));
    fireEvent.press(getByText("Tôi đã viết xong"));
    fireEvent.press(await findByText("Tiếp tục"));

    expect(await findByText("Thăng hạng: SILVER!")).toBeTruthy();
  });
});
