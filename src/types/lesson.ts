/**
 * Lesson-related type definitions.
 */

export type LessonStatus = 'completed' | 'current' | 'locked';

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
