/**
 * Shop design tokens — the "night market" palette.
 *
 * The shop reads as a place inside the app rather than another settings list,
 * so its counter keeps a fixed lacquer surface in both themes while the
 * browsing area follows the user's light/dark preference.
 */

import type { EffectType } from "@/types/api";
import type { EffectMeta, ItemRarity, RarityStyle, Shelf } from "@/types/shop";

/** Lacquer-and-gold surface used by the shop counter. Theme-independent. */
export const ShopPalette = {
  lacquer: "#241748",
  lacquerDeep: "#120B26",
  lacquerEdge: "rgba(255, 255, 255, 0.10)",
  goldLeaf: "#F5C451",
  goldDeep: "#A97516",
  goldWash: "rgba(245, 196, 81, 0.14)",
  /** Torii red, reserved for "can't afford" and limited-time seals. */
  vermilion: "#E2453C",
  inkOnLacquer: "#F4EFFF",
  inkOnLacquerMuted: "rgba(244, 239, 255, 0.62)",
} as const;

export const RARITY_STYLES: Record<ItemRarity, RarityStyle> = {
  common: {
    label: "Thường",
    accent: "#8B93A7",
    accentDeep: "#5B6273",
    wash: "rgba(139, 147, 167, 0.14)",
    foil: false,
  },
  rare: {
    label: "Hiếm",
    accent: "#3FA9F5",
    accentDeep: "#1D6FA8",
    wash: "rgba(63, 169, 245, 0.14)",
    foil: false,
  },
  epic: {
    label: "Sử thi",
    accent: "#A855F7",
    accentDeep: "#6D28D9",
    wash: "rgba(168, 85, 247, 0.16)",
    foil: false,
  },
  legendary: {
    label: "Huyền thoại",
    accent: "#F5C451",
    accentDeep: "#A97516",
    wash: "rgba(245, 196, 81, 0.11)",
    foil: true,
  },
};

/**
 * Price bands that map the backend catalogue (100–1000 xu) onto four tiers.
 * Limited-time items are promoted one tier in `getItemRarity`.
 */
export const RARITY_PRICE_BANDS: { min: number; rarity: ItemRarity }[] = [
  { min: 800, rarity: "legendary" },
  { min: 400, rarity: "epic" },
  { min: 200, rarity: "rare" },
  { min: 0, rarity: "common" },
];

export const EFFECT_META: Record<EffectType, EffectMeta> = {
  STREAK_FREEZE: { icon: "snow", label: "Giữ chuỗi", unit: "days" },
  ENERGY_REFILL: { icon: "flash", label: "Hồi năng lượng", unit: "energy" },
  DOUBLE_XP: { icon: "trending-up", label: "Nhân đôi EXP", unit: "minutes" },
  DOUBLE_COIN: { icon: "cash", label: "Nhân đôi xu", unit: "minutes" },
  TIMER_BOOST: { icon: "timer", label: "Thêm giờ làm bài", unit: "minutes" },
  AVATAR_FRAME: { icon: "aperture", label: "Khung avatar", unit: "none" },
  BADGE: { icon: "ribbon", label: "Huy hiệu", unit: "none" },
  THEME: { icon: "color-palette", label: "Giao diện", unit: "none" },
};

export const SHELVES: Shelf[] = [
  { key: "CONSUMABLE", label: "Vật phẩm", icon: "cube" },
  { key: "POWERUP", label: "Tăng lực", icon: "flame" },
  { key: "COSMETIC", label: "Trang trí", icon: "sparkles" },
  { key: "VAULT", label: "Túi đồ", icon: "briefcase" },
];
