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
  { gradient: ["#8E9BC9", "#3B4C82"], solid: "#3B4C82" }, // Kim Cương
  { gradient: ["#E08268", "#BE4A34"], solid: "#BE4A34" }, // Cao thủ
];

/** `orderIndex` (or `rankId`) is 1-based from the backend. */
export function getRankTierStyle(orderIndex: number): RankTierStyle {
  const index = Math.min(Math.max(orderIndex - 1, 0), RANK_TIERS.length - 1);
  return RANK_TIERS[index];
}

const RANK_TRANSLATIONS: Record<string, string> = {
  bronze: "Đồng",
  silver: "Bạc",
  gold: "Vàng",
  platinum: "Bạch Kim",
  diamond: "Kim Cương",
  sapphire: "Ngọc Bích",
  ruby: "Hồng Ngọc",
  emerald: "Lục Bảo",
  amethyst: "Thạch Anh Tím",
  pearl: "Ngọc Trai",
  obsidian: "Hắc Diện Thạch",
};

/**
 * Dịch tên Rank từ Tiếng Anh (backend enum) sang Tiếng Việt hiển thị chuẩn.
 * Hỗ trợ fallback an toàn nếu chuỗi rỗng hoặc đã là tiếng Việt.
 */
export function translateRank(rankName: string | null | undefined): string {
  if (!rankName) return "Chưa xếp hạng";
  const trimmed = rankName.trim();
  return RANK_TRANSLATIONS[trimmed.toLowerCase()] || trimmed;
}
