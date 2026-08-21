/**
 * ItemSheet - The counter where a deal actually happens. Opening an item shows
 * what it does, what the player already owns, and the one or two actions that
 * make sense for it.
 */

import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { EFFECT_META, RARITY_STYLES, ShopPalette } from "@/constants/shop";
import {
  AnimationPresets,
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useCountdown } from "@/hooks/use-countdown";
import type { ShelfEntry } from "@/types/shop";
import { describeEffect, formatCoins } from "@/utils/shop";
import { CoinMark } from "./coin-mark";
import { ItemGlyph } from "./item-glyph";
import { ShopButton } from "./shop-button";

interface SheetColors {
  text: string;
  textSecondary: string;
  background: string;
  border: string;
}

interface ItemSheetProps {
  entry: ShelfEntry | null;
  coins: number;
  pending: boolean;
  /** ISO timestamp when this item's effect is already running. */
  activeUntil: string | null;
  colors: SheetColors;
  onClose: () => void;
  onBuy: (entry: ShelfEntry) => void;
  onUse: (entry: ShelfEntry) => void;
  onEquip: (entry: ShelfEntry) => void;
}

function StatCell({
  label,
  value,
  accent,
  mutedColor,
}: {
  label: string;
  value: string;
  accent: string;
  mutedColor: string;
}) {
  return (
    <View style={[styles.statCell, { borderColor: accent + "33" }]}>
      <Text style={[styles.statLabel, { color: mutedColor }]}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

export function ItemSheet({
  entry,
  coins,
  pending,
  activeUntil,
  colors,
  onClose,
  onBuy,
  onUse,
  onEquip,
}: ItemSheetProps) {
  const insets = useSafeAreaInsets();
  const remaining = useCountdown(activeUntil);

  if (!entry) return null;

  const { item, rarity, owned, equipped } = entry;
  const tier = RARITY_STYLES[rarity];
  const meta = EFFECT_META[item.effectType];
  const stat = describeEffect(item);
  const isCosmetic = item.itemType === "COSMETIC";
  const affordable = coins >= item.priceCoins;
  const shortfall = item.priceCoins - coins;

  return (
    <Animated.View
      entering={FadeIn.duration(AnimationPresets.duration.fast)}
      style={styles.overlayContainer}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Đóng chi tiết vật phẩm"
      >
        <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <Animated.View
        entering={SlideInDown.duration(AnimationPresets.duration.normal)
          .springify()
          .damping(AnimationPresets.spring.damping)
          .stiffness(AnimationPresets.spring.stiffness)}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            // The floating tab bar draws over this screen, so the sheet has
            // to clear its full height, not just the safe-area inset.
            paddingBottom:
              TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + Spacing.four,
          },
        ]}
      >
        <View style={[styles.grip, { backgroundColor: colors.border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          bounces={false}
        >
          <View style={styles.headRow}>
            <ItemGlyph item={item} rarity={rarity} size={76} />
            <View style={styles.headBody}>
              <Text style={[styles.tier, { color: tier.accent }]}>
                {tier.label}
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.effect, { color: colors.textSecondary }]}>
                {meta?.label ?? item.effectType}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>

          <View style={styles.statRow}>
            <StatCell
              label="Hiệu lực"
              // Cosmetics have no timer — once equipped they simply stay on.
              value={stat ?? "Vĩnh viễn"}
              accent={tier.accent}
              mutedColor={colors.textSecondary}
            />
            <StatCell
              label="Trong túi"
              value={owned > 0 ? "×" + owned : "Chưa có"}
              accent={tier.accent}
              mutedColor={colors.textSecondary}
            />
          </View>

          {remaining ? (
            <View
              style={[styles.liveBanner, { borderColor: tier.accent + "44" }]}
            >
              <Ionicons name="pulse" size={15} color={tier.accent} />
              <Text style={[styles.liveText, { color: colors.text }]}>
                Đang chạy, còn{" "}
                <Text style={{ color: tier.accent }}>{remaining}</Text>
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {isCosmetic && owned > 0 ? (
              <ShopButton
                label={equipped ? "Tháo ra" : "Trang bị"}
                icon={equipped ? "close-circle" : "shirt"}
                tone="gold"
                loading={pending}
                onPress={() => onEquip(entry)}
              />
            ) : (
              <ShopButton
                // Short on xu the button still works — it opens the way to
                // earn the gap rather than dead-ending on a disabled control.
                label={
                  affordable
                    ? "Mua"
                    : "Kiếm thêm " + formatCoins(shortfall) + " xu"
                }
                tone={affordable ? "gold" : "lacquer"}
                icon={affordable ? undefined : "book"}
                loading={pending}
                leading={affordable ? <CoinMark size={16} /> : undefined}
                onPress={() => onBuy(entry)}
              />
            )}

            {affordable && !(isCosmetic && owned > 0) ? (
              <Text style={[styles.priceHint, { color: colors.textSecondary }]}>
                Trừ {formatCoins(item.priceCoins)} xu · còn lại{" "}
                {formatCoins(coins - item.priceCoins)}
              </Text>
            ) : null}

            {!isCosmetic && owned > 0 ? (
              <ShopButton
                label="Dùng ngay"
                icon="play"
                tone="lacquer"
                loading={pending}
                onPress={() => onUse(entry)}
              />
            ) : null}

            <ShopButton
              label="Đóng"
              tone="ghost"
              ghostColor={colors.textSecondary}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

/** Matches the floating tab bar in `(tabs)/_layout.tsx`. */
const TAB_BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    maxHeight: "88%",
  },
  grip: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.four,
  },
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  headBody: {
    flex: 1,
    gap: 2,
  },
  tier: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  name: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    lineHeight: 28,
  },
  effect: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  description: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    fontWeight: FontWeights.medium,
  },
  statRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: FontWeights.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: ShopPalette.goldWash,
  },
  liveText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  actions: {
    gap: Spacing.three,
  },
  priceHint: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    textAlign: "center",
    marginTop: -Spacing.one,
  },
});
