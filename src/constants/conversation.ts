/**
 * Hằng số hiển thị cho tính năng Luyện hội thoại.
 *
 * Nguyên tắc màu sắc quan trọng nhất ở đây: **KHÔNG dùng màu đỏ báo lỗi cho
 * `off_topic` và `wrong_time`.** Trong hai trường hợp đó câu tiếng Nhật của
 * người học thường là ĐÚNG - chỉ là chưa hợp ngữ cảnh hoặc chưa hợp bước.
 * Tô đỏ sẽ dạy họ rằng mình viết sai, trong khi thực tế không phải vậy.
 * Đỏ chỉ dành cho `invalid_input` (rác / sai hệ chữ viết) - lỗi thật sự.
 */

import { Colors } from "@/constants/theme";
import type {
  ConversationOutcome,
  GrammarNoteKind,
} from "@/types/conversation";

export interface OutcomeStyle {
  /** Màu viền trái của bong bóng bot. */
  accent: string;
  icon: string;
  /** Nhãn ngắn hiện trên bong bóng; chuỗi rỗng = không hiện nhãn nào. */
  label: string;
}

export const OUTCOME_STYLES: Record<ConversationOutcome, OutcomeStyle> = {
  advanced: { accent: Colors.success, icon: "checkmark-circle", label: "" },
  completed: { accent: Colors.accent, icon: "trophy", label: "Hoàn thành" },
  repeat: { accent: Colors.success, icon: "checkmark-circle", label: "" },

  // Xanh dương = "thông tin", không phải lỗi. Câu vẫn đúng tiếng Nhật.
  off_topic: {
    accent: "#3B82F6",
    icon: "compass-outline",
    label: "Lạc chủ đề",
  },
  wrong_time: {
    accent: "#3B82F6",
    icon: "time-outline",
    label: "Chưa hợp bước này",
  },

  // Vàng = "cần làm rõ thêm", vẫn không phải lỗi của người học.
  clarify: {
    accent: Colors.warning,
    icon: "help-circle-outline",
    label: "Cần nói rõ hơn",
  },
  not_understood: {
    accent: Colors.warning,
    icon: "ear-outline",
    label: "Chưa nghe rõ",
  },

  // Đỏ chỉ dùng ở đây: đầu vào thực sự không dùng được.
  invalid_input: {
    accent: Colors.error,
    icon: "alert-circle-outline",
    label: "Chưa đọc được",
  },
};

export interface GrammarNoteStyle {
  accent: string;
  icon: string;
  title: string;
}

export const GRAMMAR_NOTE_STYLES: Record<GrammarNoteKind, GrammarNoteStyle> = {
  spelling: {
    accent: Colors.error,
    icon: "create-outline",
    title: "Chính tả",
  },
  politeness: {
    accent: "#3B82F6",
    icon: "information-circle-outline",
    title: "Mức lịch sự",
  },
  praise: {
    accent: Colors.success,
    icon: "sparkles",
    title: "Dùng hay lắm",
  },
};

/**
 * Sau ngần này lượt hỏng liên tiếp thì hiện gợi ý một cách nổi bật.
 * Khớp với `STUCK_AFTER` trong `ai-service/src/nihongo_ai/dialogue.py`.
 */
export const HINTS_BECOME_PROMINENT_AFTER = 2;
