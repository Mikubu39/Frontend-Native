/**
 * ItemGlyph - An item's picture. Uses the catalogue artwork when the backend
 * gives a real URL, and falls back to the glyph for the item's effect so a
 * missing asset never leaves an empty square.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { EFFECT_META, RARITY_STYLES } from "@/constants/shop";
import { BorderRadius } from "@/constants/theme";
import type { ShopItemDto } from "@/types/api";
import type { ItemRarity } from "@/types/shop";
import { resolveItemArtwork } from "@/utils/shop";
import { useImageFallback } from "@/hooks/use-image-fallback";
import { CoinMark } from "@/components/ui/coin-mark";

interface ItemGlyphProps {
  item: ShopItemDto;
  rarity: ItemRarity;
  size?: number;
}

export function ItemGlyph({ item, rarity, size = 56 }: ItemGlyphProps) {
  const tier = RARITY_STYLES[rarity];
  const { uri: artwork, onError } = useImageFallback(
    resolveItemArtwork(item.iconUrl),
  );
  const meta = EFFECT_META[item.effectType];

  return (
    <View
      style={[
        styles.disc,
        {
          width: size,
          height: size,
          borderRadius: BorderRadius.sm,
          backgroundColor: tier.wash,
          borderColor: tier.accent + "55",
        },
      ]}
    >
      {artwork ? (
        <Image
          source={{ uri: artwork }}
          style={{ width: size * 0.68, height: size * 0.68 }}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          onError={onError}
        />
      ) : item.effectType === "DOUBLE_COIN" ? (
        <CoinMark size={size * 0.46} />
      ) : (
        <Ionicons
          name={(meta?.icon ?? "gift") as any}
          size={size * 0.46}
          color={tier.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
