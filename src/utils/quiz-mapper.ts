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
 * Regex kiểm tra chuỗi chỉ chứa dấu câu (tiếng Nhật & quốc tế) hoặc khoảng trắng.
 */
const PUNCTUATION_ONLY_REGEX = /^[。、.,?!？！:;·…~～\-—\s]+$/;

// Đuôi chia thể lịch sự です/ます (copula + trợ động từ) — cùng lý do với
// GRAMMAR_AUX_WORDS ở glossary-context.tsx: bám vào GẦN NHƯ MỌI câu lịch sự,
// coi là từ vựng sẽ khiến chúng bị tô sáng ở khắp câu không liên quan.
const GRAMMAR_AUX_WORDS = new Set(["です", "でした", "ます", "ません"]);

// Chỉ hiragana/katakana 1 ký tự mới đáng ngờ là trợ từ — kanji 1 ký tự (水,
// 肉, 卵...) là danh từ thật. Xem giải thích đầy đủ ở glossary-context.tsx.
const SINGLE_KANA_REGEX = /^[぀-ゟ゠-ヿ]$/;

/**
 * Kiểm tra xem một chuỗi có hoàn toàn chỉ là dấu câu hay không.
 */
export function isPunctuationOnly(text: string): boolean {
  if (!text) return true;
  return PUNCTUATION_ONLY_REGEX.test(text.trim());
}

/**
 * Loại bỏ khoảng trắng thừa và cắt các dấu câu ở hai đầu của token.
 */
export function cleanArrangementToken(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/^[。、.,?!？！:;·…~～\-—\s]+|[。、.,?!？！:;·…~～\-—\s]+$/g, "");
}

/**
 * Kho thẻ ma (distractors) trợ từ và ngữ pháp phổ biến trong tiếng Nhật sơ cấp.
 */
export interface DistractorItem {
  text: string;
  romaji: string;
}

export const COMMON_GRAMMAR_DISTRACTORS: DistractorItem[] = [
  { text: "は", romaji: "wa" },
  { text: "が", romaji: "ga" },
  { text: "を", romaji: "o" },
  { text: "に", romaji: "ni" },
  { text: "で", romaji: "de" },
  { text: "も", romaji: "mo" },
  { text: "と", romaji: "to" },
  { text: "へ", romaji: "e" },
  { text: "です", romaji: "desu" },
  { text: "でした", romaji: "deshita" },
  { text: "ます", romaji: "masu" },
  { text: "じゃない", romaji: "janai" },
  { text: "から", romaji: "kara" },
  { text: "まで", romaji: "made" },
];

interface LessonVocabEntry {
  text: string;
  romaji?: string;
}

/**
 * Trích xuất kho từ vựng và phiên âm từ tất cả câu hỏi trong cùng bài học.
 */
function extractLessonVocabPool(
  apiQuestions: StartLessonQuestion[],
): LessonVocabEntry[] {
  const pool: LessonVocabEntry[] = [];
  const seen = new Set<string>();

  // Chỉ lấy những token có ít nhất 1 ký tự tiếng Nhật (Hiragana, Katakana, Kanji)
  const IS_JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  for (const q of apiQuestions) {
    // 1. Trích xuất từ bảng glossary
    const glossary = q.metadataJson?.glossary;
    if (glossary && typeof glossary === "object") {
      for (const [word, entry] of Object.entries(glossary)) {
        const cleaned = cleanArrangementToken(word);
        if (
          cleaned &&
          !isPunctuationOnly(cleaned) &&
          IS_JAPANESE_REGEX.test(cleaned) &&
          !seen.has(cleaned)
        ) {
          seen.add(cleaned);
          const r = (entry as { r?: string })?.r;
          pool.push({ text: cleaned, romaji: r });
        }
      }
    }

    // 2. Trích xuất từ options của các câu hỏi khác
    for (const opt of q.options || []) {
      const cleaned = cleanArrangementToken(opt.content || "");
      if (
        cleaned &&
        !isPunctuationOnly(cleaned) &&
        IS_JAPANESE_REGEX.test(cleaned) &&
        !seen.has(cleaned)
      ) {
        seen.add(cleaned);
        const r = opt.metadataJson?.romaji;
        pool.push({ text: cleaned, romaji: r });
      }
    }
  }

  return pool;
}

/**
 * Sinh danh sách thẻ ma (distractors) không trùng lặp với các token đáp án đúng.
 */
