/**
 * Review and progress type definitions.
 */

export type ReviewTab = 'week' | 'stage';

export interface ReviewWeek {
  id: string;
  weekNumber: number;
  label: string;
}

export interface SkillProgress {
  id: string;
  name: string;
  completedLessons: number;
  totalLessons: number;
}

export type ProgressTab = 'progress' | 'calendar';
