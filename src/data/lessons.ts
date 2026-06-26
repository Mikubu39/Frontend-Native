/**
 * Sample/mock data for lessons.
 * Matches the Kotodama Figma designs.
 */

import type { LessonSection, LessonDetail, LearningPathNode } from '@/types';

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

export const LEARNING_PATH: LearningPathNode[] = [
  { id: 'lp1', title: 'Hiragana: Mặt chữ', category: 'hiragana', progress: 8, total: 8, isLocked: false, icon: '📖' },
  { id: 'lp2', title: 'Hiragana: Tập viết', category: 'hiragana', progress: 2, total: 5, isLocked: false, icon: '✍️' },
  { id: 'lp3', title: 'Hiragana: Luyện nghe', category: 'hiragana', progress: 0, total: 5, isLocked: true, icon: '🔊' },
  { id: 'lp4', title: 'Hiragana: Luyện nói', category: 'hiragana', progress: 0, total: 5, isLocked: true, icon: '🗣️' },
  { id: 'lp5', title: 'Hiragana: Tổng ôn', category: 'hiragana', progress: 0, total: 5, isLocked: true, icon: '🏆' },
  { id: 'lp6', title: 'Katakana: Mặt chữ', category: 'katakana', progress: 0, total: 8, isLocked: true, icon: '📖' },
  { id: 'lp7', title: 'Katakana: Tập viết', category: 'katakana', progress: 0, total: 5, isLocked: true, icon: '✍️' },
  { id: 'lp8', title: 'Ngữ pháp N5: Khẳng định', category: 'grammar', progress: 0, total: 6, isLocked: true, icon: '💡' },
];

export const HIRAGANA_LESSON_DETAIL: LessonDetail = {
  id: 'ld-hiragana',
  category: 'hiragana',
  title: 'Hiragana 6 lessons',
  totalLessons: 6,
  subItems: [
    { id: 'hs1', title: 'Hiragana\n1-20', status: 'completed' },
    { id: 'hs2', title: 'Hiragana\n21-47', status: 'completed' },
    { id: 'hs3', title: 'Writing\nHiragana', status: 'completed', subtitle: 'Part 1' },
    { id: 'hs4', title: 'Writing\nHiragana', status: 'completed', subtitle: 'Part 2' },
    { id: 'hs5', title: 'Listening\nHiragana', status: 'completed' },
    { id: 'hs6', title: 'Speaking\nHiragana', status: 'completed' },
  ],
  overallQuiz: { id: 'hq1', title: 'Part1 overall quiz (Hiragana)', status: 'completed' },
};
