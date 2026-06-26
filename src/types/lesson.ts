/**
 * Lesson-related type definitions.
 */

export type LessonStatus = 'completed' | 'current' | 'locked';

export type LessonCategory = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'pronunciation' | 'grammar';

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
  /** true = hiển thị rương (treasure/review checkpoint) thay vì ngôi sao */
  isCheckpoint?: boolean;
}

export interface LessonSection {
  id: string;
  sectionNumber: number;
  unitNumber: number;
  title: string;
  lessons: Lesson[];
}

export interface LessonSubItem {
  id: string;
  title: string;
  subtitle?: string;
  status: LessonStatus;
}

export interface LessonDetail {
  id: string;
  category: LessonCategory;
  title: string;
  totalLessons: number;
  subItems: LessonSubItem[];
  overallQuiz?: LessonSubItem;
}

export interface LearningPathNode {
  id: string;
  title: string;
  category: LessonCategory;
  progress: number;
  total: number;
  isLocked: boolean;
  icon?: string;
}
