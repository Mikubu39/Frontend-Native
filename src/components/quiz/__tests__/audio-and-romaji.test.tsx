/**
 * Khoá lại 3 hành vi mà bộ dữ liệu demo cũ làm sai, người dùng nhìn thấy ngay:
 *
 *  1. Nút loa mọc ra ở cả những câu không có gì để nghe, bấm vào không kêu.
 *     Nguyên nhân: `vocab-question` vẽ `<AudioButton onPress={() => {}} />` vô
 *     điều kiện — dính toàn bộ câu dịch, tức hơn một nửa số câu trong mỗi bài.
 *  2. Đáp án tiếng Nhật là kana trần, người học chưa biết chữ nào không đọc nổi.
 *  3. Câu luyện nói có sẵn file người bản xứ đọc nhưng không có nút để nghe.
 *
 * Test đi từ payload API thật qua `mapApiQuestionsToQuizQuestions` rồi mới render,
 * nên nó bảo vệ cả tầng mapper lẫn tầng component — sửa lệch một trong hai là đỏ.
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { KanaQuestionCard } from "../kana-question";
import { ListeningQuestionCard } from "../listening-question";
import { SpeakingQuestionCard } from "../speaking-question";
import { VocabQuestionCard } from "../vocab-question";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import type { StartLessonQuestion } from "@/types/api";
import type {
  KanaQuestion,
  ListeningQuestion,
  SpeakingQuestion,
  VocabQuestion,
} from "@/types/quiz";

jest.mock("@/hooks/use-audio", () => ({ useAudio: jest.fn() }));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const play = jest.fn();
const mockedUseAudio = useAudio as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;

/** Nhãn trợ năng của `AudioButton` khi ở trạng thái chưa phát. */
const SPEAKER = "Phát âm thanh mẫu";

/** Bốn câu lấy đúng từ bài 1 chủ đề "Chào hỏi hằng ngày" của bộ dữ liệu demo. */
const API_QUESTIONS: StartLessonQuestion[] = [
  {
    questionId: 1,
    questionType: "TRANSLATE_TO_VN",
    content: "「おはようございます」 (ohayou gozaimasu) nghĩa là gì?",
    metadataJson: {
      kana: "おはようございます",
      romaji: "ohayou gozaimasu",
      glossary: {
        おはようございます: {
          r: "ohayou gozaimasu",
          v: "chào buổi sáng (lịch sự)",
        },
      },
    },
    options: [
      { optionId: 1, content: "chào buổi tối", isCorrect: false },
      { optionId: 2, content: "chào buổi sáng (lịch sự)", isCorrect: true },
    ],
  },
  {
    questionId: 2,
    questionType: "LISTEN_AND_SELECT",
    content: "Nghe và chọn từ tiếng Nhật đúng",
    audioUrl: "/uploads/audios/words/ohayou-gozaimasu.mp3",
    metadataJson: {
      romaji: "ohayou gozaimasu",
      vn: "chào buổi sáng (lịch sự)",
    },
    options: [
      {
        optionId: 3,
        content: "こんばんは",
        isCorrect: false,
        metadataJson: { romaji: "konbanwa" },
      },
      {
        optionId: 4,
        content: "おはようございます",
        isCorrect: true,
        metadataJson: { romaji: "ohayou gozaimasu" },
      },
    ],
  },
  {
    questionId: 3,
    questionType: "LISTEN_AND_ARRANGE",
    content:
      "Nghe và sắp xếp thành câu hoàn chỉnh: Chào buổi sáng ạ, thưa thầy.",
    audioUrl: "/uploads/audios/sentences/sensei-ohayou-gozaimasu.mp3",
    metadataJson: { jp: "せんせい、おはようございます。" },
    options: [
      {
        optionId: 5,
        content: "せんせい",
        isCorrect: true,
        order: 1,
        metadataJson: { romaji: "sensei" },
      },
      {
        optionId: 6,
        content: "おはよう",
        isCorrect: true,
        order: 2,
        metadataJson: { romaji: "ohayou" },
      },
    ],
  },
  {
    questionId: 4,
    questionType: "SPEAKING",
    content: "Nhấn vào micro và đọc to câu sau: せんせい、おはようございます。",
    audioUrl: "/uploads/audios/sentences/sensei-ohayou-gozaimasu.mp3",
    metadataJson: {
      jp: "せんせい、おはようございます。",
      romaji: "Sensei, ohayou gozaimasu.",
      vn: "Chào buổi sáng ạ, thưa thầy.",
      glossary: { せんせい: { r: "sensei", v: "giáo viên" } },
    },
    options: [
      {
        optionId: 7,
        content: "せんせい、おはようございます。",
        isCorrect: true,
        audioUrl: "/uploads/audios/sentences/sensei-ohayou-gozaimasu.mp3",
        metadataJson: { romaji: "Sensei, ohayou gozaimasu." },
      },
    ],
  },
];

