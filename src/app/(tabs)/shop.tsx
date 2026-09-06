/**
 * Shop Screen
 *
 * A shop you walk into: a lacquer counter with the day's featured item and
 * your purse, shelves you switch between, and a purchase sheet for the deal
 * itself. Data and actions live in `useShop`; this file composes the layout.
 */

import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedScreen } from "@/components/ui/animated-screen";
import { StaggeredList } from "@/components/ui/staggered-list";
import {
  ItemSheet,
  ItemTile,
  PurseEmptyDialog,
  ShelfEmpty,
  ShelfTabs,
  ShopCounter,
  ShopSkeleton,
} from "@/components/shop";
import { Colors, FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useShop } from "@/hooks/use-shop";
import type { ShelfEntry, ShelfKey } from "@/types/shop";

const EMPTY_STATES: Record<
  ShelfKey,
  { icon: string; title: string; body: string }
> = {
  CONSUMABLE: {
    icon: "cube-outline",
    title: "Kệ đang trống",
    body: "Hàng mới sẽ lên kệ sớm. Kéo xuống để tải lại.",
  },
  POWERUP: {
    icon: "flame-outline",
    title: "Kệ đang trống",
    body: "Hàng mới sẽ lên kệ sớm. Kéo xuống để tải lại.",
  },

  VAULT: {
    icon: "briefcase-outline",
    title: "Túi đồ trống",
    body: "Mua vật phẩm ở các kệ bên cạnh, chúng sẽ nằm ở đây.",
  },
};

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const shop = useShop();

  const [shelf, setShelf] = useState<ShelfKey>("CONSUMABLE");
  /** The sheet tracks an id, not an entry, so it stays fresh after a purchase. */
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  const entries = shop.entriesFor(shelf);
  const openEntry = shop.findEntry(openItemId);

  const chipColor = isDark ? colors.backgroundElement : Colors.creamDark;

  const activeUntil = useMemo(() => {
    if (!openEntry) return null;
    const match = shop.activeEffects.find(
      (effect) => effect.effectType === openEntry.item.effectType,
    );
    return match && new Date(match.expiresAt).getTime() > Date.now()
      ? match.expiresAt
      : null;
  }, [openEntry, shop.activeEffects]);

  const openItem = (entry: ShelfEntry) => setOpenItemId(entry.item.id);

  const handleBuy = async (entry: ShelfEntry) => {
    const bought = await shop.buy(entry.item);
    if (!bought && shop.coins < entry.item.priceCoins) setOpenItemId(null);
  };

  const emptyState = EMPTY_STATES[shelf];

  return (
    <AnimatedScreen skipEntering>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ShopCounter
          coins={shop.coins}
          buffs={shop.activeEffects}
          featured={shop.featured}
          onOpenItem={openItem}
          topInset={insets.top}
        />

        <ShelfTabs
          active={shelf}
          onSelect={setShelf}
          vaultCount={shop.vaultCount}
          chipColor={chipColor}
          mutedColor={colors.textSecondary}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={shop.isRefreshing}
              onRefresh={shop.refresh}
              tintColor={Colors.primary}
            />
          }
        >
          {shop.isLoading ? (
            <ShopSkeleton blockColor={chipColor} />
          ) : shop.loadFailed ? (
            <ShelfEmpty
              icon="cloud-offline-outline"
              title="Không tải được cửa hàng"
              body="Kiểm tra kết nối rồi kéo xuống để thử lại."
              textColor={colors.text}
              mutedColor={colors.textSecondary}
              borderColor={colors.border}
            />
          ) : entries.length === 0 ? (
            <ShelfEmpty
              icon={emptyState.icon}
              title={emptyState.title}
              body={emptyState.body}
              textColor={colors.text}
              mutedColor={colors.textSecondary}
              borderColor={colors.border}
            />
          ) : (
            <>
              <Text style={[styles.shelfMeta, { color: colors.textSecondary }]}>
                {entries.length} món · xếp theo giá
              </Text>
              <View style={styles.grid}>
                <StaggeredList staggerDelay={45} style={styles.gridSlot}>
                  {entries.map((entry) => (
                    <ItemTile
                      key={entry.item.id}
                      entry={entry}
                      surface={colors.card}
                      textColor={colors.text}
                      mutedColor={colors.textSecondary}
                      coins={shop.coins}
                      onPress={openItem}
                    />
                  ))}
                </StaggeredList>
              </View>
            </>
          )}
        </ScrollView>

        <ItemSheet
          entry={openEntry}
          coins={shop.coins}
          pending={shop.pendingItemId === openEntry?.item.id}
          activeUntil={activeUntil}
          colors={colors}
          onClose={() => setOpenItemId(null)}
          onBuy={handleBuy}
          onUse={shop.use}
        />

        {shop.shortfall !== null ? (
          <PurseEmptyDialog
            shortfall={shop.shortfall}
            onGoLearn={() => {
              shop.clearShortfall();
              router.push("/(tabs)");
            }}
            onClose={shop.clearShortfall}
          />
        ) : null}
      </View>
    </AnimatedScreen>
  );
}

/** Half the space between grid columns; the row cancels it at the edges. */
const GRID_GUTTER = 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    gap: Spacing.three,
  },
  shelfMeta: {
    paddingHorizontal: Spacing.five,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.five - GRID_GUTTER,
  },
  gridSlot: {
    width: "50%",
    paddingHorizontal: GRID_GUTTER,
    marginBottom: Spacing.three,
  },
});
