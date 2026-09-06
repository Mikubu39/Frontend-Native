import { evaluateStreak, formatStreakDate, getDiffInDays } from "../streak";

describe("streak utility", () => {
  const mockToday = new Date("2026-09-03T10:00:00Z");

  describe("formatStreakDate", () => {
    it("formats dates as YYYY-MM-DD", () => {
      expect(formatStreakDate(new Date(2026, 8, 3))).toBe("2026-09-03");
      expect(formatStreakDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
  });

  describe("getDiffInDays", () => {
    it("calculates positive day difference accurately", () => {
      expect(getDiffInDays("2026-09-01", "2026-09-03")).toBe(2);
      expect(getDiffInDays("2026-08-31", "2026-09-01")).toBe(1);
    });

    it("returns 0 for identical dates", () => {
      expect(getDiffInDays("2026-09-03", "2026-09-03")).toBe(0);
    });
  });

  describe("evaluateStreak", () => {
    it("returns UNLIT with 0 streak when lastStreakDate is null or streak is 0", () => {
      const res = evaluateStreak(5, null, 1, mockToday);
      expect(res).toEqual({
        streak: 0,
        streakStatus: "UNLIT",
        studiedToday: false,
        frozenToday: false,
      });

      const res2 = evaluateStreak(0, "2026-09-03", 1, mockToday);
      expect(res2).toEqual({
        streak: 0,
        streakStatus: "UNLIT",
        studiedToday: false,
        frozenToday: false,
      });
    });

    it("returns ACTIVE when user already studied today (lastStreakDate == today)", () => {
      const res = evaluateStreak(3, "2026-09-03", 0, mockToday);
      expect(res).toEqual({
        streak: 3,
        streakStatus: "ACTIVE",
        studiedToday: true,
        frozenToday: false,
      });
    });

    it("returns UNLIT with preserved streak when user studied yesterday (diff = 1)", () => {
      const res = evaluateStreak(7, "2026-09-02", 0, mockToday);
      expect(res).toEqual({
        streak: 7,
        streakStatus: "UNLIT",
        studiedToday: false,
        frozenToday: false,
      });
    });

    it("returns FROZEN when user missed yesterday (diff = 2) but has Streak Freeze", () => {
      const res = evaluateStreak(10, "2026-09-01", 1, mockToday);
      expect(res).toEqual({
        streak: 10,
        streakStatus: "FROZEN",
        studiedToday: false,
        frozenToday: true,
      });
    });

    it("returns UNLIT with 0 streak when user missed yesterday (diff = 2) but has 0 Streak Freeze", () => {
      const res = evaluateStreak(10, "2026-09-01", 0, mockToday);
      expect(res).toEqual({
        streak: 0,
        streakStatus: "UNLIT",
        studiedToday: false,
        frozenToday: false,
      });
    });

    it("returns UNLIT with 0 streak when user missed multiple days (diff > 2) even with 1 Streak Freeze", () => {
      // Bỏ lỡ 3 ngày (từ 2026-08-30 đến 2026-09-03 là 4 ngày diff)
      const res = evaluateStreak(2, "2026-08-30", 1, mockToday);
      expect(res).toEqual({
        streak: 0,
        streakStatus: "UNLIT",
        studiedToday: false,
        frozenToday: false,
      });
    });
  });
});
