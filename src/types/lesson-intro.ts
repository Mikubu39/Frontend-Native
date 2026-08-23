/**
 * Kiểu dữ liệu cho phần "dạy trước khi hỏi" của một phiên học.
 *
 * Backend chỉ trả về câu hỏi, không trả về phần giảng bài. Nhưng mỗi câu hỏi
 * đều mang sẵn `metadataJson` mô tả đối tượng đang được hỏi (ký tự, từ vựng,
 * câu mẫu) kèm ảnh và âm thanh — đủ để dựng một bộ thẻ giới thiệu kiểu Duolingo
 * ngay ở phía client. Xem `@/utils/lesson-intro`.
 */

/** Loại nội dung được giới thiệu trên thẻ. */
export type TeachCardKind = "kana" | "vocab" | "phrase";

export interface TeachCard {
  /** Khoá duy nhất trong một phiên học (dùng làm React key). */
  id: string;
  kind: TeachCardKind;
  /** Ký tự / từ / câu tiếng Nhật, hiển thị lớn ở giữa thẻ. */
  japanese: string;
  /** Cách đọc bằng chữ Latinh (romaji). */
  romaji?: string;
  /** Nghĩa tiếng Việt. */
  meaning?: string;
  /** Đã được resolve sang URL tuyệt đối. */
  audioUrl?: string;
  /** Đã được resolve sang URL tuyệt đối. */
  imageUrl?: string;
}