function generateDistractors(
  correctTokens: string[],
  explicitDistractors: { text: string; romaji?: string }[],
  lessonVocabPool: LessonVocabEntry[],
  targetCount: number,
): { text: string; romaji?: string }[] {
  const result: { text: string; romaji?: string }[] = [];
  const usedTexts = new Set<string>(correctTokens);

  // 1. Ưu tiên thẻ ma có sẵn từ backend nếu có (isCorrect === false)
  for (const d of explicitDistractors) {
    if (!usedTexts.has(d.text)) {
      usedTexts.add(d.text);
      result.push(d);
      if (result.length >= targetCount) return result;
    }
  }

  // 2. Lấy từ kho từ vựng của bài học (Glossary & options của câu khác)
  const shuffledLessonVocab = [...lessonVocabPool].sort(
    () => Math.random() - 0.5,
  );
  for (const item of shuffledLessonVocab) {
    if (!usedTexts.has(item.text)) {
      usedTexts.add(item.text);
      result.push(item);
      if (result.length >= targetCount) return result;
    }
  }

  // 3. Bổ sung từ kho trợ từ / ngữ pháp phổ biến
  const shuffledGrammar = [...COMMON_GRAMMAR_DISTRACTORS].sort(
    () => Math.random() - 0.5,
  );
  for (const item of shuffledGrammar) {
    if (!usedTexts.has(item.text)) {
      usedTexts.add(item.text);
      result.push(item);
      if (result.length >= targetCount) return result;
    }
  }

  return result;
}

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
    // Loại các mục HIRAGANA/KATAKANA dài đúng 1 ký tự (trợ từ ngữ pháp như
    // を/て/は/が) — cùng lý do với bảng tra toàn cục ở glossary-context.tsx.
    // KHÔNG áp cho kanji 1 ký tự (水, 肉, 卵...) — đó là danh từ thật.
    if (word.length === 1 && SINGLE_KANA_REGEX.test(word)) continue;
    if (GRAMMAR_AUX_WORDS.has(word)) continue;
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
  const lessonVocabPool = extractLessonVocabPool(apiQuestions);

  return apiQuestions.map((q, index) => {
    const questionId = String(q.questionId || index);

    // Map options to QuizAnswer (bổ sung fallback label từ metadataJson cho câu SELECT_IMAGE)
    const answers: QuizAnswer[] = (q.options || []).map((opt) => ({
      id: String(opt.optionId),
      text: opt.content || opt.metadataJson?.label || "",
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
     * chữ Nhật là ĐỀ, không phải ĐÁP ÁN.
     */
    const jpPrompt = readPrompt(q.metadataJson) || legacyPrompt(q.content);
    /** Nghĩa tiếng Việt; là đề bài của những câu hỏi ngược chiều. */
    const vnPrompt = q.metadataJson?.vn || undefined;

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
          audioUrl:
            resolveMediaUrl(q.audioUrl) ??
            resolveMediaUrl(q.metadataJson?.teachAudio),
          images: answers,
        } as PictureQuestion;

      case "LISTEN_AND_SELECT":
        return {
          id: questionId,
          type: "listening",
          instruction: "Nghe và chọn đáp án đúng",
          hint,
          glossary,
          isNew,
          originalOptions,
          audioUrl: resolveMediaUrl(q.audioUrl) ?? "",
          answers,
        } as ListeningQuestion;

      case "LISTEN_AND_ARRANGE": {
        // 1. Lọc và làm sạch các options (loại bỏ thẻ chỉ chứa dấu câu như 。、.,?!)
        const validOptions = (q.options || [])
          .map((opt) => ({
            ...opt,
            cleanedContent: cleanArrangementToken(opt.content || ""),
          }))
          .filter(
            (opt) =>
              opt.cleanedContent && !isPunctuationOnly(opt.cleanedContent),
          );

        // 2. Tách đáp án đúng và đáp án ma từ API (nếu có)
        const correctOptions = validOptions
          .filter((opt) => opt.isCorrect !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const explicitDistractorOptions = validOptions
          .filter((opt) => opt.isCorrect === false)
          .map((opt) => ({
            text: opt.cleanedContent,
            romaji: opt.metadataJson?.romaji,
          }));

        const correctOrder = correctOptions.map((opt) => opt.cleanedContent);

        // 3. Số lượng thẻ ma linh hoạt: 2 thẻ nếu câu ngắn (< 5 từ), 3 thẻ nếu câu dài (>= 5 từ)
        const targetDistractorCount = correctOrder.length < 5 ? 2 : 3;

        const distractors = generateDistractors(
          correctOrder,
          explicitDistractorOptions,
          lessonVocabPool,
          targetDistractorCount,
        );

        // 4. Phiên âm của từng thẻ rời (cho cả thẻ đúng và thẻ ma).
        const blockRomaji: Record<string, string> = {};
        for (const opt of correctOptions) {
          const text = opt.cleanedContent;
          const blockR = opt.metadataJson?.romaji;
          if (text && blockR) blockRomaji[text] = blockR;
        }

        for (const d of distractors) {
          if (d.text && d.romaji) {
            blockRomaji[d.text] = d.romaji;
          }
        }

        // 5. Ngân hàng thẻ bao gồm cả thẻ đúng và thẻ ma, được xáo trộn
        const allTokens = [...correctOrder, ...distractors.map((d) => d.text)];
        let characters = [...allTokens].sort(() => Math.random() - 0.5);

        // Đảm bảo không tình cờ trùng khớp hoàn toàn vị trí ban đầu
        if (
          characters.slice(0, correctOrder.length).join("") ===
            correctOrder.join("") &&
          characters.length > 1
        ) {
          characters = [characters[1], characters[0], ...characters.slice(2)];
        }

        return {
          id: questionId,
          type: "kana",
          instruction: "Nghe và sắp xếp thành câu",
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
          audioUrl:
            resolveMediaUrl(q.audioUrl) ??
            resolveMediaUrl(firstOption?.audioUrl),
        } as SpeakingQuestion;
      }

      case "TRANSLATE_TO_VN":
      case "TRANSLATE_TO_JP":
      default: {
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
          audioUrl:
            resolveMediaUrl(q.audioUrl) ??
            (toJp ? undefined : resolveMediaUrl(q.metadataJson?.teachAudio)),
          answers,
        } as VocabQuestion;
      }
    }
  });
}
