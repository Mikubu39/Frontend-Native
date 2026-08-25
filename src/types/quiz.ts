/**
 * Quiz and exercise type definitions.
 */

export type QuizType =
  | "vocab"
  | "kana"
  | "picture"
  | "kanji-fill"
  | "writing"
  | "listening"
  | "speaking"
  | "matching"
  | "flashcard"
  | "fill-blank";

/** Một mục trong từ điển mini đi kèm câu hỏi. */
export interface GlossaryEntry {
  /** Romaji (phiên âm Latin). */
  r?: string;
  /** Nghĩa tiếng Việt. */
  v?: string;
}

/**
 * Từ điển mini của riêng một câu hỏi: kana -> cách đọc + nghĩa.
 *
 * Người học chưa biết chữ nào nên phải chạm giữ vào bất kỳ chữ Nhật nào trên
 * màn hình là tra được ngay. Backend gửi kèm mỗi câu một bảng chỉ chứa các từ
 * xuất hiện trong chính câu đó, nên không bao giờ lộ từ của câu khác.
 */
export type Glossary = Record<string, GlossaryEntry>;

export interface QuizAnswer {
  id: string;
  text: string;
  /** Phiên âm Latin của `text`, hiện thành dòng nhỏ dưới chữ Nhật. */
  romaji?: string;
  audioUrl?: string;
  imageUrl?: string;
  isCorrect: boolean;
}

export interface BaseQuestion {
  id: string;
  type: QuizType;
  instruction: string;
  hint?: string;
  originalOptions?: any[];
  glossary?: Glossary;
}

export interface VocabQuestion extends BaseQuestion {
  type: "vocab";
  word?: string;
  /** Phiên âm Latin của `word`. */
  romaji?: string;
  imageUrl: string;
  /**
   * Chỉ có khi âm thanh CHÍNH LÀ đề bài. Câu dịch không có, và nút loa cũng
   * không được vẽ ra — nút loa câm là lỗi người dùng thấy ngay.
   */
  audioUrl?: string;
  answers: QuizAnswer[];
}

export interface KanaQuestion extends BaseQuestion {
  type: "kana";
  imageUrl: string;
  characters: string[];
  correctOrder: string[];
  /** Phiên âm của từng thẻ rời: thẻ "せんせい" -> "sensei". */
  blockRomaji?: Record<string, string>;
  audioUrl?: string;
}

export interface PictureQuestion extends BaseQuestion {
  type: "picture";
  word: string;
  /** Phiên âm Latin của `word`. */
  romaji?: string;
  audioUrl?: string;
  images: QuizAnswer[];
}

export interface KanjiFillQuestion extends BaseQuestion {
  type: "kanji-fill";
  sentence: string;
  blanks: number[];
  kanjiBank: string[];
  correctFills: Record<number, string>;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  pairs: MatchingPair[];
}

export interface FlashcardQuestion extends BaseQuestion {
  type: "flashcard";
  frontText: string;
  backText: string;
  audioUrl?: string;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill-blank";
  sentence: string;
  options: string[];
  correctAnswer: string;
}

export interface ListeningQuestion extends BaseQuestion {
  type: "listening";
  audioUrl: string;
  answers: QuizAnswer[];
}

export interface SpeakingQuestion extends BaseQuestion {
  type: "speaking";
  textToSpeak: string;
  translation: string;
  /** Phiên âm Latin của `textToSpeak`. */
  romaji?: string;
  /** Câu mẫu do người bản xứ đọc, để người học nghe rồi bắt chước. */
  audioUrl?: string;
}

export type QuizQuestion =
  | VocabQuestion
  | KanaQuestion
  | PictureQuestion
  | KanjiFillQuestion
  | MatchingQuestion
  | FlashcardQuestion
  | FillBlankQuestion
  | ListeningQuestion
  | SpeakingQuestion;

export interface QuizResultCategory {
  name: string;
  stars: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  correctCategories: QuizResultCategory[];
  wrongCategories: string[];
}
