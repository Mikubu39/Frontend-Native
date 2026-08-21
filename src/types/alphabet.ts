/**
 * Alphabet (Bảng chữ cái) DTOs.
 *
 * Mirrors the backend contract documented in the "Chữ viết" API guide:
 * - GET  /api/v1/alphabets?type=...
 * - POST /api/v1/alphabets/practice/start
 * - POST /api/v1/alphabets/practice/submit
 * - POST /api/v1/admin/alphabets (+ /bulk)
 */

export type AlphabetType = "HIRAGANA" | "KATAKANA" | "KANJI";

export type AlphabetQuestionType = "MULTIPLE_CHOICE" | "DRAWING";

/** 0 = chưa học, 3 = thành thạo. */
export type MasteryLevel = 0 | 1 | 2 | 3;

export const MAX_MASTERY_LEVEL = 3;

// ============== USER: GRID ==============
export interface AlphabetCharacter {
  characterId: number;
  symbol: string;
  romaji: string;
  audioUrl: string | null;
  masteryLevel: number;
}

export interface AlphabetGroup {
  groupName: string;
  characters: AlphabetCharacter[];
}

// ============== USER: PRACTICE ==============
export interface AlphabetPracticeOption {
  optionId: number;
  content: string;
  isCorrect: boolean;
}

export interface AlphabetPracticeQuestion {
  characterId: number;
  questionType: AlphabetQuestionType;
  prompt: string;
  audioUrl: string | null;
  symbol: string | null;
  /** JSON string: `[{ "strokeNum": 1, "path": "M40.5,41.75c..." }]` */
  strokeOrderData: string | null;
  options: AlphabetPracticeOption[];
}

export interface AlphabetPracticeStartResponse {
  practiceSessionId: string;
  questions: AlphabetPracticeQuestion[];
}

export interface AlphabetPracticeResultItem {
  characterId: number;
  isCorrect: boolean;
}

export interface AlphabetPracticeSubmitRequest {
  results: AlphabetPracticeResultItem[];
}

export interface AlphabetPracticeSubmitResponse {
  expEarned: number;
  /**
   * CẢNH BÁO: tài liệu BE ghi `isPromoted`, nhưng API thật trả về `promoted`
   * (Jackson cắt tiền tố "is" của getter boolean). Khai báo cả hai và luôn đọc
   * qua `isPracticePromoted()` để không vỡ dù BE sửa lại sau này.
   */
  promoted?: boolean;
  isPromoted?: boolean;
  /** Có giá trị kể cả khi KHÔNG thăng hạng - chỉ hiển thị khi promoted = true. */
  newRankName: string | null;
  message: string;
  /** BE trả thêm, không có trong tài liệu. */
  currentExp?: number;
}

/** Đọc cờ thăng hạng bất kể BE dùng `promoted` hay `isPromoted`. */
export function isPracticePromoted(
  result: Pick<AlphabetPracticeSubmitResponse, "promoted" | "isPromoted">,
): boolean {
  return result.promoted ?? result.isPromoted ?? false;
}

// ============== ADMIN ==============
export interface CreateAlphabetRequest {
  symbol: string;
  romaji: string;
  type: AlphabetType;
  groupName: string;
  audioUrl?: string | null;
  orderIndex: number;
  /** JSON string của mảng nét vẽ. */
  strokeOrderData?: string | null;
}

// ============== STROKE ORDER ==============
export interface StrokeDefinition {
  strokeNum: number;
  path: string;
}
