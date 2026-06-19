/**
 * Sample/mock data for lessons.
 * Matches the app's categories: Grammar, Reading, Pronunciation, Hand writing.
 * Replace with API data in production.
 */

import type { LessonSection } from '@/types';

export const LESSON_SECTIONS: LessonSection[] = [
  {
    id: 's1',
    sectionNumber: 1,
    unitNumber: 1,
    title: 'Grammar',
    lessons: [
      { id: 'l1', title: 'Bài 1', status: 'completed' },
      { id: 'l2', title: 'Bài 2', status: 'completed' },
      { id: 'l3', title: 'Bài 3', status: 'completed' },
      { id: 'l4', title: 'Bài 4', status: 'locked' },
      { id: 'l5', title: 'Bài 5', status: 'locked' },
    ],
  },
  {
    id: 's2',
    sectionNumber: 1,
    unitNumber: 2,
    title: 'Reading',
    lessons: [
      { id: 'l6', title: 'Bài 1', status: 'completed' },
      { id: 'l7', title: 'Bài 2', status: 'completed' },
      { id: 'l8', title: 'Bài 3', status: 'current' },
      { id: 'l9', title: 'Bài 4', status: 'locked' },
      { id: 'l10', title: 'Bài 5', status: 'locked' },
    ],
  },
  {
    id: 's3',
    sectionNumber: 2,
    unitNumber: 1,
    title: 'Pronunciation',
    lessons: [
      { id: 'l11', title: 'Bài 1', status: 'completed' },
      { id: 'l12', title: 'Bài 2', status: 'completed' },
      { id: 'l13', title: 'Bài 3', status: 'locked' },
      { id: 'l14', title: 'Bài 4', status: 'locked' },
      { id: 'l15', title: 'Bài 5', status: 'locked' },
    ],
  },
  {
    id: 's4',
    sectionNumber: 2,
    unitNumber: 2,
    title: 'Hand writing',
    lessons: [
      { id: 'l16', title: 'Bài 1', status: 'completed' },
      { id: 'l17', title: 'Bài 2', status: 'completed' },
      { id: 'l18', title: 'Bài 3', status: 'completed' },
      { id: 'l19', title: 'Bài 4', status: 'locked' },
      { id: 'l20', title: 'Bài 5', status: 'locked' },
    ],
  },
];
