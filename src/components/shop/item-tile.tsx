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
import { readableOn } from "@/utils/color";
import type { ShelfEntry } from "@/types/shop";
import {
  describeEffect,
  formatCoins,
  formatItemName,
  formatItemDescription,
} from "@/utils/shop";
import { CoinMark } from "@/components/ui/coin-mark";
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
  // Bảng màu Cửa hàng được chỉnh cho mặt sơn mài tối. Kệ hàng thì đi theo
  // theme của người dùng, nên màu chữ phải được kéo về đúng ngưỡng trên đúng
  // bề mặt đang vẽ — `readableOn` trả nguyên màu nếu vốn đã đạt.
  const accent = readableOn(tier.accent, surface);
  const unaffordableTone = readableOn(ShopPalette.vermilion, surface);
  const stat = describeEffect(item);

  const itemName = formatItemName(item.name);

  return (
    <AnimatedPressable
      style={styles.slot}
      onPress={() => onPress(entry)}
      pressScale={0.96}
      accessibilityLabel={`${itemName}, ${tier.label}, ${formatCoins(item.priceCoins)} xu`}
      accessibilityHint="Mở chi tiết vật phẩm"
    >
      <RarityFrame
        rarity={rarity}
        surface={surface}
        radius={BorderRadius.md}
        faceStyle={styles.face}
      >
        <View style={styles.topRow}>
          <Text style={[styles.tierLabel, { color: accent }]}>
            {tier.label}
          </Text>
          {owned > 0 ? (
            <View
              style={[
                styles.seal,
                { borderColor: accent, backgroundColor: tier.wash },
              ]}
            >
              <Text style={[styles.sealText, { color: accent }]}>
                {`×${owned}`}
              </Text>
            </View>
          ) : null}
        </View>

        <ItemGlyph item={item} rarity={rarity} size={54} />

        <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
          {itemName}
        </Text>
        <Text style={[styles.stat, { color: mutedColor }]} numberOfLines={1}>
          {stat ?? formatItemDescription(item.description)}
        </Text>

        {item.limitedTime ? (
          <View style={styles.limitedTag}>
            <Ionicons name="time" size={11} color={unaffordableTone} />
            <Text style={[styles.limitedText, { color: unaffordableTone }]}>
              Có hạn
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.pricePlate,
            { borderTopColor: accent + "33", backgroundColor: tier.wash },
          ]}
        >
          <CoinMark size={15} dimmed={!affordable} />
          <Text
            style={[
              styles.price,
              { color: affordable ? textColor : unaffordableTone },
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
