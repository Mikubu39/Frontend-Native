/**
 * Hằng số hiển thị cho tính năng Luyện hội thoại.
 *
 * Nguyên tắc màu sắc quan trọng nhất ở đây: **chỉ `error` mới được tô đỏ.**
 * `suggestion` nghĩa là câu của người học ĐÚNG, chỉ là có cách nói tự nhiên
 * hơn - tô đỏ nó sẽ dạy họ rằng mình viết sai trong khi thực tế không phải
 * vậy, và đó là cách nhanh nhất khiến người mới học ngại mở miệng.
 */

import { Colors } from "@/constants/theme";
import type {
  CorrectionCategory,
  CorrectionSeverity,
} from "@/types/conversation";

/**
 * Độ dài một phiên luyện, tính bằng giây.
 *
 * Khớp với `SESSION_MINUTES` trong `ai-service/src/nihongo_ai/prompts.py`.
 * Server vẫn là nơi quyết định thật sự (nó trả `durationSeconds` ở `/start`);
 * hằng số này chỉ là giá trị dự phòng để đồng hồ có gì đó mà chạy trước khi
 * phản hồi đầu tiên về tới.
 */
export const SESSION_DURATION_SECONDS = 90;

/**
 * Còn dưới ngần này giây thì đồng hồ chuyển sang màu cảnh báo và AI bắt đầu
 * lái hội thoại về phần kết.
 */
export const WRAP_UP_WARNING_SECONDS = 20;

/** Id quy ước cho chủ đề người học tự nhập. Khớp với `CUSTOM_TOPIC_ID` ở server. */
export const CUSTOM_TOPIC_ID = "custom";

/** Dài hơn mức này thì gần như chắc chắn là dán nhầm cả đoạn văn. */
export const MAX_CUSTOM_TOPIC_LENGTH = 80;

export interface CorrectionStyle {
  accent: string;
  icon: string;
  title: string;
}

export const CORRECTION_STYLES: Record<CorrectionSeverity, CorrectionStyle> = {
  // Đỏ CHỈ dùng ở đây: câu thật sự sai.
  error: {
    accent: Colors.error,
    icon: "create-outline",
    title: "Cần sửa",
  },
  // Xanh dương = "thông tin", không phải lỗi. Câu vẫn đúng tiếng Nhật.
  suggestion: {
    accent: "#3B82F6",
    icon: "bulb-outline",
    title: "Nói hay hơn",
  },
  praise: {
    accent: Colors.success,
    icon: "sparkles",
    title: "Dùng hay lắm",
  },
};

/** Nhãn tiếng Việt cho từng loại lỗi, hiện dạng chip nhỏ trên thẻ góp ý. */
export const CORRECTION_CATEGORY_LABELS: Record<CorrectionCategory, string> = {
  grammar: "Ngữ pháp",
  vocabulary: "Từ vựng",
  politeness: "Mức lịch sự",
  naturalness: "Độ tự nhiên",
  spelling: "Chính tả",
};

/**
 * Ngưỡng điểm để đổi màu vòng điểm ở bản tổng kết.
 *
 * Cố ý dễ tính: người mới học nói hết được 5 phút bằng tiếng Nhật đã là thành
 * tựu, và một con số đỏ lòm ở cuối phiên sẽ xoá sạch cảm giác đó.
 */
export const SCORE_THRESHOLDS = {
  good: 75,
  fair: 50,
} as const;

export function scoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return Colors.success;
  if (score >= SCORE_THRESHOLDS.fair) return Colors.accent;
  return Colors.error;
}

/** `125` -> `"2:05"`. Đồng hồ đếm ngược không bao giờ hiện số âm. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
