/**
 * Khoá lại quyền tra nghĩa CHỮ TRONG ĐÁP ÁN.
 *
 * Bug thật: 「また明日」 xuất hiện 8 lần dưới dạng ĐÁP ÁN trong dữ liệu thật (chỉ 1
 * lần làm đề bài), mà vùng đáp án bị `GlossaryLockdown` khoá vĩnh viễn — cả 3 thẻ
 * câu hỏi đều viết `<GlossaryLockdown>` không truyền `active`. Cộng thêm lớp
 * `pointerEvents="none"` sau khi nộp ở màn bài học, người học KHÔNG BAO GIỜ tra
 * được nghĩa những từ chỉ nằm ở đáp án.
 *
 * Hợp đồng đúng (chính tài liệu của `glossary-context` đã ghi): khoá TRƯỚC khi
 * chốt đáp án (tra được nghĩa đáp án là biết luôn đáp án), MỞ sau khi chốt — lúc
 * đó tra nghĩa mới đúng là thứ giúp người học hiểu vì sao mình sai.
 */

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { ListeningQuestionCard } from "../listening-question";
import { VocabQuestionCard } from "../vocab-question";
import { useAudio } from "@/hooks/use-audio";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary } from "@/contexts/glossary-context";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import type { StartLessonQuestion } from "@/types/api";
import type { ListeningQuestion, VocabQuestion } from "@/types/quiz";

jest.mock("@/hooks/use-audio", () => ({ useAudio: jest.fn() }));
jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
// Chỉ thay `useGlossary` để nạp từ điển giả — `GlossaryLockdown` phải là hàng
// THẬT, vì chính nó là thứ đang được kiểm tra.
jest.mock("@/contexts/glossary-context", () => ({
  ...jest.requireActual("@/contexts/glossary-context"),
  useGlossary: jest.fn(),
}));

const mockedUseAudio = useAudio as jest.Mock;
const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGlossary = useGlossary as jest.Mock;

const MATA_ASHITA = "また明日";
const MATA_ASHITA_MEANING = "Hẹn gặp lại vào ngày mai";
// Nghĩa trong TỪ ĐIỂN phải khác chuỗi đề bài: câu TRANSLATE_TO_JP in sẵn nghĩa
// tiếng Việt ra làm đề, nên nếu dùng chung một chuỗi thì test sẽ xanh giả — tìm
// thấy đề bài mà tưởng là tìm thấy tooltip.
const DICT_MEANING = "Hẹn gặp lại ngày mai [nghĩa tra từ điển]";

/**
 * Trong `JapaneseText`, chữ tra được nghĩa là node `Text` CÓ `onPress`; chữ thường
 * thì không. Thẻ `Text` bọc ngoài cũng khớp cùng nội dung, nên phải lọc theo
 * `onPress` mới chọn đúng thứ đang được kiểm tra.
 */
function findTappableWord<T extends { props: { onPress?: unknown } }>(
  nodes: T[],
): T | undefined {
  return nodes.find((n) => typeof n.props.onPress === "function");
}

/** Lấy đúng hình dạng câu 1982 trong `nihongo_db`: đề tiếng Việt, đáp án chữ Nhật. */
const API_QUESTIONS: StartLessonQuestion[] = [
  {
    questionId: 1982,
    questionType: "TRANSLATE_TO_JP",
    content: "「Hẹn gặp lại vào ngày mai」 tiếng Nhật nói thế nào?",
    metadataJson: { vn: MATA_ASHITA_MEANING, kana: MATA_ASHITA },
    options: [
      { optionId: 7691, content: MATA_ASHITA, isCorrect: true },
      { optionId: 7692, content: "おはようございます", isCorrect: false },
    ],
  },
  {
    questionId: 2157,
    questionType: "LISTEN_AND_SELECT",
    content: "Nghe và chọn từ tiếng Nhật đúng",
    audioUrl: "/uploads/audios/words/mata-ashita.mp3",
    metadataJson: { romaji: "mata ashita", vn: MATA_ASHITA_MEANING },
    options: [
      { optionId: 8385, content: MATA_ASHITA, isCorrect: true },
      { optionId: 8386, content: "こんばんは", isCorrect: false },
    ],
  },
];

