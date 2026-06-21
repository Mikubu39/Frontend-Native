/**
 * Quiz and exercise type definitions.
 */

export type QuizType = 'vocab' | 'kana' | 'picture' | 'kanji-fill' | 'writing' | 'listening' | 'pronunciation';

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
}

export interface VocabQuestion extends BaseQuestion {
  type: 'vocab';
  imageUrl: string;
  answers: QuizAnswer[];
}

export interface KanaQuestion extends BaseQuestion {
  type: 'kana';
  imageUrl: string;
  characters: string[];
  correctOrder: string[];
}

export interface PictureQuestion extends BaseQuestion {
  type: 'picture';
  word: string;
  audioUrl?: string;
  images: QuizAnswer[];
}

export interface KanjiFillQuestion extends BaseQuestion {
  type: 'kanji-fill';
  sentence: string;
  blanks: number[];
  kanjiBank: string[];
  correctFills: Record<number, string>;
}

export type QuizQuestion =
  | VocabQuestion
  | KanaQuestion
  | PictureQuestion
  | KanjiFillQuestion;

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
