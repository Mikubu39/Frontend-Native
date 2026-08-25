/**
 * Tách YÊU CẦU khỏi ĐỀ BÀI, và không được lộ đáp án khi tách.
 *
 * Bản trước đọc `question_text` rồi cắt chuỗi theo dấu hai chấm để moi phần chữ
 * Nhật. Dữ liệu thật trong `nihongo_db` gần như không có dấu hai chấm — mẫu phổ
 * biến nhất là `「こんにちは」 (konnichiwa) nghĩa là gì?` — nên NGUYÊN CẢ CÂU TIẾNG
 * VIỆT nhảy vào bong bóng thoại của linh vật.
 *
 * Backend đã tách sẵn trong `metadata_json`: `kana` cho câu mức TỪ, `jp` cho câu
 * mức CÂU, `vn` cho nghĩa. Nhưng KHÔNG được in bừa trường nào cũng được: ở câu
 * hỏi chiều ngược (`TRANSLATE_TO_JP`) và câu xếp thẻ (`LISTEN_AND_ARRANGE`),
 * chính `kana`/`jp` mới là ĐÁP ÁN. In ra là phát đáp án cho người học — đây là
 * thứ test này canh chặt nhất.
 */

import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import type { StartLessonQuestion } from "@/types/api";

/** Dựng một câu hỏi API tối thiểu, hình dạng lấy đúng từ DB thật. */
function apiQuestion(
  over: Partial<StartLessonQuestion> &
    Pick<StartLessonQuestion, "questionType">,
): StartLessonQuestion {
  return {
    questionId: 1,
    content: "",
    options: [],
    ...over,
  } as StartLessonQuestion;
}

describe("quiz-mapper — tách yêu cầu khỏi đề bài", () => {
  it("câu hỏi nghĩa: bong bóng chỉ còn chữ Nhật, yêu cầu tách ra riêng", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_VN",
        content: "「こんにちは」 (konnichiwa) nghĩa là gì?",
        metadataJson: {
          vn: "xin chào (ban ngày)",
          kana: "こんにちは",
          romaji: "konnichiwa",
        },
      }),
    ]);

    expect(q.prompt).toBe("こんにちは");
    expect(q.promptLang).toBe("ja");
    expect(q.promptRomaji).toBe("konnichiwa");
    expect(q.instruction).toBe("Từ này nghĩa là gì?");
    // Không còn mẩu tiếng Việt nào lẫn vào đề bài.
    expect(q.prompt).not.toContain("nghĩa là gì");
  });

  it("câu dài dùng `jp` và đổi yêu cầu thành 'Câu này...'", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_VN",
        content: "Câu 「せんせい、おはようございます。」 có nghĩa là gì?",
        metadataJson: {
          jp: "せんせい、おはようございます。",
          vn: "Chào buổi sáng ạ, thưa thầy.",
          romaji: "Sensei, ohayou gozaimasu.",
        },
      }),
    ]);

    expect(q.prompt).toBe("せんせい、おはようございます。");
    expect(q.instruction).toBe("Câu này nghĩa là gì?");
  });

  it("KHÔNG lộ đáp án ở câu hỏi chiều ngược (dịch sang tiếng Nhật)", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_JP",
        content: "「người kia」 tiếng Nhật nói thế nào?",
        metadataJson: { vn: "người kia", kana: "あのひと", romaji: "ano hito" },
      }),
    ]);

    // Đề là tiếng Việt; `kana` là đáp án nên tuyệt đối không được in ra.
    expect(q.prompt).toBe("người kia");
    expect(q.promptLang).toBe("vi");
    expect(q.prompt).not.toBe("あのひと");
    expect(q.promptRomaji).toBeUndefined();
    expect(q.instruction).toBe("Nói thế nào bằng tiếng Nhật?");
  });

  it("KHÔNG lộ đáp án ở câu nghe rồi xếp thẻ", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "LISTEN_AND_ARRANGE",
        content: "Nghe và sắp xếp thành câu hoàn chỉnh: Xin chào mọi người.",
        metadataJson: {
          jp: "みなさん、こんにちは。",
          vn: "Xin chào mọi người.",
          romaji: "Minasan, konnichiwa.",
        },
        options: [
          { optionId: 1, content: "みなさん", isCorrect: true, order: 1 },
          { optionId: 2, content: "こんにちは", isCorrect: true, order: 2 },
        ],
      } as Partial<StartLessonQuestion> & { questionType: string }),
    ]);

    // Câu tiếng Nhật hoàn chỉnh chính là thứ người học phải tự xếp ra.
    expect(q.prompt).toBe("Xin chào mọi người.");
    expect(q.promptLang).toBe("vi");
    expect(q.prompt).not.toContain("みなさん、こんにちは。");
  });

  it("câu chỉ có âm thanh thì không in đề bài ra chữ", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "LISTEN_AND_SELECT",
        content: "Nghe và chọn từ tiếng Nhật đúng",
        metadataJson: { vn: "chào buổi tối", romaji: "konbanwa" },
        audioUrl: "/uploads/audios/words/konbanwa.mp3",
      }),
    ]);

    // In chữ ra là mất luôn chỗ để nghe — đề bài nằm ở file âm thanh.
    expect(q.prompt).toBeUndefined();
    expect(q.instruction).toBe("Nghe và chọn đáp án đúng");
  });

  it("dữ liệu cũ chưa có kana/jp thì bóc phần trong ngoặc 「」", () => {
    const [q] = mapApiQuestionsToQuizQuestions([
      apiQuestion({
        questionType: "TRANSLATE_TO_VN",
        content: "Chữ 「あ」 đọc là gì?",
        metadataJson: { romaji: "a" },
      }),
    ]);

    // Không có dấu hai chấm — đây đúng là trường hợp bản cũ trả về nguyên câu.
    expect(q.prompt).toBe("あ");
    expect(q.instruction).toBe("Từ này nghĩa là gì?");
  });
});
