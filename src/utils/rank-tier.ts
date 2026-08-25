/**
 * Presentation-only color ramp for rank tiers (Đồng → Bạc → Vàng → ...).
 * The backend only sends `orderIndex`/`rankId` + a name — no color/icon —
 * so tiers are mapped locally by position. Cycles/clamps past the last
 * defined tier instead of guessing new backend data.
 */

export interface RankTierStyle {
  gradient: [string, string];
  solid: string;
}

const RANK_TIERS: RankTierStyle[] = [
  { gradient: ["#D8A35F", "#B87333"], solid: "#B87333" }, // Đồng
  { gradient: ["#D7DEEA", "#9CA7BA"], solid: "#9CA7BA" }, // Bạc
  { gradient: ["#FFD966", "#F5A623"], solid: "#F5A623" }, // Vàng
  { gradient: ["#7DE0FF", "#38BDF8"], solid: "#38BDF8" }, // Bạch Kim
  { gradient: ["#C4A6FF", "#8B5CF6"], solid: "#8B5CF6" }, // Kim Cương
  { gradient: ["#FF8CD9", "#E91E8E"], solid: "#E91E8E" }, // Cao thủ
];

/** `orderIndex` (or `rankId`) is 1-based from the backend. */
export function getRankTierStyle(orderIndex: number): RankTierStyle {
  const index = Math.min(Math.max(orderIndex - 1, 0), RANK_TIERS.length - 1);
  return RANK_TIERS[index];
}
