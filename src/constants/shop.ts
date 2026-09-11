/**
 * Shop design tokens — the "night market" palette.
 *
 * The shop reads as a place inside the app rather than another settings list,
 * so its counter keeps a fixed lacquer surface in both themes while the
 * browsing area follows the user's light/dark preference.
 */

import type { EffectType } from "@/types/api";
import type { EffectMeta, ItemRarity, RarityStyle, Shelf } from "@/types/shop";

/**
 * Lacquer-and-gold surface used by the shop counter. Theme-independent.
 *
 * Every value is tuned for the lacquer, because that is the shop's own
 * material and the only surface guaranteed to be dark. Components that paint
 * these on the shelves — which follow the user's theme — run them through
 * `readableOn` first.
 *
 * These were violet (#241748 / #120B26) with a Tailwind sky and violet in the
 * rarity ladder, so the shop ran a palette of its own while the rest of the
 * app is ai-zome indigo, shu vermillion and kogane gold. The counter is now
 * indigo lacquer, which is both the app's own dye and a real urushi colour.
 */
export const ShopPalette = {
  /** Ai indigo, matching `Colors.primaryDark`. */
  lacquer: "#2A3760",
  lacquerDeep: "#171E35",
  lacquerEdge: "rgba(255, 255, 255, 0.10)",
  /** Kogane gold leaf, 8.1:1 on the lacquer. Also the coin fill app-wide —
   *  the coin stays legible on cream through its `goldDeep` rim, not its face. */
  goldLeaf: "#E0AE4A",
  goldDeep: "#8D6821",
  goldWash: "rgba(224, 174, 74, 0.14)",
  /** Shu vermillion, reserved for "can't afford" and limited-time seals. */
  vermilion: "#DD6956",
  /** Warm paper white, matching `Colors.dark.text`. */
  inkOnLacquer: "#F5EFE3",
  inkOnLacquerMuted: "rgba(245, 239, 227, 0.62)",
} as const;

/**
 * The rarity ladder as a ladder of materials — stone, indigo dye, cinnabar,
 * gold leaf — rather than four unrelated hues. Each accent clears 4.5:1 on the
 * lacquer; `accentDeep` is the card's bottom edge, `wash` its tinted plate.
 */
export const RARITY_STYLES: Record<ItemRarity, RarityStyle> = {
  common: {
    label: "Thường",
    /** Ishi — stone. */
    accent: "#91897A",
    accentDeep: "#5F594E",
    wash: "rgba(145, 137, 122, 0.14)",
    foil: false,
  },
  rare: {
    label: "Hiếm",
    /** Ai — indigo dye, the app's own colour. */
    accent: "#7A88B7",
    accentDeep: "#3B4C82",
    wash: "rgba(122, 136, 183, 0.14)",
    foil: false,
  },
  epic: {
    label: "Sử thi",
    /** Shu — cinnabar, the hanko red. */
    accent: "#CE6F58",
    accentDeep: "#8C3626",
    wash: "rgba(206, 111, 88, 0.16)",
    foil: false,
  },
  legendary: {
    label: "Huyền thoại",
    /** Kogane — gold leaf. */
    accent: "#E0AE4A",
    accentDeep: "#8D6821",
    wash: "rgba(224, 174, 74, 0.11)",
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
  STREAK_FREEZE: { icon: "snow", label: "Đóng băng chuỗi", unit: "days" },
  ENERGY_REFILL: { icon: "flash", label: "Hồi năng lượng", unit: "energy" },
  DOUBLE_XP: { icon: "star", label: "Nhân đôi EXP", unit: "minutes" },
  DOUBLE_COIN: { icon: "disc", label: "Nhân đôi xu", unit: "minutes" },
  TIMER_BOOST: { icon: "timer", label: "Thêm giờ làm bài", unit: "minutes" },
};

export const SHELVES: Shelf[] = [
  { key: "CONSUMABLE", label: "Vật phẩm", icon: "cube" },
  { key: "POWERUP", label: "Tăng lực", icon: "flame" },
  { key: "VAULT", label: "Túi đồ", icon: "briefcase" },
];
