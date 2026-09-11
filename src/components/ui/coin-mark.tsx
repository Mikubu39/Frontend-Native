/**
 * CoinMark - The app's currency symbol: a struck coin with a square hole,
 * after the old Japanese mon. Drawn from views rather than a glyph so it
 * reads the same at 14px as it does on the shop sign.
 *
 * Canonical mark for "xu" everywhere it appears (map header, shop, profile) —
 * don't reach for a generic Ionicon (sparkles/cash/coin-outline) instead, or
 * the same currency ends up wearing a different face on every screen.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { ShopPalette } from "@/constants/shop";

interface CoinMarkProps {
  size?: number;
  /** Greyed out when the player cannot afford the price it sits next to. */
  dimmed?: boolean;
}

export function CoinMark({ size = 16, dimmed = false }: CoinMarkProps) {
  const hole = Math.max(3, Math.round(size * 0.3));

  return (
    <View
      style={[
        styles.coin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dimmed ? "#B9B2A2" : ShopPalette.goldLeaf,
          borderColor: dimmed ? "#8C877B" : ShopPalette.goldDeep,
          borderWidth: Math.max(1, size * 0.09),
        },
      ]}
    >
      <View
        style={{
          width: hole,
          height: hole,
          borderRadius: 1,
          backgroundColor: dimmed ? "#6F6B61" : ShopPalette.goldDeep,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    alignItems: "center",
    justifyContent: "center",
  },
});
