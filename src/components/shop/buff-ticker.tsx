/**
 * BuffTicker - The powerups currently running on the player's account, with
 * live countdowns. Renders nothing when no buff is active.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EFFECT_META, ShopPalette } from "@/constants/shop";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useCountdown } from "@/hooks/use-countdown";
import type { EffectType } from "@/types/api";

interface BuffTickerProps {
  buffs: { effectType: string; expiresAt: string }[];
}

function BuffChip({
  effectType,
  expiresAt,
}: {
  effectType: string;
  expiresAt: string;
}) {
  const remaining = useCountdown(expiresAt);
  const meta = EFFECT_META[effectType as EffectType];

  if (!remaining) return null;

  return (
    <View style={styles.chip}>
      <Ionicons
        name={(meta?.icon ?? "sparkles") as any}
        size={13}
        color={ShopPalette.goldLeaf}
      />
      <Text style={styles.chipLabel}>{meta?.label ?? effectType}</Text>
      <Text style={styles.chipTime}>{remaining}</Text>
    </View>
  );
}

export function BuffTicker({ buffs }: BuffTickerProps) {
  const live = buffs.filter(
    (b) => new Date(b.expiresAt).getTime() > Date.now(),
  );

  if (live.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Đang hiệu lực</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {live.map((buff) => (
          <BuffChip
            key={`${buff.effectType}-${buff.expiresAt}`}
            effectType={buff.effectType}
            expiresAt={buff.expiresAt}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: ShopPalette.inkOnLacquerMuted,
  },
  row: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: ShopPalette.goldLeaf + "55",
    backgroundColor: ShopPalette.goldWash,
  },
  chipLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: ShopPalette.inkOnLacquer,
  },
  chipTime: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    color: ShopPalette.goldLeaf,
    fontVariant: ["tabular-nums"],
  },
});
