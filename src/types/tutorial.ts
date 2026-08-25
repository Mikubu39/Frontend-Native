/**
 * Tutorial (coach-mark) types.
 *
 * Tour hướng dẫn lần đầu: một lớp phủ tối khoét lỗ quanh phần tử đang được
 * nói tới ("spotlight"), kèm linh vật Lottie đứng cạnh bong bóng giải thích.
 */

/** Định danh các phần tử có thể được "chiếu đèn". */
export type TutorialTargetId =
  | "lesson-node"
  | "tab-shop"
  | "tab-leaderboard"
  | "tab-quests"
  | "tab-friends"
  | "tab-more"
  | "review-mistakes"
  | "review-conversation"
  | "review-dictionary"
  | "review-extra";

/** Toạ độ tuyệt đối trong cửa sổ (kết quả của `measureInWindow`). */
export interface TutorialTargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Các file Lottie linh vật có sẵn trong `assets/animations`. */
export type TutorialMascot = "hi" | "happy" | "school" | "winner" | "confuse";

/** Bong bóng nằm trên hay dưới vùng sáng. `auto` = tự chọn theo chỗ trống. */
export type TutorialPlacement = "auto" | "top" | "bottom";

/** Hình dạng lỗ khoét quanh phần tử. */
export type TutorialSpotlightShape = "rounded" | "circle";

/** Đưa một phần tử (toạ độ cửa sổ) vào giữa khung nhìn của màn hình đang mở. */
export type TutorialScrollIntoView = (rect: TutorialTargetRect) => void;

export interface TutorialStep {
  /** Khoá ổn định, dùng cho testID và key. */
  id: string;
  /** `null` = bước không gắn với phần tử nào (màn chào / màn kết). */
  target: TutorialTargetId | null;
  /**
   * Màn hình chứa phần tử của bước này. Tour tự điều hướng tới đây trước khi
   * đo, nên một tour có thể đi xuyên nhiều màn.
   */
  route?: string;
  title: string;
  body: string;
  mascot: TutorialMascot;
  placement?: TutorialPlacement;
  /** Nới rộng lỗ khoét quanh phần tử, đơn vị px. Mặc định 8. */
  padding?: number;
  shape?: TutorialSpotlightShape;
  /** Nhãn nút chính. Mặc định "Tiếp tục". */
  ctaLabel?: string;
}

export interface TutorialContextValue {
  isActive: boolean;
  steps: TutorialStep[];
  stepIndex: number;
  currentStep: TutorialStep | null;
  /** Vùng sáng đã đo xong; `null` khi bước không có target hoặc chưa đo được. */
  spotlight: TutorialTargetRect | null;
  /** `null` khi còn đang đọc cờ từ storage. */
  hasSeenTutorial: boolean | null;
  registerTarget: (id: TutorialTargetId, node: unknown | null) => void;
  /**
   * Màn hình có vùng cuộn đăng ký hàm này để tour kéo được phần tử nằm ngoài
   * khung nhìn vào giữa màn trước khi chiếu sáng.
   */
  registerScroller: (fn: TutorialScrollIntoView | null) => void;
  /** Chạy tour bất kể đã xem hay chưa (dùng cho mục "Xem lại" ở Cài đặt). */
  startTutorial: () => void;
  /** Chỉ chạy nếu người dùng chưa từng xem. */
  maybeAutoStart: () => void;
  goNext: () => void;
  goBack: () => void;
  skipTutorial: () => void;
}
