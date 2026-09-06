import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { KanaQuestionCard } from "../kana-question";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";
import type { KanaQuestion } from "@/types/quiz";

jest.mock("@/hooks/use-audio", () => ({ useAudio: jest.fn() }));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const playMock = jest.fn();
const mockedUseAudio = useAudio as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

describe("KanaQuestionCard — Tương tác ghép thẻ & xử lý thẻ ma (distractors)", () => {
  const sampleQuestion: KanaQuestion = {
    id: "q-arrange-1",
    type: "kana",
    instruction: "Nghe và sắp xếp thành câu",
    prompt: "Tôi là học sinh.",
    promptLang: "vi",
    characters: ["です", "がくせい", "は", "わたし", "いぬ", "ねこ"], // Có 4 thẻ đúng + 2 thẻ ma
    correctOrder: ["わたし", "は", "がくせい", "です"],
    blockRomaji: {
      わたし: "watashi",
      は: "wa",
      がくせい: "gakusei",
      です: "desu",
      いぬ: "inu",
      ねこ: "neko",
    },
    audioUrl: "/uploads/audios/sentences/watashi-wa-gakusei-desu.mp3",
    imageUrl: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAudio.mockReturnValue({
      isPlaying: false,
      play: playMock,
      stop: jest.fn(),
    });
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        cardQuiz: "#FFFFFF",
        cardQuizBorder: "#E5E7EB",
        borderSubtle: "#F3F4F6",
        backgroundElement: "#F9FAFB",
        text: "#1F2937",
        textSecondary: "#6B7280",
      },
    });
  });

  it("hiển thị tất cả các thẻ trong ngân hàng (bao gồm cả thẻ ma) kèm romaji", async () => {
    const { getByText } = await render(
      <KanaQuestionCard question={sampleQuestion} onAnswerChange={jest.fn()} />,
    );

    // Kiểm tra tất cả các thẻ xuất hiện
    expect(getByText("わたし")).toBeTruthy();
    expect(getByText("watashi")).toBeTruthy();
    expect(getByText("がくせい")).toBeTruthy();
    expect(getByText("gakusei")).toBeTruthy();
    expect(getByText("いぬ")).toBeTruthy();
    expect(getByText("inu")).toBeTruthy();
    expect(getByText("ねこ")).toBeTruthy();
    expect(getByText("neko")).toBeTruthy();
  });

  it("chọn đúng thứ tự các thẻ chính xác -> onAnswerChange(true)", async () => {
    const onAnswerChange = jest.fn();
    const { getByText } = await render(
      <KanaQuestionCard
        question={sampleQuestion}
        onAnswerChange={onAnswerChange}
      />,
    );

    // Người học chạm lần lượt: わたし -> は -> がくせい -> です
    await fireEvent.press(getByText("わたし"));
    expect(onAnswerChange).toHaveBeenLastCalledWith(false, "わたし");

    await fireEvent.press(getByText("は"));
    expect(onAnswerChange).toHaveBeenLastCalledWith(false, "わたしは");

    await fireEvent.press(getByText("がくせい"));
    expect(onAnswerChange).toHaveBeenLastCalledWith(false, "わたしはがくせい");

    await fireEvent.press(getByText("です"));
    // Đã chọn đủ và đúng 4 thẻ (các thẻ ma 'いぬ', 'ねこ' vẫn còn trong bank)
    expect(onAnswerChange).toHaveBeenLastCalledWith(
      true,
      "わたしはがくせいです",
    );
  });

  it("chọn nhầm thẻ ma -> onAnswerChange(false)", async () => {
    const onAnswerChange = jest.fn();
    const { getByText } = await render(
      <KanaQuestionCard
        question={sampleQuestion}
        onAnswerChange={onAnswerChange}
      />,
    );

    // Người học chạm nhầm: わたし -> いぬ
    await fireEvent.press(getByText("わたし"));
    await fireEvent.press(getByText("いぬ"));

    expect(onAnswerChange).toHaveBeenLastCalledWith(false, "わたしいぬ");
  });

  it("gỡ thẻ khỏi drop zone đưa thẻ quay lại bank và re-validate", async () => {
    const onAnswerChange = jest.fn();
    const { getByText, getAllByText } = await render(
      <KanaQuestionCard
        question={sampleQuestion}
        onAnswerChange={onAnswerChange}
      />,
    );

    // Chạm: わたし -> いぬ (nhầm)
    await fireEvent.press(getByText("わたし"));
    await fireEvent.press(getByText("いぬ"));

    // Bấm vào thẻ "いぬ" trong drop zone để gỡ bỏ
    const inuTiles = getAllByText("いぬ");
    await fireEvent.press(inuTiles[0]);

    // Giờ chỉ còn "わたし" trong arranged
    expect(onAnswerChange).toHaveBeenLastCalledWith(false, "わたし");

    // Tiếp tục chọn đúng: は -> がくせい -> です
    await fireEvent.press(getByText("は"));
    await fireEvent.press(getByText("がくせい"));
    await fireEvent.press(getByText("です"));

    expect(onAnswerChange).toHaveBeenLastCalledWith(
      true,
      "わたしはがくせいです",
    );
  });
});
