/**
 * Kiểm thử ánh xạ âm thanh trong quiz-mapper và xử lý audio.
 */

import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import type { StartLessonQuestion } from "@/types/api";
import type { PictureQuestion, VocabQuestion } from "@/types/quiz";

function apiQuestion(
  over: Partial<StartLessonQuestion> &
    Pick<StartLessonQuestion, "questionType">,
): StartLessonQuestion {
  return {
    questionId: 100,
    content: "",
    options: [],
    ...over,
  } as StartLessonQuestion;
}

describe("quiz-mapper — Ánh xạ âm thanh (audioUrl & teachAudio)", () => {
  it("SELECT_IMAGE: ưu tiên audioUrl, fallback sang teachAudio", () => {
    // 1. Khi có audioUrl trực tiếp
    const q1 = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "SELECT_IMAGE",
        audioUrl: "/uploads/audios/words/mizu.mp3",
        metadataJson: {
          teachAudio: "/uploads/audios/words/mizu-teach.mp3",
        },
      }),
    ])[0] as PictureQuestion;
    expect(q1.audioUrl).toContain("/uploads/audios/words/mizu.mp3");

    // 2. Khi audioUrl bị null nhưng có teachAudio
    const q2 = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "SELECT_IMAGE",
        audioUrl: undefined,
        metadataJson: {
          teachAudio: "/uploads/audios/words/ocha.mp3",
        },
      }),
    ])[0] as PictureQuestion;
    expect(q2.audioUrl).toContain("/uploads/audios/words/ocha.mp3");
  });

  it("TRANSLATE_TO_VN: fallback sang teachAudio khi audioUrl bị null", () => {
    const q = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_VN",
        audioUrl: undefined,
        metadataJson: {
          kana: "一",
          romaji: "ichi",
          teachAudio: "/uploads/audios/words/ichi.mp3",
        },
      }),
    ])[0] as VocabQuestion;
    expect(q.audioUrl).toContain("/uploads/audios/words/ichi.mp3");
  });

  it("TRANSLATE_TO_JP: không gán teachAudio cho đề bài tiếng Việt", () => {
    const q = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_JP",
        audioUrl: undefined,
        metadataJson: {
          vn: "số 1",
          teachAudio: "/uploads/audios/words/ichi.mp3",
        },
      }),
    ])[0] as VocabQuestion;
    // Đề bài tiếng Việt không được có audioUrl phát âm chữ Nhật của đáp án
    expect(q.audioUrl).toBeUndefined();
  });
});
