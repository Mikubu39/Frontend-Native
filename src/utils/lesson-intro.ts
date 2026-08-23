/**
 * Dựng bộ thẻ "học trước khi làm bài" từ đề bài mà backend trả về.
 *
 * Vì sao cần: người học mới hoàn toàn mở bài 1 lên là bị hỏi ngay
 * "Chữ 「あ」 đọc là gì?" — một câu không thể trả lời vì chưa ai dạy họ chữ đó.
 * Duolingo giải quyết bằng cách giới thiệu từng đơn vị kiến thức mới (mặt chữ,
 * cách đọc, nghĩa, âm thanh) rồi mới kiểm tra. Backend chưa có API cho phần
 * giảng bài, nhưng `metadataJson` của mỗi câu hỏi đã mô tả đủ đối tượng đang
 * được hỏi, nên bộ thẻ được suy ra ngay ở client từ chính đề bài của phiên đó.
 *
 * Nhờ vậy thẻ luôn khớp 100% với 10 câu được random ra cho phiên học này —
 * không dạy thừa thứ không hỏi, không hỏi thứ chưa dạy.
 */

import type { StartLessonQuestion } from "@/types/api";
import type { TeachCard, TeachCardKind } from "@/types/lesson-intro";
import { resolveMediaUrl } from "@/utils/media";

/** Hình dạng `metadataJson` mà seed của backend đang dùng. */
interface QuestionMetadata {
  /** Ký tự đơn của bảng chữ cái, vd "あ". */
  symbol?: string;
  /** Từ viết bằng kana, vd "ねこ". */
  kana?: string;
  /** Từ hoặc câu tiếng Nhật, vd "はじめまして". */
  jp?: string;
  romaji?: string;
  /** Nghĩa tiếng Việt. */
  vn?: string;
  /** "HIRAGANA" | "KATAKANA" — chỉ có ở câu bảng chữ cái. */
  type?: string;
}

/** Câu dài hoặc có dấu câu thì giới thiệu như một mẫu câu, không phải từ vựng. */
const PHRASE_MIN_LENGTH = 5;
const PHRASE_PUNCTUATION = /[。、？！\s]/;

/** Ký tự tiếng Nhật (kana + kanji) — dùng để nhận ra đâu là đáp án tiếng Nhật. */
const JAPANESE_CHARS = /[぀-ヿ一-鿿]/;

function readMetadata(question: StartLessonQuestion): QuestionMetadata {
  const meta = question.metadataJson;
  return meta && typeof meta === "object" ? (meta as QuestionMetadata) : {};
}

function correctOption(question: StartLessonQuestion) {
  return (question.options || []).find((opt) => opt.isCorrect);
}

function isPhrase(text: string): boolean {
  return text.length >= PHRASE_MIN_LENGTH || PHRASE_PUNCTUATION.test(text);
}

/**
 * Tìm phần tiếng Nhật của câu hỏi.
 *
 * Ưu tiên metadata; nếu metadata chỉ có romaji (dạng "Âm 「a」 viết bằng
 * Hiragana là chữ nào?") thì bản thân đáp án đúng chính là chữ tiếng Nhật.
 */
function extractJapanese(
  question: StartLessonQuestion,
  meta: QuestionMetadata,
): string | undefined {
  const fromMeta = meta.symbol || meta.kana || meta.jp;
  if (fromMeta) return fromMeta;

  const optionText = correctOption(question)?.content?.trim();
  if (optionText && JAPANESE_CHARS.test(optionText)) return optionText;

  return undefined;
}

/**
 * Tìm nghĩa / cách đọc để hiện dưới mặt chữ.
 *
 * Với câu "Chữ 「あ」 đọc là gì?" thì metadata không có `vn`, nhưng đáp án đúng
 * ("a") chính là thông tin cần dạy — miễn nó không phải là chữ tiếng Nhật
 * (trường hợp đó đáp án đã được dùng làm mặt chữ ở trên rồi).
 */
function extractMeaning(
  question: StartLessonQuestion,
  meta: QuestionMetadata,
  japanese: string,
): string | undefined {
  if (meta.vn) return meta.vn;

  const optionText = correctOption(question)?.content?.trim();
  if (!optionText || optionText === japanese) return undefined;
  if (JAPANESE_CHARS.test(optionText)) return undefined;

  // Với câu chữ cái, đáp án đúng CHÍNH LÀ romaji ("a"). Trả nó về đây nữa thì
  // thẻ hiện "a" hai lần, ở ô cách đọc và ở dòng nghĩa.
  if (meta.romaji && optionText.toLowerCase() === meta.romaji.toLowerCase()) {
    return undefined;
  }

  return optionText;
}

function resolveKind(meta: QuestionMetadata, japanese: string): TeachCardKind {
  if (meta.symbol || (meta.type && japanese.length === 1)) return "kana";
  return isPhrase(japanese) ? "phrase" : "vocab";
}

/**
 * Gộp thông tin mới vào thẻ đã có, chỉ điền vào chỗ còn trống.
 *
 * Cùng một từ xuất hiện ở nhiều dạng câu khác nhau trong một phiên: câu chọn
 * hình có ảnh, câu nghe có âm thanh, câu dịch có nghĩa tiếng Việt. Gộp lại mới
 * ra được một thẻ đầy đủ cả bốn mặt.
 */
function mergeCard(existing: TeachCard, incoming: TeachCard): TeachCard {
  return {
    ...existing,
    romaji: existing.romaji || incoming.romaji,
    meaning: existing.meaning || incoming.meaning,
    audioUrl: existing.audioUrl || incoming.audioUrl,
    imageUrl: existing.imageUrl || incoming.imageUrl,
  };
}

/**
 * Suy ra danh sách thẻ giới thiệu cho một phiên học, theo đúng thứ tự xuất hiện
 * lần đầu trong đề bài và đã khử trùng lặp.
 *
 * Thẻ không có đủ dữ liệu để dạy (thiếu cả cách đọc lẫn nghĩa) sẽ bị loại, vì
 * một thẻ chỉ có mỗi mặt chữ thì không dạy được gì.
 */
export function buildTeachCards(questions: StartLessonQuestion[]): TeachCard[] {
  const byKey = new Map<string, TeachCard>();

  for (const question of questions || []) {
    const meta = readMetadata(question);
    const japanese = extractJapanese(question, meta);
    if (!japanese) continue;

    const kind = resolveKind(meta, japanese);
    const card: TeachCard = {
      id: `${kind}-${japanese}`,
      kind,
      japanese,
      romaji: meta.romaji,
      meaning: extractMeaning(question, meta, japanese),
      audioUrl:
        resolveMediaUrl(question.audioUrl) ??
        resolveMediaUrl(correctOption(question)?.audioUrl),
      imageUrl:
        resolveMediaUrl(question.imageUrl) ??
        resolveMediaUrl(correctOption(question)?.imageUrl),
    };

    const existing = byKey.get(card.id);
    byKey.set(card.id, existing ? mergeCard(existing, card) : card);
  }

  return Array.from(byKey.values()).filter(
    (card) => !!card.romaji || !!card.meaning,
  );
}
