/**
 * Search category data.
 */

export interface SearchCategory {
  id: string;
  label: string;
  imageUrl: string;
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'travel', label: 'Travel', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=200&h=200&fit=crop' },
  { id: 'food', label: 'Food', imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=200&h=200&fit=crop' },
  { id: 'animal', label: 'Animal', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop' },
  { id: 'plants', label: 'Plants', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop' },
  { id: 'body', label: 'Body', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop' },
  { id: 'vegetable', label: 'Vegetable', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop' },
  { id: 'movie', label: 'Movie', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop' },
  { id: 'music', label: 'Music', imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop' },
  { id: 'art', label: 'Art', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop' },
  { id: 'number', label: 'Number', imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=200&h=200&fit=crop' },
  { id: 'cutlery', label: 'Cutlery', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' },
  { id: 'sweet', label: 'Sweet', imageUrl: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=200&h=200&fit=crop' },
];

export const SEARCH_FILTERS = [
  { id: 'voice', label: '🎤', type: 'icon' as const },
  { id: 'hiragana', label: 'あ', type: 'text' as const },
  { id: 'katakana', label: 'ア', type: 'text' as const },
  { id: 'kanji', label: '文', type: 'text' as const },
];
