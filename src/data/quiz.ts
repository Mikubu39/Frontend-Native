/**
 * Mock quiz data.
 */

import type { VocabQuestion, KanaQuestion, PictureQuestion, KanjiFillQuestion, QuizQuestion } from '@/types';

export interface LessonTip {
  title: string;
  subtitle: string;
  formula?: string;
  explanation: string;
  examples: { japanese: string; translation: string }[];
}

export const LESSON_TIPS: Record<string, LessonTip> = {
  lp1: {
    subtitle: 'NHẬN DIỆN MẶT CHỮ',
    title: 'Bảng chữ cái Hiragana & Chào hỏi',
    explanation: 'Hiragana là bảng chữ cái mềm cơ bản của tiếng Nhật. Hãy làm quen với các từ chào hỏi phổ biến như こんにちは (Xin chào) và ありがとう (Cám ơn).',
    examples: [
      { japanese: 'こんにちは (Konnichiwa)', translation: 'Xin chào (Dùng ban ngày)' },
      { japanese: 'ありがとう (Arigatou)', translation: 'Cám ơn' }
    ]
  },
  lp2: {
    subtitle: 'TẬP VIẾT CHỮ CÁI',
    title: 'Quy tắc nét viết Hiragana',
    explanation: 'Viết tiếng Nhật cần tuân theo quy tắc: từ trái qua phải, từ trên xuống dưới. Tập viết đúng nét sẽ giúp chữ cái cân đối và dễ đọc.',
    examples: [
      { japanese: 'あ (A - Nét ngang trước, nét cong dọc sau)', translation: 'Nguyên âm "A"' },
      { japanese: 'い (I - Nét móc trái dài hơn nét phải)', translation: 'Nguyên âm "I"' }
    ]
  },
  lp3: {
    subtitle: 'LUYỆN NGHE PHẢN XẠ',
    title: 'Phát âm và Trường âm',
    explanation: 'Khi nghe tiếng Nhật, hãy chú ý các phụ âm kép và trường âm (âm kéo dài). Trường âm có thể làm thay đổi hoàn toàn ý nghĩa của từ.',
    examples: [
      { japanese: 'おばさん (Obasan)', translation: 'Cô / Dì' },
      { japanese: 'おばあさん (Obaasan)', translation: 'Bà ngoại / Bà nội' }
    ]
  },
  lp4: {
    subtitle: 'LUYỆN PHÁT ÂM CHUẨN',
    title: 'Giao tiếp hằng ngày',
    explanation: 'Luyện nói to từng âm rõ ràng. Tránh phát âm theo kiểu tiếng Việt mà hãy chú ý ngữ điệu lên xuống tự nhiên của từ.',
    examples: [
      { japanese: 'はじめまして (Hajimemashite)', translation: 'Rất hân hạnh được gặp bạn' },
      { japanese: 'よろしくおねがいします (Yoroshiku)', translation: 'Rất mong nhận được sự giúp đỡ' }
    ]
  },
  lp5: {
    subtitle: 'TRẬN CHIẾN BOSS',
    title: 'Tổng ôn Hiragana & Ngữ pháp Sơ cấp',
    formula: 'A は B です',
    explanation: 'Thử sức với toàn bộ các câu hỏi đọc, viết, nghe, nói kết hợp ngữ pháp cốt lõi để chính thức mở khóa cấp độ mới.',
    examples: [
      { japanese: 'わたしは学生です。', translation: 'Tôi là học sinh.' },
      { japanese: 'これにほんごの本です。', translation: 'Đây là sách tiếng Nhật.' }
    ]
  }
};

