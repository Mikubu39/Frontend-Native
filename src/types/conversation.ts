/**
 * Kiểu dữ liệu cho tính năng Luyện hội thoại AI.
 *
 * Khớp 1-1 với schema của dịch vụ Python ở `ai-service/src/nihongo_ai/api.py`.
 * Dịch vụ đó là hệ thống PHI TRẠNG THÁI: nó không nhớ phiên nào cả, nên client
 * phải tự giữ `state` và `consecutiveFailures` rồi gửi lại ở mỗi lượt.
 */

/** Một câu thoại song ngữ (tiếng Nhật + bản dịch tiếng Việt). */
export interface ConversationUtterance {
  ja: string;
  vi: string;
}

/** Tóm tắt một kịch bản, dùng cho màn hình chọn tình huống. */
export interface ConversationScenario {
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
 * Kết cục của một lượt. Đây là thứ quyết định UI hiển thị ra sao, nên nó được
 * phân biệt rất kỹ - đặc biệt là `off_topic` (lạc đề) và `wrong_time` (câu
 * đúng nhưng chưa hợp bước này). Gộp hai cái đó lại sẽ khiến người học tưởng
 * mình viết sai tiếng Nhật trong khi thực ra họ viết đúng.
 */
export type ConversationOutcome =
  | "advanced" // hiểu đúng, hội thoại tiến lên
  | "completed" // đã tới đích của kịch bản
  | "repeat" // hiểu đúng nhưng ở nguyên bước
  | "off_topic" // lạc khỏi tình huống
  | "wrong_time" // tiếng Nhật đúng, nhưng chưa hợp lúc này
  | "clarify" // AI phân vân giữa hai ý định
  | "not_understood" // độ tin cậy dưới ngưỡng
  | "invalid_input"; // bị tầng chặn từ chối (rác / sai chữ viết)

/** Loại góp ý ngữ pháp. `praise` là phần thưởng chứ không phải lỗi. */
export type GrammarNoteKind = "spelling" | "politeness" | "praise";

export interface GrammarNote {
  kind: GrammarNoteKind;
  messageVi: string;
  /** Bản sửa cụ thể, chỉ có với lỗi chính tả. */
  suggestion?: string | null;
  original?: string | null;
}

export interface ConversationStartRequest {
  scenarioId: string;
}

export interface ConversationStartResponse {
  scenarioId: string;
  state: string;
  reply: ConversationUtterance;
  hints: ConversationUtterance[];
}

export interface ConversationRespondRequest {
  scenarioId: string;
  state: string;
  text: string;
  consecutiveFailures: number;
}

export interface ConversationRespondResponse {
  outcome: ConversationOutcome;
  reply: ConversationUtterance;
  state: string;
  hints: ConversationUtterance[];
  intent: string | null;
  confidence: number;
  consecutiveFailures: number;
  /** Bật khi người học kẹt quá lâu - UI nên lộ luôn câu mẫu. */
  rescue: boolean;
  completed: boolean;
  grammarNotes: GrammarNote[];
  alternatives: { intent: string; probability: number }[];
}

/** Một bong bóng chat trong lịch sử hội thoại. */
export interface ChatMessage {
  id: string;
  author: "bot" | "user";
  ja: string;
  vi: string;
  /** Chỉ có ở tin nhắn của bot: kết cục của lượt vừa rồi. */
  outcome?: ConversationOutcome;
  grammarNotes?: GrammarNote[];
  confidence?: number;
}
