/**
 * useShop - Loads the shop catalogue plus the player's inventory and exposes
 * the buy / use / equip actions. Keeps the screen free of data plumbing.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGamification } from "@/contexts/gamification-context";
import { useToast } from "@/contexts/toast-context";
import { shopApi } from "@/services/api/shop";
import type { InventoryItemDto, ItemType, ShopItemDto } from "@/types/api";
import type { ShelfEntry, ShelfKey } from "@/types/shop";
import {
  buildShelfEntries,
  formatItemDescription,
  formatItemName,
  getItemRarity,
  pickFeaturedItem,
} from "@/utils/shop";

const EMPTY_CATALOGUE: Record<ItemType, ShopItemDto[]> = {
  CONSUMABLE: [],
  POWERUP: [],
};

export function useShop() {
  const { coins, activeEffects, setGamificationState, fetchGamificationData } =
    useGamification();
  const { showSuccess, showError } = useToast();

  const [catalogue, setCatalogue] =
    useState<Record<ItemType, ShopItemDto[]>>(EMPTY_CATALOGUE);
  const [inventory, setInventory] = useState<InventoryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  /** Set when a purchase is blocked; drives the "not enough coins" dialog. */
  const [shortfall, setShortfall] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [items, owned] = await Promise.all([
        shopApi.getShopItems(),
        shopApi.getInventory(),
      ]);
      setCatalogue({
        CONSUMABLE: items.CONSUMABLE ?? [],
        POWERUP: items.POWERUP ?? [],
      });
      setInventory(owned ?? []);
      setLoadFailed(false);
    } catch (error) {
      console.error("Failed to load shop:", error);
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  const buy = useCallback(
    async (item: ShopItemDto) => {
      if (coins < item.priceCoins) {
        setShortfall(item.priceCoins - coins);
        return false;
      }

      setPendingItemId(item.id);
      try {
        const result = await shopApi.buyItem(item.id);
        setGamificationState({ coins: result.currentCoins });
        showSuccess(
          "Đã mua " + formatItemName(item.name),
          formatItemDescription(result.message),
        );
        await load();
        return true;
      } catch (error: any) {
        showError("Không mua được", error?.message ?? "Thử lại sau ít phút.");
        return false;
      } finally {
        setPendingItemId(null);
      }
    },
    [coins, load, setGamificationState, showError, showSuccess],
  );

  const use = useCallback(
    async (entry: ShelfEntry) => {
      if (entry.inventoryId === null) return false;

      setPendingItemId(entry.item.id);
      try {
        const result = await shopApi.consumeItem(entry.inventoryId);
        showSuccess(
          "Đã dùng " + formatItemName(result.itemName),
          formatItemDescription(result.effectDescription),
        );
        // The effect lands on energy / streak / active buffs held globally.
        await Promise.all([fetchGamificationData(), load()]);
        return true;
      } catch (error: any) {
        showError("Không dùng được", error?.message ?? "Thử lại sau ít phút.");
        return false;
      } finally {
        setPendingItemId(null);
      }
    },
    [fetchGamificationData, load, showError, showSuccess],
  );

  // Cheapest first, so browsing a shelf walks up the rarity ladder.
  const shelves = useMemo(() => {
    const byPrice = (items: ShopItemDto[]) =>
      buildShelfEntries(items, inventory).sort(
        (a, b) => a.item.priceCoins - b.item.priceCoins,
      );

    return {
      CONSUMABLE: byPrice(catalogue.CONSUMABLE),
      POWERUP: byPrice(catalogue.POWERUP),
    };
  }, [catalogue, inventory]);

  const allEntries = useMemo(
    () => [...shelves.CONSUMABLE, ...shelves.POWERUP],
    [shelves],
  );

  /** Inventory joined back to the catalogue so vault rows keep rarity + stats. */
  const vault = useMemo(
    () => allEntries.filter((entry) => entry.owned > 0),
    [allEntries],
  );

  const featured = useMemo(() => {
    const item = pickFeaturedItem([
      ...catalogue.CONSUMABLE,
      ...catalogue.POWERUP,
    ]);
    if (!item) return null;
    return (
      allEntries.find((entry) => entry.item.id === item.id) ?? {
        item,
        rarity: getItemRarity(item),
        owned: 0,
        inventoryId: null,
      }
    );
  }, [allEntries, catalogue]);

  const findEntry = useCallback(
    (itemId: number | null): ShelfEntry | null =>
      itemId === null
        ? null
        : (allEntries.find((entry) => entry.item.id === itemId) ?? null),
    [allEntries],
  );

  const entriesFor = useCallback(
    (shelf: ShelfKey): ShelfEntry[] =>
      shelf === "VAULT" ? vault : shelves[shelf],
    [shelves, vault],
  );

  const clearShortfall = useCallback(() => setShortfall(null), []);

  return useMemo(
    () => ({
      coins,
      activeEffects,
      isLoading,
      isRefreshing,
      loadFailed,
      pendingItemId,
      shortfall,
      clearShortfall,
      vaultCount: vault.length,
      featured,
      entriesFor,
      findEntry,
      refresh,
      buy,
      use,
    }),
    [
      coins,
      activeEffects,
      isLoading,
      isRefreshing,
      loadFailed,
      pendingItemId,
      shortfall,
      clearShortfall,
      vault.length,
      featured,
      entriesFor,
      findEntry,
      refresh,
      buy,
      use,
    ],
  );
}
