/**
 * Japanese <-> Romaji converter and dual-text helper utility.
 */

// Basic Romaji to Hiragana dictionary for vocabulary in app
const ROMAJI_TO_KANA_MAP: Record<string, string> = {
  watashi: 'わたし',
  wa: 'は',
  gakusei: 'がくせい',
  desu: 'です',
  inu: 'いぬ',
  neko: 'ねこ',
  ringo: 'りんご',
  tsukue: 'つくえ',
  kare: 'かれ',
  kanojo: 'かのじょ',
  kore: 'これ',
  sore: 'それ',
  are: 'あれ',
  hon: 'ほん',
  sensei: 'せんせい',
  nihon: 'にほん',
  go: 'ご',
  ohayou: 'おはよう',
  konnichiwa: 'こんにちは',
  konbanwa: 'こんばんは',
  arigatou: 'ありがとう',
  sayounara: 'さようなら',
};

// Reverse map (Hiragana to Romaji)
const KANA_TO_ROMAJI_MAP: Record<string, string> = Object.entries(ROMAJI_TO_KANA_MAP).reduce(
  (acc, [romaji, kana]) => {
    acc[kana] = romaji;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Checks if a string contains Japanese characters (Hiragana, Katakana, or Kanji).
 */
export function isJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

/**
 * Converts a romaji word/phrase to Hiragana if available.
 */
export function toKana(romaji: string): string | null {
  const clean = romaji.trim().toLowerCase().replace(/[.,!?]/g, '');
  if (ROMAJI_TO_KANA_MAP[clean]) {
    return ROMAJI_TO_KANA_MAP[clean];
  }
  // Try word-by-word conversion
  const words = clean.split(/\s+/);
  const converted = words.map((w) => ROMAJI_TO_KANA_MAP[w] || w);
  if (converted.some((w, i) => w !== words[i])) {
    return converted.join(' ');
  }
  return null;
}

/**
 * Converts a Hiragana word/phrase to Romaji if available.
 */
export function toRomaji(kana: string): string | null {
  const clean = kana.trim();
  if (KANA_TO_ROMAJI_MAP[clean]) {
    return KANA_TO_ROMAJI_MAP[clean];
  }
  return null;
}

/**
 * Gets dual text (main text + subtext) based on input text and hint.
 * If main text is Japanese -> subtext is Latin/Romaji.
 * If main text is Latin/Romaji -> subtext is Japanese (Kana/Kanji).
 */
export function getDualText(
  text: string,
  hint?: string
): { mainText: string; subText?: string } {
  if (!text) return { mainText: '' };

  const cleanText = text.trim();
  const isJp = isJapanese(cleanText);

  if (isJp) {
    const romaji = toRomaji(cleanText) || hint || undefined;
    return { mainText: cleanText, subText: romaji };
  } else {
    const kana = toKana(cleanText) || hint || undefined;
    return { mainText: cleanText, subText: kana };
  }
}
