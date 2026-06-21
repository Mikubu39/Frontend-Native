/**
 * Mock review data.
 */

import type { ReviewWeek, SkillProgress } from '@/types';

export const REVIEW_WEEKS: ReviewWeek[] = [
  { id: 'rw3', weekNumber: 3, label: 'Week 3' },
  { id: 'rw4', weekNumber: 4, label: 'Week 4' },
  { id: 'rw5', weekNumber: 5, label: 'Week 5' },
  { id: 'rw6', weekNumber: 6, label: 'Week 6' },
  { id: 'rw7', weekNumber: 7, label: 'Week 7' },
];

export const SKILL_PROGRESS: SkillProgress[] = [
  { id: 'sp1', name: 'Grammar', completedLessons: 3, totalLessons: 5 },
  { id: 'sp2', name: 'Reading', completedLessons: 2, totalLessons: 5 },
  { id: 'sp3', name: 'Pronouciation', completedLessons: 2, totalLessons: 5 },
  { id: 'sp4', name: 'Hand writing', completedLessons: 3, totalLessons: 5 },
];
