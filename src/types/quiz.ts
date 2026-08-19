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

export interface QuizAnswer {
  id: string;
  text: string;
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
}

export interface VocabQuestion extends BaseQuestion {
  type: "vocab";
  word?: string;
  imageUrl: string;
  answers: QuizAnswer[];
}

export interface KanaQuestion extends BaseQuestion {
  type: "kana";
  imageUrl: string;
  characters: string[];
  correctOrder: string[];
  audioUrl?: string;
}

export interface PictureQuestion extends BaseQuestion {
  type: "picture";
  word: string;
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
