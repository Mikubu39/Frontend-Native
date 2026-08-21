/**
 * ShopCounter - The lacquer slab at the top of the shop: title, the player's
 * purse, the display case and any running buffs.
 *
 * It keeps its own dark surface in both themes on purpose — the shop should
 * feel like a place you walk into, not another panel of the settings list.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ShopPalette } from "@/constants/shop";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "@/constants/theme";
import type { ShelfEntry } from "@/types/shop";
import { formatCoins } from "@/utils/shop";
import { BuffTicker } from "./buff-ticker";
import { CoinMark } from "./coin-mark";
import { FeaturedCase } from "./featured-case";

interface ShopCounterProps {
  coins: number;
  buffs: { effectType: string; expiresAt: string }[];
  featured: ShelfEntry | null;
  onOpenItem: (entry: ShelfEntry) => void;
  topInset: number;
}

export function ShopCounter({
  coins,
  buffs,
  featured,
  onOpenItem,
  topInset,
}: ShopCounterProps) {
  return (
    <LinearGradient
      colors={[ShopPalette.lacquer, ShopPalette.lacquerDeep]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.slab, { paddingTop: topInset + Spacing.three }]}
    >
      {/* The shop sign: the rim of a mon coin, blown up behind the counter. */}
      <View pointerEvents="none" style={styles.sign} />

      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Cửa hàng</Text>
        </View>

        <View
          style={styles.purse}
          accessibilityRole="text"
          accessibilityLabel={`Bạn có ${formatCoins(coins)} xu`}
        >
          <CoinMark size={18} />
          <Text style={styles.purseAmount}>{formatCoins(coins)}</Text>
        </View>
      </View>

      {featured ? (
        <Animated.View entering={FadeInDown.duration(320)}>
          <FeaturedCase entry={featured} coins={coins} onPress={onOpenItem} />
        </Animated.View>
      ) : null}

      <BuffTicker buffs={buffs} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slab: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    gap: Spacing.four,
    overflow: "hidden",
    ...Shadows.lg,
  },
  sign: {
    position: "absolute",
    right: -74,
    top: -34,
    width: 236,
    height: 236,
    borderRadius: 118,
    borderWidth: 16,
    borderColor: ShopPalette.goldLeaf,
    opacity: 0.1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.four,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.inkOnLacquer,
    letterSpacing: -0.5,
  },
  purse: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: ShopPalette.goldLeaf + "4D",
    backgroundColor: ShopPalette.goldWash,
  },
  purseAmount: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.goldLeaf,
    fontVariant: ["tabular-nums"],
  },
});
