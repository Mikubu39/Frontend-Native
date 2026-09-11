/**
 * Kho từ vựng dùng chung và lịch ôn tập ngắt quãng (SM-2).
 *
 * Cùng một nguồn dữ liệu phục vụ ba việc: tra nghĩa khi bấm giữ vào chữ Nhật,
 * sổ tay "từ đã học", và hàng đợi "hôm nay cần ôn gì".
 */

// Khớp đúng enum `vocabulary.item_type` của backend. "PHRASE" là cụm/câu trọn vẹn
// (「また明日」, 「これはいくらですか」) — trước đây thiếu ở đây nên FE không phân biệt
// được cụm với từ đơn.
export type VocabularyItemType = "VOCAB" | "KANJI" | "KANA" | "PHRASE";

export interface VocabularyItem {
  id: number;
  itemType: VocabularyItemType;
  /** Mặt chữ hiển thị: 「おちゃ」. */
  surface: string;
  /** Cách đọc kana, chỉ có khi `surface` chứa kanji. */
  reading?: string | null;
  romaji?: string | null;
  meaningVn: string;
  audioUrl?: string | null;

  /** `null` khi người học chưa từng gặp từ này. */
  firstLearnedAt?: string | null;
  nextDueAt?: string | null;
  repetitions?: number | null;
  /** Đã tới hạn ôn chưa — server tính sẵn để client khỏi phải so giờ. */
  due?: boolean;
}

/** Trả về từ `/due` và `/learned`: con số cho badge + danh sách từ. */
export interface VocabularyListResponse {
  /** Số từ đã tới hạn ôn — dùng cho badge "N từ cần ôn". */
  dueCount: number;
  /** Tổng số từ đã gặp ít nhất một lần. */
  learnedCount: number;
  items: VocabularyItem[];
}

/** Kết quả sau khi nộp một phiên ôn. */
export interface VocabularyReviewResult {
  reviewedCount: number;
  correctCount: number;
  /** Số từ CÒN LẠI đang tới hạn, để cập nhật badge ngay. */
  remainingDue: number;
}
