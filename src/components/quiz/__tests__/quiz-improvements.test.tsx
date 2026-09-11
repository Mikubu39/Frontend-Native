/**
 * Test bộ 4 cải tiến:
 * 1. Debounce và ngắt âm cũ khi chọn đáp án liên tục trong Picture & Vocab questions
 * 2. Tra từ điển toàn cục trong DualText (câu SELECT_IMAGE ohayo có thể bấm tra nghĩa)
 * 3. DualText tuân thủ disableGlossary
 */

import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PictureQuestionCard } from "../picture-question";
import { DualText } from "@/components/ui/dual-text";
import { useAudio } from "@/hooks/use-audio";
import { useJapaneseSpeech } from "@/hooks/use-japanese-speech";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary } from "@/contexts/glossary-context";
import type { PictureQuestion } from "@/types";

jest.mock("@/hooks/use-audio", () => ({ useAudio: jest.fn() }));
jest.mock("@/hooks/use-japanese-speech", () => ({ useJapaneseSpeech: jest.fn() }));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/contexts/glossary-context", () => ({
  useGlossary: jest.fn(),
  useGlossaryLockdown: jest.fn(() => false),
}));

const mockedUseAudio = useAudio as jest.Mock;
const mockedUseJapaneseSpeech = useJapaneseSpeech as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGlossary = useGlossary as jest.Mock;

const mockPlay = jest.fn();
const mockStopAudio = jest.fn();
const mockSpeak = jest.fn();
const mockStopSpeech = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  mockedUseTheme.mockReturnValue({
    colors: {
      cardQuiz: "#ffffff",
      cardQuizBorder: "#e5e7eb",
      backgroundElement: "#f3f4f6",
      text: "#111827",
      textSecondary: "#6b7280",
      border: "#e5e7eb",
    },
    isDark: false,
  });

  mockedUseAudio.mockReturnValue({
    isPlaying: false,
    play: mockPlay,
    stop: mockStopAudio,
  });

  mockedUseJapaneseSpeech.mockReturnValue({
    isSpeaking: false,
    speakingText: null,
    speak: mockSpeak,
    stop: mockStopSpeech,
  });

  mockedUseGlossary.mockReturnValue({
    glossary: {
      "おはよう": { r: "ohayou", v: "Chào buổi sáng" },
      "さようなら": { r: "sayounara", v: "Tạm biệt" },
    },
    loading: false,
    refresh: jest.fn(),
  });
});

describe("1. DualText tra từ điển toàn cục", () => {
  it("Từ trong kho từ điển toàn cục được hiển thị qua JapaneseText khi không truyền glossary", async () => {
    const { getByText } = await render(
      <DualText text="おはよう" hint="ohayou" />
    );

    const word = getByText("おはよう");
    expect(word).toBeTruthy();
    await fireEvent.press(word);
    expect(getByText("Chào buổi sáng")).toBeTruthy();
  });

  it("Khi disableGlossary = true, hiển thị dạng text thuần không tra từ", async () => {
    const { getByText } = await render(
      <DualText disableGlossary text="おはよう" hint="ohayou" />
    );

    expect(getByText("おはよう")).toBeTruthy();
  });
});

describe("2. Debounce và ngắt âm khi chọn đáp án liên tục", () => {
  const pictureQuestion: PictureQuestion = {
    id: "pic-1",
    type: "picture",
    instruction: "Chọn hình đúng với từ này",
    prompt: "おはよう",
    promptLang: "ja",
    word: "おはよう",
    romaji: "ohayou",
    images: [
      { id: "opt-1", text: "おはよう", imageUrl: "/img/ohayo.png", isCorrect: true },
      { id: "opt-2", text: "さようなら", imageUrl: "/img/bye.png", isCorrect: false },
    ],
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("Bấm đổi đáp án nhanh liên tục sẽ ngắt âm cũ và debounce phát âm mới", async () => {
    const onSelect = jest.fn();
    const { getByTestId, getByText } = await render(
      <PictureQuestionCard
        question={pictureQuestion}
        selectedAnswerId={null}
        onSelectAnswer={onSelect}
      />
    );

    expect(getByText("おはよう")).toBeTruthy();

    const opt1 = getByTestId("picture-option-opt-1");
    const opt2 = getByTestId("picture-option-opt-2");

    fireEvent.press(opt1);
    expect(mockStopAudio).toHaveBeenCalledTimes(1);
    expect(mockStopSpeech).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(50);
    });

    fireEvent.press(opt2);
    expect(mockStopAudio).toHaveBeenCalledTimes(2);
    expect(mockStopSpeech).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockSpeak).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(60);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith("さようなら");
  });
});
