/**
 * Mock dictionary data.
 */

import type { DictionaryEntry } from '@/types';

export const MOCK_WORDS: DictionaryEntry[] = [
  { id: 'w1', kanji: '太陽', romaji: 'Tai-yo', meaning: 'Sun' },
  { id: 'w2', kanji: '月', romaji: 'Tsuki', meaning: 'Moon' },
  { id: 'w3', kanji: '星', romaji: 'Hoshi', meaning: 'Star' },
  { id: 'w4', kanji: '山', romaji: 'Yama', meaning: 'Mountain' },
  { id: 'w5', kanji: '川', romaji: 'Kawa', meaning: 'River' },
  { id: 'w6', kanji: '海', romaji: 'Umi', meaning: 'Sea' },
];

export const MOCK_PHRASES: DictionaryEntry[] = [
  { id: 'p1', kanji: 'おはようございます', romaji: 'Ohayo-gozai masu', meaning: 'Good morning' },
  { id: 'p2', kanji: 'ありがとう', romaji: 'Arigatou', meaning: 'Thank you' },
  { id: 'p3', kanji: 'すみません', romaji: 'Sumimasen', meaning: 'Excuse me' },
  { id: 'p4', kanji: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Hello' },
  { id: 'p5', kanji: 'さようなら', romaji: 'Sayounara', meaning: 'Goodbye' },
];
