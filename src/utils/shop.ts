/**
 * Pure helpers for the shop screen: rarity derivation, stat lines, countdowns.
 */

import { EFFECT_META, RARITY_PRICE_BANDS } from "@/constants/shop";
import type { InventoryItemDto, ShopItemDto } from "@/types/api";
import type { ItemRarity, ShelfEntry } from "@/types/shop";
import { resolveMediaUrlOrNull } from "@/utils/media";

const RARITY_ORDER: ItemRarity[] = ["common", "rare", "epic", "legendary"];

/**
 * Rarity comes from what the item actually costs, so the catalogue stays in
 * sync with the shop UI when the backend adds or reprices items.
 * Limited-time items are promoted one tier — scarcity is part of rarity.
 */
export function getItemRarity(item: ShopItemDto): ItemRarity {
  const band =
    RARITY_PRICE_BANDS.find((b) => item.priceCoins >= b.min) ??
    RARITY_PRICE_BANDS[RARITY_PRICE_BANDS.length - 1];

  if (!item.limitedTime) return band.rarity;

  const promoted = RARITY_ORDER.indexOf(band.rarity) + 1;
  return RARITY_ORDER[Math.min(promoted, RARITY_ORDER.length - 1)];
}

/** "1.000" — grouped so four-digit prices stay readable on a small tile. */
export function formatCoins(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(amount)));
}

/**
 * The one-line stat a player compares items by ("30 phút", "Hồi đầy 25").
 */
export function describeEffect(item: ShopItemDto): string | null {
  const meta = EFFECT_META[item.effectType];
  if (!meta) return null;

  switch (meta.unit) {
    case "minutes":
      return item.effectValue >= 60
        ? `${Math.round((item.effectValue / 60) * 10) / 10} giờ`
        : `${item.effectValue} phút`;
    case "days":
      return `${item.effectValue} lượt`;
    case "energy":
      return `Hồi đầy ${item.effectValue}`;
    default:
      return null;
  }
}

/** "04:31" under an hour, "1:12:05" above it. Returns null once expired. */
export function formatCountdown(msRemaining: number): string | null {
  if (msRemaining <= 0) return null;

  const total = Math.floor(msRemaining / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * The backend seeds relative paths (`/icons/streak_freeze.png`) that the app
 * has no host for, so only absolute URLs are treated as loadable artwork —
 * everything else falls back to the effect glyph.
 */
export function resolveItemArtwork(iconUrl: string | null): string | null {
  // Backend trả đường dẫn tương đối (`/uploads/images/shop/...`) nên phải ghép
  // base URL, nếu không toàn bộ icon cửa hàng sẽ rơi về icon mặc định.
  return resolveMediaUrlOrNull(iconUrl);
}

/** Joins the catalogue with the player's inventory into one view model. */
export function buildShelfEntries(
  items: ShopItemDto[],
  inventory: InventoryItemDto[],
): ShelfEntry[] {
  return items.map((item) => {
    const owned = inventory.find((inv) => inv.itemId === item.id);
    return {
      item,
      rarity: getItemRarity(item),
      owned: owned?.quantity ?? 0,
      inventoryId: owned?.inventoryId ?? null,
    };
  });
}

/**
 * The item spotlighted on the counter: a limited-time drop if one is running,
 * otherwise the rarest thing on the shelves.
 */
export function pickFeaturedItem(items: ShopItemDto[]): ShopItemDto | null {
  if (items.length === 0) return null;

  const limited = items.filter((i) => i.limitedTime);
  const pool = limited.length > 0 ? limited : items;

  return pool.reduce((best, current) =>
    current.priceCoins > best.priceCoins ? current : best,
  );
}

const SHOP_ITEM_NAME_MAP: Record<string, string> = {
  "Streak Freeze": "Đóng băng chuỗi",
  "Energy Refill": "Bình hồi năng lượng",
  "Double XP Boost (30 phút)": "Nhân đôi EXP (30 phút)",
  "Double Coin Boost (30 phút)": "Nhân đôi xu (30 phút)",
  "Timer Boost (10 phút)": "Thêm giờ làm bài (10 phút)",
  "Khung avatar: Sakura": "Khung ảnh đại diện: Sakura",
  "Khung avatar: Fuji": "Khung ảnh đại diện: Fuji",
  "Khung avatar: Neon Tokyo": "Khung ảnh đại diện: Neon Tokyo",
  "Chủ đề: Dark Mode": "Chủ đề: Giao diện tối",
  "Chủ đề: Sakura Pink": "Chủ đề: Hồng Sakura",
};

/**
 * Chuẩn hóa tên vật phẩm hiển thị trên UI sang tiếng Việt thân thiện.
 */
export function formatItemName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (SHOP_ITEM_NAME_MAP[trimmed]) {
    return SHOP_ITEM_NAME_MAP[trimmed];
  }
  return trimmed
    .replace(/^Khung avatar:/i, "Khung ảnh đại diện:")
    .replace(/Dark Mode/i, "Giao diện tối")
    .replace(/Streak Freeze/i, "Đóng băng chuỗi")
    .replace(/Energy Refill/i, "Bình hồi năng lượng");
}

/**
 * Chuẩn hóa mô tả vật phẩm hiển thị trên UI sang tiếng Việt sạch sẽ.
 */
export function formatItemDescription(description?: string | null): string {
  if (!description) return "";
  return description
    .replace(/Timed Review/g, "Ôn tập tính giờ")
    .replace(/avatar/g, "ảnh đại diện")
    .replace(/Streak Freeze/g, "Đóng băng chuỗi")
    .replace(/Coin/g, "xu");
}
