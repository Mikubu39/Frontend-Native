/**
 * FeaturedCase - The display case on the shop counter. Shows the standout
 * item of the moment: a limited-time drop if one is running, otherwise the
 * rarest thing on the shelves.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { RARITY_STYLES, ShopPalette } from "@/constants/shop";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ShelfEntry } from "@/types/shop";
import { describeEffect, formatCoins } from "@/utils/shop";
import { CoinMark } from "./coin-mark";
import { ItemGlyph } from "./item-glyph";
import { RarityFrame } from "./rarity-frame";

interface FeaturedCaseProps {
  entry: ShelfEntry;
  coins: number;
  onPress: (entry: ShelfEntry) => void;
}

export function FeaturedCase({ entry, coins, onPress }: FeaturedCaseProps) {
  const { item, rarity, owned } = entry;
  const tier = RARITY_STYLES[rarity];
  const stat = describeEffect(item);
  const affordable = coins >= item.priceCoins;

  return (
    <AnimatedPressable
      onPress={() => onPress(entry)}
      pressScale={0.98}
      accessibilityLabel={`Hàng nổi bật: ${item.name}, ${formatCoins(item.priceCoins)} xu`}
      accessibilityHint="Mở chi tiết vật phẩm"
    >
      <RarityFrame
        rarity={rarity}
        surface={ShopPalette.lacquerDeep}
        radius={BorderRadius.lg}
        faceStyle={styles.face}
      >
        <ItemGlyph item={item} rarity={rarity} size={62} />

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: tier.accent }]}>
            {item.limitedTime ? "Có hạn · hàng nổi bật" : "Hàng nổi bật"}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[tier.label, stat].filter(Boolean).join(" · ")}
          </Text>

          <View style={styles.priceRow}>
            <CoinMark size={15} dimmed={!affordable} />
            <Text
              style={[
                styles.price,
                !affordable && { color: ShopPalette.vermilion },
              ]}
            >
              {formatCoins(item.priceCoins)}
            </Text>
            {owned > 0 ? (
              <Text style={[styles.ownedNote, { color: tier.accent }]}>
                đã có ×{owned}
              </Text>
            ) : null}
            <View style={styles.spacer} />
            <Ionicons
              name="arrow-forward"
              size={15}
              color={ShopPalette.inkOnLacquerMuted}
            />
          </View>
        </View>
      </RarityFrame>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    padding: Spacing.four,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.inkOnLacquer,
  },
  meta: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: ShopPalette.inkOnLacquerMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.goldLeaf,
  },
  spacer: {
    flex: 1,
  },
  ownedNote: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
});
