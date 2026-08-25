/**
 * Kiểu dữ liệu cho tính năng Luyện hội thoại AI.
 *
 * Khớp 1-1 với schema của dịch vụ Python ở `ai-service/src/nihongo_ai/api.py`.
 * Dịch vụ đó là hệ thống PHI TRẠNG THÁI: nó không nhớ phiên nào cả, nên client
 * phải tự giữ toàn bộ lịch sử hội thoại và đồng hồ đếm ngược, rồi gửi lại ở
 * mỗi lượt.
 */

/** Một câu thoại song ngữ (tiếng Nhật + bản dịch tiếng Việt). */
export interface ConversationUtterance {
  ja: string;
  vi: string;
}

/** Tóm tắt một chủ đề, dùng cho màn hình chọn chủ đề. */
export interface ConversationTopic {
  id: string;
  title: string;
  titleJa: string;
  level: string;
  /** Tên icon Ionicons do backend chỉ định. */
  icon: string;
  color: string;
  description: string;
  goal: string;
  personaName: string;
  personaEmoji: string;
}

/**
 * Mức độ của một góp ý.
 *
 * `suggestion` KHÔNG phải lỗi - câu vẫn đúng, chỉ là có cách nói hay hơn. Phân
 * biệt rạch ròi với `error` là chuyện quan trọng: tô đỏ một câu vốn đúng sẽ
 * dạy người học điều sai và làm họ ngại nói.
 */
export type CorrectionSeverity = "error" | "suggestion" | "praise";

export type CorrectionCategory =
  "grammar" | "vocabulary" | "politeness" | "naturalness" | "spelling";

/** Góp ý cho một câu người học vừa nói. */
export interface Correction {
  severity: CorrectionSeverity;
  category: CorrectionCategory;
  /** Nguyên văn phần người học đã viết. */
  original: string;
  /** Bản sửa; rỗng khi đây là lời khen. */
  suggestion: string;
  explanationVi: string;
}

/**
 * Một lượt trong lịch sử gửi lên server.
 *
 * Cố ý gọn hơn `ChatMessage`: server chỉ cần biết ai nói gì, không cần id hay
 * góp ý - và mỗi byte thừa đều bị nhân lên theo số lượt của cả phiên.
 */
export interface ConversationHistoryTurn {
  role: "ai" | "user";
  text: string;
}

export interface ConversationStartResponse {
  topic: ConversationTopic;
  reply: ConversationUtterance;
  hints: ConversationUtterance[];
  /** Độ dài phiên do server quyết định, tính bằng giây. */
  durationSeconds: number;
}

export interface ConversationRespondRequest {
  topicId: string;
  customTopic?: string;
  text: string;
  history: ConversationHistoryTurn[];
  /** Server dùng để nhắc AI lái hội thoại về phần kết khi sắp hết giờ. */
  remainingSeconds: number;
}

export interface ConversationRespondResponse {
  reply: ConversationUtterance;
  hints: ConversationUtterance[];
  corrections: Correction[];
  /** false khi AI không hiểu được câu vừa rồi hoặc câu lạc hẳn chủ đề. */
  understood: boolean;
}

export interface ConversationSummaryRequest {
  topicId: string;
  customTopic?: string;
  history: ConversationHistoryTurn[];
  durationSeconds: number;
}

/** Một lỗi cụ thể trong bản tổng kết, kèm câu đã sửa. */
export interface SummaryMistake {
  original: string;
  corrected: string;
  explanationVi: string;
  category: CorrectionCategory;
  severity: "error" | "suggestion";
}

/** Điểm ngữ pháp nên ôn lại, rút ra từ chính lỗi trong phiên. */
export interface SummaryGrammarPoint {
  pattern: string;
  explanationVi: string;
  exampleJa: string;
  exampleVi: string;
}

/** Câu đúng ngữ pháp nhưng người Nhật không nói vậy. */
export interface SummaryNaturalnessTip {
  instead: string;
  prefer: string;
  whyVi: string;
}

/** Bản tổng kết cuối phiên - lý do tồn tại của giới hạn 5 phút. */
export interface ConversationSummary {
  overallVi: string;
  /** 0-100. */
  score: number;
  strengths: string[];
  mistakes: SummaryMistake[];
  grammarPoints: SummaryGrammarPoint[];
  naturalnessTips: SummaryNaturalnessTip[];
  nextFocus: string[];
  turnCount: number;
  durationSeconds: number;
}

/** Một bong bóng chat trong lịch sử hội thoại. */
export interface ChatMessage {
  id: string;
  author: "bot" | "user";
  ja: string;
  vi: string;
  /** Chỉ có ở tin nhắn của NGƯỜI HỌC: góp ý cho chính câu đó. */
  corrections?: Correction[];
}
