export type StreakStatus = "ACTIVE" | "UNLIT" | "FROZEN";

export interface StreakEvaluation {
  streak: number;
  streakStatus: StreakStatus;
  studiedToday: boolean;
  frozenToday: boolean;
}

/**
 * Định dạng Date thành chuỗi YYYY-MM-DD theo giờ địa phương
 */
export function formatStreakDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Tính toán số ngày chênh lệch giữa 2 chuỗi ngày YYYY-MM-DD
 */
export function getDiffInDays(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Đánh giá trạng thái streak 3 cấp độ chuẩn Duolingo:
 * - ACTIVE: Đã học hôm nay (🔥 Lửa cam sáng rực rỡ)
 * - UNLIT: Chưa học hôm nay (🩶 Lửa xám mờ / tối đi)
 * - FROZEN: Đang đóng băng (❄️ Lửa xanh băng tuyết khi hôm qua được Freeze bảo vệ)
 *
 * Đồng thời tự động phát hiện streak đã vỡ (quá hạn nhiều ngày không có Freeze) để reset về 0.
 */
export function evaluateStreak(
  rawStreak: number,
  lastStreakDate: string | null | undefined,
  freezeCount: number,
  currentDate: Date = new Date(),
): StreakEvaluation {
  const safeStreak = Math.max(0, rawStreak || 0);
  const safeFreezeCount = Math.max(0, freezeCount || 0);

  if (!lastStreakDate || safeStreak === 0) {
    return {
      streak: 0,
      streakStatus: "UNLIT",
      studiedToday: false,
      frozenToday: false,
    };
  }

  const todayStr = formatStreakDate(currentDate);

  // Đã học hôm nay
  if (lastStreakDate === todayStr) {
    return {
      streak: safeStreak,
      streakStatus: "ACTIVE",
      studiedToday: true,
      frozenToday: false,
    };
  }

  const diffDays = getDiffInDays(lastStreakDate, todayStr);

  // Trường hợp hôm nay trước lastStreakDate (lỗi lệch giờ)
  if (diffDays <= 0) {
    return {
      streak: safeStreak,
      streakStatus: "ACTIVE",
      studiedToday: true,
      frozenToday: false,
    };
  }

  // Hôm qua đã học (diff = 1), hôm nay chưa học
  if (diffDays === 1) {
    return {
      streak: safeStreak,
      streakStatus: "UNLIT",
      studiedToday: false,
      frozenToday: false,
    };
  }

  // Hôm qua bỏ lỡ (diff = 2): nếu còn Freeze thì bảo vệ chuỗi
  if (diffDays === 2 && safeFreezeCount > 0) {
    return {
      streak: safeStreak,
      streakStatus: "FROZEN",
      studiedToday: false,
      frozenToday: true,
    };
  }

  // Bỏ lỡ từ 2 ngày trở lên không có Freeze -> Chuỗi đã đứt
  return {
    streak: 0,
    streakStatus: "UNLIT",
    studiedToday: false,
    frozenToday: false,
  };
}