export const LESSON_QUESTIONS: Record<string, QuizQuestion[]> = {
  lp1: [
    {
      id: 'lp1-q1',
      type: 'vocab',
      instruction: 'Chọn nghĩa đúng cho từ: こんにちは (konnichiwa)',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop',
      answers: [
        { id: 'a1', text: 'Xin chào', isCorrect: true },
        { id: 'a2', text: 'Tạm biệt', isCorrect: false },
        { id: 'a3', text: 'Cám ơn', isCorrect: false },
      ],
    },
    {
      id: 'lp1-q2',
      type: 'kana',
      instruction: 'Sắp xếp các chữ để ghép thành từ "Tạm biệt" (sayounara):',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
      characters: ['よ', 'さ', 'ら', 'う', 'な', 'ね'],
      correctOrder: ['さ', 'よ', 'う', 'な', 'ら'],
    }
  ],
  lp2: [
    {
      id: 'lp2-q1',
      type: 'vocab',
      instruction: 'Nét viết đầu tiên của chữ "い" (i) nằm ở phía nào?',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop',
      answers: [
        { id: 'a1', text: 'Phía bên trái (có nét móc)', isCorrect: true },
        { id: 'a2', text: 'Phía bên phải (nét cong ngắn)', isCorrect: false },
      ],
    },
    {
      id: 'lp2-q2',
      type: 'kana',
      instruction: 'Sắp xếp các ký tự tạo thành chữ "A" (あ):',
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&h=200&fit=crop',
      characters: ['あ', 'い', 'う'],
      correctOrder: ['あ'],
    }
  ],
  lp3: [
    {
      id: 'lp3-q1',
      type: 'vocab',
      instruction: 'Nghe và chọn nghĩa đúng cho từ: おばあさん (Obaasan)',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
      answers: [
        { id: 'a1', text: 'Cô / Dì (Obasan)', isCorrect: false },
        { id: 'a2', text: 'Bà ngoại / Bà nội (Obaasan)', isCorrect: true },
      ],
    }
  ],
  lp4: [
    {
      id: 'lp4-q1',
      type: 'vocab',
      instruction: 'Chọn câu chào khi gặp ai đó lần đầu tiên:',
      imageUrl: 'https://images.unsplash.com/photo-1521791136368-1a46827d0515?w=300&h=200&fit=crop',
      answers: [
        { id: 'a1', text: 'はじめまして (Hajimemashite)', isCorrect: true },
        { id: 'a2', text: 'ありがとう (Arigatou)', isCorrect: false },
      ],
    }
  ],
  lp5: [
    {
      id: 'lp5-q1',
      type: 'vocab',
      instruction: 'Chọn nghĩa đúng cho từ: わたし (watashi)',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=200&fit=crop',
      answers: [
        { id: 'a1', text: 'Bạn / Anh / Chị', isCorrect: false },
        { id: 'a2', text: 'Tôi / Tớ / Mình', isCorrect: true },
        { id: 'a3', text: 'Cô ấy / Cậu ấy', isCorrect: false },
      ],
    },
    {
      id: 'lp5-q2',
      type: 'kana',
      instruction: 'Sắp xếp các chữ cái để tạo thành từ "Học sinh" (gakusei):',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop',
      characters: ['く', 'が', 'い', 'せ', 'の', 'た'],
      correctOrder: ['が', 'く', 'せ', 'い'],
    },
    {
      id: 'lp5-q3',
      type: 'picture',
      instruction: 'Chọn hình ảnh phù hợp cho từ: 先生 (せんせい - Giáo viên)',
      word: '先生',
      images: [
        { id: 'i1', text: 'Giáo viên', imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=200&h=200&fit=crop', isCorrect: true },
        { id: 'i2', text: 'Học sinh', imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=200&h=200&fit=crop', isCorrect: false },
        { id: 'i3', text: 'Mèo', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop', isCorrect: false },
        { id: 'i4', text: 'Chó', imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', isCorrect: false },
      ],
    },
    {
      id: 'lp5-q4',
      type: 'kanji-fill',
      instruction: 'Chọn trợ từ thích hợp điền vào chỗ trống:',
      sentence: 'わたし ＿ ゆう です。',
      blanks: [0],
      kanjiBank: ['は', 'が', 'を', 'の'],
      correctFills: { 0: 'は' },
    },
    {
      id: 'lp5-q5',
      type: 'vocab',
      instruction: 'Chọn câu dịch đúng cho: "Tôi là học sinh."',
      imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=300&h=200&fit=crop',
      answers: [
        { id: 'a4', text: 'わたしは学生(がくせい)です。', isCorrect: true },
        { id: 'a5', text: 'わたしは先生(せんせい)です。', isCorrect: false },
        { id: 'a6', text: 'あなたはいぬです。', isCorrect: false },
      ],
    },
  ]
};

// Legacy compatibility
export const MOCK_VOCAB_QUESTIONS = LESSON_QUESTIONS.lp5.filter(q => q.type === 'vocab') as VocabQuestion[];
export const MOCK_KANA_QUESTIONS = LESSON_QUESTIONS.lp5.filter(q => q.type === 'kana') as KanaQuestion[];
export const MOCK_PICTURE_QUESTIONS = LESSON_QUESTIONS.lp5.filter(q => q.type === 'picture') as PictureQuestion[];
export const MOCK_KANJI_FILL_QUESTIONS = LESSON_QUESTIONS.lp5.filter(q => q.type === 'kanji-fill') as KanjiFillQuestion[];