const [vocabQ, listeningQ, arrangeQ, speakingQ] =
  mapApiQuestionsToQuizQuestions(API_QUESTIONS);

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAudio.mockReturnValue({ isPlaying: false, play, stop: jest.fn() });
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      card: "#FFFFFF",
      border: "#E5E7EB",
      borderSubtle: "#F3F4F6",
      backgroundElement: "#F9FAFB",
    },
  });
});

describe("Nút loa chỉ xuất hiện khi âm thanh là đề bài", () => {
  it("câu dịch không có audio thì KHÔNG vẽ nút loa", async () => {
    const { queryByLabelText } = await render(
      <VocabQuestionCard
        question={vocabQ as VocabQuestion}
        selectedAnswer={null}
        onSelectAnswer={jest.fn()}
      />,
    );

    expect(queryByLabelText(SPEAKER)).toBeNull();
  });

  it("câu nghe-chọn có nút loa, bấm vào là phát thật", async () => {
    const { getByLabelText } = await render(
      <ListeningQuestionCard
        question={listeningQ as ListeningQuestion}
        selectedAnswer={null}
        onSelectAnswer={jest.fn()}
      />,
    );

    fireEvent.press(getByLabelText(SPEAKER));
    expect(play).toHaveBeenCalled();
  });

  it("câu luyện nói có nút nghe câu mẫu", async () => {
    const { getByLabelText, getByText } = await render(
      <SpeakingQuestionCard
        question={speakingQ as SpeakingQuestion}
        onAnswerChange={jest.fn()}
      />,
    );

    expect(getByText("Nghe câu mẫu")).toBeTruthy();
    fireEvent.press(getByLabelText(SPEAKER));
    expect(play).toHaveBeenCalled();
  });
});

describe("Chữ tiếng Nhật luôn kèm phiên âm", () => {
  it("đáp án kana của câu nghe hiện romaji bên dưới", async () => {
    const { getByText } = await render(
      <ListeningQuestionCard
        question={listeningQ as ListeningQuestion}
        selectedAnswer={null}
        onSelectAnswer={jest.fn()}
      />,
    );

    expect(getByText("おはようございます")).toBeTruthy();
    expect(getByText("ohayou gozaimasu")).toBeTruthy();
    expect(getByText("konbanwa")).toBeTruthy();
  });

  it("thẻ rời của câu sắp xếp hiện romaji", async () => {
    const kana = arrangeQ as KanaQuestion;
    expect(kana.blockRomaji).toEqual({
      せんせい: "sensei",
      おはよう: "ohayou",
    });

    const { getByText } = await render(
      <KanaQuestionCard question={kana} onAnswerChange={jest.fn()} />,
    );

    expect(getByText("sensei")).toBeTruthy();
    expect(getByText("ohayou")).toBeTruthy();
  });

  it("câu luyện nói hiện romaji của cả câu", async () => {
    const { getByText } = await render(
      <SpeakingQuestionCard
        question={speakingQ as SpeakingQuestion}
        onAnswerChange={jest.fn()}
      />,
    );

    expect(getByText("Sensei, ohayou gozaimasu.")).toBeTruthy();
  });
});

describe("Chạm giữ vào chữ Nhật để tra nghĩa", () => {
  it("mở được nghĩa và cách đọc của từ trong đề bài", async () => {
    const { findAllByText, findByText, getAllByText, getByText } = await render(
      <VocabQuestionCard
        question={vocabQ as VocabQuestion}
        selectedAnswer={null}
        onSelectAnswer={jest.fn()}
      />,
    );

    // Trước khi chạm: chỉ có đúng 1 chỗ mang nghĩa này, là thẻ đáp án.
    expect(getAllByText("chào buổi sáng (lịch sự)")).toHaveLength(1);

    fireEvent(getByText("おはようございます"), "longPress");

    // Sau khi chạm giữ: ô tra từ hiện thêm mặt chữ, cách đọc và nghĩa.
    expect(await findByText("ohayou gozaimasu")).toBeTruthy();
    expect(await findAllByText("chào buổi sáng (lịch sự)")).toHaveLength(2);
  });

  it("câu không có từ điển thì không có gì chạm được", async () => {
    expect((listeningQ as ListeningQuestion).glossary).toBeUndefined();
  });
});
