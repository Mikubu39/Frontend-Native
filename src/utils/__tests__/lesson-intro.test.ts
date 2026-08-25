import { buildTeachCards } from "../lesson-intro";
import type { StartLessonQuestion } from "@/types/api";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

/**
 * Đề bài dưới đây sao chép nguyên dạng dữ liệu thật của bài 1 (Hiragana —
 * nguyên âm) trong `test-data/demo-seed/out/seed.sql`, kể cả việc metadata của
 * mỗi dạng câu hỏi mang bộ khoá khác nhau.
 */
function question(partial: Partial<StartLessonQuestion>): StartLessonQuestion {
  return {
    questionId: 1,
    questionType: "TRANSLATE_TO_VN",
    content: "",
    options: [],
    ...partial,
  } as StartLessonQuestion;
}

describe("buildTeachCards", () => {
  it("dựng thẻ dạy chữ cái từ câu hỏi 'Chữ 「あ」 đọc là gì?'", () => {
    const cards = buildTeachCards([
      question({
        questionId: 1,
        questionType: "TRANSLATE_TO_VN",
        content: "Chữ 「あ」 đọc là gì?",
        audioUrl: "/uploads/audios/kana/kana-a.mp3",
        metadataJson: { symbol: "あ", romaji: "a", type: "HIRAGANA" },
        options: [
          { optionId: 1, content: "i", isCorrect: false },
          { optionId: 4, content: "a", isCorrect: true },
        ],
      }),
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      kind: "kana",
      japanese: "あ",
      romaji: "a",
      audioUrl: `${BASE}/uploads/audios/kana/kana-a.mp3`,
    });
    // Đáp án đúng của câu này chính là romaji, nên không lặp lại ở dòng nghĩa.
    expect(cards[0].meaning).toBeUndefined();
  });

  it("lấy mặt chữ từ đáp án đúng khi metadata chỉ có romaji", () => {
    // Dạng "Âm 「a」 viết bằng Hiragana là chữ nào?" — chữ nằm ở đáp án.
    const cards = buildTeachCards([
      question({
        questionId: 9,
        questionType: "TRANSLATE_TO_JP",
        content: "Âm 「a」 viết bằng Hiragana là chữ nào?",
        metadataJson: { romaji: "a", type: "HIRAGANA" },
        options: [
          { optionId: 33, content: "あ", isCorrect: true },
          { optionId: 34, content: "う", isCorrect: false },
        ],
      }),
    ]);

    expect(cards[0]).toMatchObject({
      kind: "kana",
      japanese: "あ",
      romaji: "a",
    });
  });

  it("gộp ảnh, âm thanh và nghĩa của cùng một từ nằm rải ở nhiều câu", () => {
    const cards = buildTeachCards([
      question({
        questionId: 12,
        questionType: "SELECT_IMAGE",
        content: "Chọn hình đúng với từ 「あい」 (ai)",
        audioUrl: "/uploads/audios/words/ai.mp3",
        metadataJson: { kana: "あい", romaji: "ai" },
        options: [{ optionId: 50, content: null, isCorrect: true }],
      }),
      question({
        questionId: 13,
        questionType: "LISTEN_AND_ARRANGE",
        content: "Nghe và ghép các chữ thành từ 「tình yêu」",
        audioUrl: "/uploads/audios/words/ai.mp3",
        imageUrl: "/uploads/images/vocab/ai.png",
        metadataJson: { romaji: "ai", vn: "tình yêu", jp: "あい" },
        options: [{ optionId: 60, content: "あ", isCorrect: true }],
      }),
    ]);

    // Hai câu cùng nói về あい nên chỉ sinh ra MỘT thẻ, đủ cả bốn mặt.
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      kind: "vocab",
      japanese: "あい",
      romaji: "ai",
      meaning: "tình yêu",
      audioUrl: `${BASE}/uploads/audios/words/ai.mp3`,
      imageUrl: `${BASE}/uploads/images/vocab/ai.png`,
    });
  });

  it("giữ đúng thứ tự xuất hiện lần đầu và không lặp lại chữ đã dạy", () => {
    const cards = buildTeachCards([
      question({
        questionId: 1,
        metadataJson: { symbol: "あ", romaji: "a", type: "HIRAGANA" },
        options: [{ optionId: 1, content: "a", isCorrect: true }],
      }),
      question({
        questionId: 2,
        metadataJson: { symbol: "い", romaji: "i", type: "HIRAGANA" },
        options: [{ optionId: 2, content: "i", isCorrect: true }],
      }),
      question({
        questionId: 6,
        questionType: "LISTEN_AND_SELECT",
        audioUrl: "/uploads/audios/kana/kana-a.mp3",
        metadataJson: { romaji: "a", type: "HIRAGANA" },
        options: [{ optionId: 24, content: "あ", isCorrect: true }],
      }),
    ]);

    expect(cards.map((c) => c.japanese)).toEqual(["あ", "い"]);
  });

  it("nhận diện câu dài là mẫu câu, không phải từ vựng", () => {
    const cards = buildTeachCards([
      question({
        questionId: 300,
        questionType: "SPEAKING",
        metadataJson: {
          jp: "はじめまして",
          romaji: "hajimemashite",
          vn: "Rất vui được gặp bạn",
        },
        options: [{ optionId: 900, content: "はじめまして", isCorrect: true }],
      }),
    ]);

    expect(cards[0].kind).toBe("phrase");
  });

  it("lấy cách đọc từ `teachAudio` khi đề bài cố ý không có nút loa", () => {
    // Câu dịch không mang `audioUrl` (in sẵn mặt chữ ra rồi thì cái loa ở đề bài
    // chẳng phục vụ việc gì). Nhưng thẻ DẠY thì bắt buộc phải có tiếng, nếu không
    // người học gặp từ mới mà không biết đọc lên thế nào.
    const cards = buildTeachCards([
      question({
        questionId: 1,
        questionType: "TRANSLATE_TO_VN",
        content: "「ねこ」 (neko) nghĩa là gì?",
        metadataJson: {
          kana: "ねこ",
          romaji: "neko",
          vn: "con mèo",
          teachAudio: "/uploads/audios/words/neko.mp3",
        },
        options: [{ optionId: 1, content: "con mèo", isCorrect: true }],
      }),
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0].audioUrl).toContain("/uploads/audios/words/neko.mp3");
    expect(cards[0].romaji).toBe("neko");
    expect(cards[0].meaning).toBe("con mèo");
  });

  it("bỏ qua câu không có gì để dạy", () => {
    const cards = buildTeachCards([
      question({ questionId: 1, metadataJson: null, options: [] }),
      // Có mặt chữ nhưng không có cách đọc lẫn nghĩa -> thẻ rỗng, không dạy được.
      question({
        questionId: 2,
        metadataJson: { jp: "ねこ" },
        options: [{ optionId: 5, content: "ねこ", isCorrect: true }],
      }),
    ]);

    expect(cards).toHaveLength(0);
  });
});
