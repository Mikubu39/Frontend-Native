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

    // Based on questionType from backend, determine the frontend QuizType
    switch (q.questionType) {
      case "SELECT_IMAGE":
        return {
          id: questionId,
          type: "picture",
          instruction: "Chọn hình ảnh đúng",
          word: q.content,
          romaji,
          hint,
          glossary,
          originalOptions,
          audioUrl: resolveMediaUrl(q.audioUrl),
          images: answers,
        } as PictureQuestion;

      case "LISTEN_AND_SELECT":
        return {
          id: questionId,
          type: "listening",
          instruction: "Nghe và chọn đáp án đúng",
          hint,
          glossary,
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
          instruction: "Nghe và sắp xếp câu",
          hint,
          glossary,
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
          instruction: "Đọc to câu sau",
          textToSpeak: firstOption?.content || q.content || "",
          translation: q.metadataJson?.vn || hint || "",
          romaji: firstOption?.metadataJson?.romaji || romaji,
          hint,
          glossary,
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
        let cleanWord = q.content || "";
        if (cleanWord.includes(":")) {
          const parts = cleanWord.split(":");
          cleanWord = parts.slice(1).join(":").trim();
        }
        return {
          id: questionId,
          type: "vocab",
          instruction:
            q.questionType === "TRANSLATE_TO_VN"
              ? "Dịch sang tiếng Việt"
              : "Dịch sang tiếng Nhật",
          word: cleanWord || q.content,
          romaji,
          hint,
          glossary,
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
