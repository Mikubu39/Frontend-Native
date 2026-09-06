/**
 * ItemTile - One item on a shelf. Shows what the item is, how rare it is and
 * what it costs; tapping it opens the purchase sheet where the actions live.
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

interface ItemTileProps {
  entry: ShelfEntry;
  surface: string;
  textColor: string;
  mutedColor: string;
  coins: number;
  onPress: (entry: ShelfEntry) => void;
}

export const ItemTile = React.memo(function ItemTile({
  entry,
  surface,
  textColor,
  mutedColor,
  coins,
  onPress,
}: ItemTileProps) {
  const { item, rarity, owned } = entry;
  const tier = RARITY_STYLES[rarity];
  const affordable = coins >= item.priceCoins;
  const stat = describeEffect(item);

  return (
    <AnimatedPressable
      style={styles.slot}
      onPress={() => onPress(entry)}
      pressScale={0.96}
      accessibilityLabel={`${item.name}, ${tier.label}, ${formatCoins(item.priceCoins)} xu`}
      accessibilityHint="Mở chi tiết vật phẩm"
    >
      <RarityFrame
        rarity={rarity}
        surface={surface}
        radius={BorderRadius.md}
        faceStyle={styles.face}
      >
        <View style={styles.topRow}>
          <Text style={[styles.tierLabel, { color: tier.accent }]}>
            {tier.label}
          </Text>
          {owned > 0 ? (
            <View
              style={[
                styles.seal,
                { borderColor: tier.accent, backgroundColor: tier.wash },
              ]}
            >
              <Text style={[styles.sealText, { color: tier.accent }]}>
                {`×${owned}`}
              </Text>
            </View>
          ) : null}
        </View>

        <ItemGlyph item={item} rarity={rarity} size={54} />

        <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.stat, { color: mutedColor }]} numberOfLines={1}>
          {stat ?? item.description}
        </Text>

        {item.limitedTime ? (
          <View style={styles.limitedTag}>
            <Ionicons name="time" size={11} color={ShopPalette.vermilion} />
            <Text style={styles.limitedText}>Có hạn</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.pricePlate,
            { borderTopColor: tier.accent + "33", backgroundColor: tier.wash },
          ]}
        >
          <CoinMark size={15} dimmed={!affordable} />
          <Text
            style={[
              styles.price,
              { color: affordable ? textColor : ShopPalette.vermilion },
            ]}
          >
            {formatCoins(item.priceCoins)}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={mutedColor} />
        </View>
      </RarityFrame>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  slot: {
    width: "100%",
  },
  face: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    minHeight: 208,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 20,
    gap: Spacing.one,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  seal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  sealText: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    lineHeight: 19,
  },
  stat: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  limitedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  limitedText: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: ShopPalette.vermilion,
  },
  pricePlate: {
    marginTop: "auto",
    marginHorizontal: -Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    borderTopWidth: 1,
  },
  price: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
  },
});