const [vocabQ, listeningQ] = mapApiQuestionsToQuizQuestions(API_QUESTIONS);

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAudio.mockReturnValue({
    isPlaying: false,
    play: jest.fn(),
    stop: jest.fn(),
  });
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      card: "#FFFFFF",
      border: "#E5E7EB",
      borderSubtle: "#F3F4F6",
      backgroundElement: "#F9FAFB",
      text: "#1F2937",
      textSecondary: "#6B7280",
    },
  });
  mockedUseGlossary.mockReturnValue({
    glossary: {
      [MATA_ASHITA]: { r: "mata ashita", v: DICT_MEANING },
      おはようございます: { r: "ohayou gozaimasu", v: "Chào buổi sáng" },
    },
    loading: false,
    refresh: jest.fn(),
  });
});

describe("Tra nghĩa chữ trong đáp án", () => {
  it("CHƯA chốt đáp án: chữ trong đáp án KHÔNG tra được, chạm là chọn đáp án", async () => {
    const onSelectAnswer = jest.fn();
    const { getAllByText, queryByText } = await render(
      <VocabQuestionCard
        question={vocabQ as VocabQuestion}
        selectedAnswer={null}
        hasSubmitted={false}
        onSelectAnswer={onSelectAnswer}
      />,
    );

    const nodes = getAllByText(MATA_ASHITA);
    // Chưa chốt thì không có chữ nào bấm tra được — nếu có là lộ đáp án.
    expect(findTappableWord(nodes)).toBeUndefined();

    fireEvent.press(nodes[0]);

    // Chạm rơi xuống thẻ đáp án bên ngoài -> chọn đáp án như bình thường.
    expect(onSelectAnswer).toHaveBeenCalledTimes(1);
    expect(queryByText(DICT_MEANING)).toBeNull();
  });

  it("ĐÃ chốt đáp án: chạm vào chữ hiện nghĩa, và KHÔNG đổi được đáp án", async () => {
    const onSelectAnswer = jest.fn();
    const { getAllByText, queryAllByText } = await render(
      <VocabQuestionCard
        question={vocabQ as VocabQuestion}
        selectedAnswer="0"
        hasSubmitted
        onSelectAnswer={onSelectAnswer}
      />,
    );

    const word = findTappableWord(getAllByText(MATA_ASHITA));
    expect(word).toBeDefined();

    await fireEvent.press(word!);

    // Nghĩa hiện ra trong tooltip — đúng lúc người học cần hiểu vì sao mình sai.
    expect(queryAllByText(DICT_MEANING).length).toBeGreaterThan(0);
    // Nhưng bài đã chốt thì không được sửa đáp án nữa.
    expect(onSelectAnswer).not.toHaveBeenCalled();
  });

  it("câu nghe-chọn cũng mở tra nghĩa sau khi chốt", async () => {
    const onSelectAnswer = jest.fn();
    const { getAllByText, queryAllByText } = await render(
      <ListeningQuestionCard
        question={listeningQ as ListeningQuestion}
        selectedAnswer="0"
        hasSubmitted
        onSelectAnswer={onSelectAnswer}
      />,
    );

    const word = findTappableWord(getAllByText(MATA_ASHITA));
    expect(word).toBeDefined();

    await fireEvent.press(word!);

    expect(queryAllByText(DICT_MEANING).length).toBeGreaterThan(0);
    expect(onSelectAnswer).not.toHaveBeenCalled();
  });

  it("câu nghe-chọn CHƯA chốt thì vẫn khoá kín", async () => {
    const onSelectAnswer = jest.fn();
    const { getAllByText, queryByText } = await render(
      <ListeningQuestionCard
        question={listeningQ as ListeningQuestion}
        selectedAnswer={null}
        hasSubmitted={false}
        onSelectAnswer={onSelectAnswer}
      />,
    );

    const nodes = getAllByText(MATA_ASHITA);
    expect(findTappableWord(nodes)).toBeUndefined();

    fireEvent.press(nodes[0]);

    expect(onSelectAnswer).toHaveBeenCalledTimes(1);
    expect(queryByText(DICT_MEANING)).toBeNull();
  });
});
