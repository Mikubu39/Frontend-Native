import { StartLessonQuestion } from "@/types/api";
import { resolveMediaUrl } from "@/utils/media";
import {
  Glossary,
  KanaQuestion,
  ListeningQuestion,
  PictureQuestion,
  QuizAnswer,
  QuizQuestion,
  SpeakingQuestion,
  VocabQuestion,
} from "@/types/quiz";

/**
 * Bảng tra nghĩa mà backend gửi kèm câu hỏi, đã lọc bỏ mục rỗng.
 *
 * Chỉ nhận đúng hình dạng `{ "ねこ": { r, v } }`; dữ liệu cũ hoặc câu hỏi do
 * người khác tạo qua API admin có thể không có trường này nên phải chịu được
 * `undefined` mà không nổ.
 */
function readGlossary(metadataJson: any): Glossary | undefined {
  const raw = metadataJson?.glossary;
  if (!raw || typeof raw !== "object") return undefined;

  const out: Glossary = {};
  for (const [word, entry] of Object.entries(raw)) {
    if (!word || !entry || typeof entry !== "object") continue;
    const { r, v } = entry as { r?: string; v?: string };
    if (r || v) out[word] = { r, v };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Nội dung tiếng Nhật SẠCH của đề bài — thứ được in trong bong bóng thoại.
 *
 * Backend đã tách sẵn: `kana` cho câu hỏi mức TỪ (「おはようございます」), `jp` cho
 * câu hỏi mức CÂU (「せんせい、おはようございます。」). Chỉ một trong hai có mặt.
 *
 * Trước đây chỗ này đọc `question_text` rồi cắt chuỗi theo dấu hai chấm để moi
 * lấy phần chữ Nhật. Cách đó hỏng với mọi câu không có dấu hai chấm — và phần
 * lớn dữ liệu thật không có: `「こんにちは」 (konnichiwa) nghĩa là gì?` sẽ nhảy
 * NGUYÊN CẢ CÂU TIẾNG VIỆT vào bong bóng. Đọc thẳng trường đã tách thì không
 * còn phải đoán.
 */
function readPrompt(metadataJson: any): string | undefined {
  const kana = metadataJson?.kana;
  if (typeof kana === "string" && kana.trim()) return kana.trim();
  const jp = metadataJson?.jp;
  if (typeof jp === "string" && jp.trim()) return jp.trim();
  return undefined;
}

/**
 * Đường lui cho dữ liệu cũ chưa có `kana`/`jp`: bóc phần nằm trong ngoặc 「」,
 * rồi mới tới cách cắt theo dấu hai chấm như bản trước.
 */
function legacyPrompt(content: string | undefined): string {
  const text = content || "";
  const bracketed = text.match(/「([^」]+)」/);
  if (bracketed) return bracketed[1].trim();
  if (text.includes(":")) {
    return text.split(":").slice(1).join(":").trim();
  }
  return text;
}

/**
 * Maps Backend API Questions to Frontend UI Quiz Questions.
 */
export function mapApiQuestionsToQuizQuestions(
  apiQuestions: StartLessonQuestion[],
): QuizQuestion[] {
  return apiQuestions.map((q, index) => {
    const questionId = String(q.questionId || index);

    // Map options to QuizAnswer
    const answers: QuizAnswer[] = (q.options || []).map((opt) => ({
      id: String(opt.optionId),
      text: opt.content || "",
      romaji: opt.metadataJson?.romaji || undefined,
      imageUrl: resolveMediaUrl(opt.imageUrl),
      audioUrl: resolveMediaUrl(opt.audioUrl),
      isCorrect: !!opt.isCorrect,
    }));

    const hint = q.metadataJson?.hint || undefined;
    const romaji = q.metadataJson?.romaji || undefined;
    const glossary = readGlossary(q.metadataJson);
    const originalOptions = q.options;
    const isNew = q.isNew === true;

    /**
     * Đề bài tiếng Nhật (「おはようございます」). CHỈ dùng cho những loại câu mà
     * chữ Nhật là ĐỀ, không phải ĐÁP ÁN — xem bảng ngay dưới.
     */
    const jpPrompt = readPrompt(q.metadataJson) || legacyPrompt(q.content);
    /** Nghĩa tiếng Việt; là đề bài của những câu hỏi ngược chiều. */
    const vnPrompt = q.metadataJson?.vn || undefined;

    // Chiều của câu hỏi quyết định được in cái gì:
    //
    //   SELECT_IMAGE / TRANSLATE_TO_VN  →  đề là chữ Nhật, đáp án là tiếng Việt/ảnh
    //   TRANSLATE_TO_JP                 →  đề là TIẾNG VIỆT, `kana` chính là ĐÁP ÁN
    //   LISTEN_AND_ARRANGE              →  đề là audio + nghĩa, `jp` là ĐÁP ÁN cần xếp
    //   LISTEN_AND_SELECT               →  đề CHỈ là audio, không in gì
    //
    // In nhầm `kana`/`jp` ở hai loại giữa là phát đáp án cho người học.

    // Based on questionType from backend, determine the frontend QuizType
    switch (q.questionType) {
      case "SELECT_IMAGE":
        return {
          id: questionId,
          type: "picture",
          instruction: "Chọn hình đúng với từ này",
          prompt: jpPrompt,
          promptRomaji: romaji,
          promptLang: "ja",
          word: jpPrompt,
          romaji,
          hint,
          glossary,
          isNew,
          originalOptions,
          audioUrl: resolveMediaUrl(q.audioUrl),
          images: answers,
        } as PictureQuestion;

      case "LISTEN_AND_SELECT":
        return {
          id: questionId,
          type: "listening",
          instruction: "Nghe và chọn đáp án đúng",
          // Không có `prompt`: nghe được đề rồi thì in chữ ra là mất chỗ để nghe.
          hint,
          glossary,
          isNew,
          originalOptions,
          audioUrl: resolveMediaUrl(q.audioUrl) ?? "",
          answers,
        } as ListeningQuestion;

      case "LISTEN_AND_ARRANGE": {
        const sortedOptions = [...(q.options || [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
        const correctOrder = sortedOptions.map((opt) => opt.content || "");

        // Phiên âm của từng thẻ rời. Khoá theo nội dung thẻ chứ không theo vị
        // trí vì các thẻ sẽ bị xáo trộn ngay bên dưới.
        const blockRomaji: Record<string, string> = {};
        for (const opt of sortedOptions) {
          const text = opt.content;
          const blockR = opt.metadataJson?.romaji;
          if (text && blockR) blockRomaji[text] = blockR;
        }

        let characters = [...correctOrder].sort(() => Math.random() - 0.5);
        if (
          characters.join("") === correctOrder.join("") &&
          characters.length > 1
        ) {
          characters = [characters[1], characters[0], ...characters.slice(2)];
        }

        return {
          id: questionId,
          type: "kana",
          instruction: "Nghe và sắp xếp thành câu",
          // Đề là AUDIO; `jp` là đáp án cần xếp nên tuyệt đối không in ra.
          // Nghĩa tiếng Việt thì in được, đó là gợi ý chứ không phải đáp án.
          prompt: vnPrompt,
          promptLang: "vi",
          hint,
          glossary,
          isNew,
          originalOptions,
          imageUrl: resolveMediaUrl(q.imageUrl) ?? "",
          audioUrl: resolveMediaUrl(q.audioUrl),
          characters,
          correctOrder,
          blockRomaji,
        } as KanaQuestion;
      }

      case "SPEAKING": {
        const firstOption = (q.options || [])[0];
        return {
          id: questionId,
          type: "speaking",
          instruction: "Nhấn micro và đọc to câu sau",
          prompt: readPrompt(q.metadataJson) || firstOption?.content || "",
          promptRomaji: firstOption?.metadataJson?.romaji || romaji,
          promptLang: "ja",
          textToSpeak:
            readPrompt(q.metadataJson) ||
            firstOption?.content ||
            q.content ||
            "",
          translation: q.metadataJson?.vn || hint || "",
          romaji: firstOption?.metadataJson?.romaji || romaji,
          hint,
          glossary,
          isNew,
          originalOptions,
          // Câu mẫu người bản xứ đọc: nghe trước rồi bắt chước mới nói được.
          audioUrl:
            resolveMediaUrl(q.audioUrl) ??
            resolveMediaUrl(firstOption?.audioUrl),
        } as SpeakingQuestion;
      }

      case "TRANSLATE_TO_VN":
      case "TRANSLATE_TO_JP":
      default: {
        // Hai chiều ngược nhau: TO_VN in chữ Nhật rồi hỏi nghĩa; TO_JP in
        // tiếng Việt rồi hỏi cách nói — ở chiều đó `kana` là ĐÁP ÁN.
        const toJp = q.questionType === "TRANSLATE_TO_JP";
        const word = toJp ? vnPrompt || legacyPrompt(q.content) : jpPrompt;
        const isSentence = (word || "").length > 8;
        return {
          id: questionId,
          type: "vocab",
          instruction: toJp
            ? "Nói thế nào bằng tiếng Nhật?"
            : isSentence
              ? "Câu này nghĩa là gì?"
              : "Từ này nghĩa là gì?",
          prompt: word,
          promptRomaji: toJp ? undefined : romaji,
          promptLang: toJp ? "vi" : "ja",
          word,
          romaji: toJp ? undefined : romaji,
          hint,
          glossary,
          isNew,
          originalOptions,
          imageUrl: resolveMediaUrl(q.imageUrl) ?? "",
          // Câu dịch không có âm thanh (đề bài đã in sẵn chữ), nhưng vẫn đọc từ
          // API thay vì bỏ trắng: nút loa sẽ tự ẩn khi không có, nên nếu sau này
          // có câu dịch thật sự cần nghe thì chỉ việc thêm audio ở backend.
          audioUrl: resolveMediaUrl(q.audioUrl),
          answers,
        } as VocabQuestion;
      }
    }
  });
}
