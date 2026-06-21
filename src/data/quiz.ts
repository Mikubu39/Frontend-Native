/**
 * Mock quiz data.
 */

import type { VocabQuestion, KanaQuestion, PictureQuestion, KanjiFillQuestion } from '@/types';

export const MOCK_VOCAB_QUESTIONS: VocabQuestion[] = [
  {
    id: 'vq1',
    type: 'vocab',
    instruction: 'Choose correct answer',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=200&fit=crop',
    answers: [
      { id: 'a1', text: '犬（いぬ）', isCorrect: false },
      { id: 'a2', text: '猫（ねこ）', isCorrect: true },
      { id: 'a3', text: '熊（くま）', isCorrect: false },
    ],
  },
  {
    id: 'vq2',
    type: 'vocab',
    instruction: 'Choose correct answer',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    answers: [
      { id: 'a4', text: '犬（いぬ）', isCorrect: true },
      { id: 'a5', text: '猫（ねこ）', isCorrect: false },
      { id: 'a6', text: '鳥（とり）', isCorrect: false },
    ],
  },
];

export const MOCK_KANA_QUESTIONS: KanaQuestion[] = [
  {
    id: 'kq1',
    type: 'kana',
    instruction: 'Choose correct answer',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=200&fit=crop',
    characters: ['い', 'ね', 'く', 'こ'],
    correctOrder: ['ね', 'こ'],
  },
];

export const MOCK_PICTURE_QUESTIONS: PictureQuestion[] = [
  {
    id: 'pq1',
    type: 'picture',
    instruction: 'Choose correct picture',
    word: 'ねこ',
    images: [
      { id: 'i1', text: 'cat', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop', isCorrect: true },
      { id: 'i2', text: 'dog', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', isCorrect: false },
      { id: 'i3', text: 'bear', imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=200&h=200&fit=crop', isCorrect: false },
      { id: 'i4', text: 'rabbit', imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop', isCorrect: false },
    ],
  },
];

export const MOCK_KANJI_FILL_QUESTIONS: KanjiFillQuestion[] = [
  {
    id: 'kfq1',
    type: 'kanji-fill',
    instruction: 'Choose correct Kanjis',
    sentence: 'ふじ＿のそばにながれる＿の＿は、とてもきれいです。たくさんの＿がおとずれます。',
    blanks: [0, 1, 2, 3],
    kanjiBank: ['山', '川', '人', '水'],
    correctFills: { 0: '山', 1: '川', 2: '水', 3: '人' },
  },
];
