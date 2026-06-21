/**
 * Dictionary-related type definitions.
 */

export type DictionaryTab = 'words' | 'phrases' | 'history';

export interface DictionaryEntry {
  id: string;
  kanji: string;
  romaji: string;
  meaning: string;
  audioUrl?: string;
}
