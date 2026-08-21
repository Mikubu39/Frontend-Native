/**
 * Shop presentation types.
 *
 * The API DTOs live in `api.ts`. These are the view-model types the shop UI
 * derives from them (rarity tiers, shelves, buff state).
 */

import type { EffectType, ItemType, ShopItemDto } from "./api";

/** Rarity tier derived from an item's coin price. Purely presentational. */
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface RarityStyle {
  /** Vietnamese label stamped on the item frame. */
  label: string;
  /** Frame / glow accent. */
  accent: string;
  /** Darker companion used for the bevel under the accent. */
  accentDeep: string;
  /** Translucent fill behind the item icon. */
  wash: string;
  /** Legendary items get a foil sweep; the rest stay still. */
  foil: boolean;
}

export interface EffectMeta {
  /** Ionicons glyph shown when the item has no usable artwork. */
  icon: string;
  /** Short human name for the effect ("Nhân đôi EXP"). */
  label: string;
  /** How `effectValue` should be read for this effect. */
  unit: "minutes" | "days" | "energy" | "none";
}

/** The shelves a player can browse. `vault` is their own inventory. */
export type ShelfKey = ItemType | "VAULT";

export interface Shelf {
  key: ShelfKey;
  label: string;
  icon: string;
}

/** A powerup currently ticking down on the player's account. */
export interface ActiveBuff {
  effectType: EffectType;
  expiresAt: string;
}

/** A shop item joined with how many of it the player already owns. */
export interface ShelfEntry {
  item: ShopItemDto;
  rarity: ItemRarity;
  owned: number;
  equipped: boolean;
  inventoryId: number | null;
}
