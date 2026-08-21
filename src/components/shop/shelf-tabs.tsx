/**
 * ShelfTabs - Switches between the shop's shelves and the player's own bag.
 * Four fixed segments rather than a scroller, so the bag is never off-screen.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { SHELVES, ShopPalette } from "@/constants/shop";
import { BorderRadius, FontWeights, Spacing } from "@/constants/theme";
import type { ShelfKey } from "@/types/shop";

interface ShelfTabsProps {
  active: ShelfKey;
  onSelect: (shelf: ShelfKey) => void;
  vaultCount: number;
  chipColor: string;
  mutedColor: string;
}

export function ShelfTabs({
  active,
  onSelect,
  vaultCount,
  chipColor,
  mutedColor,
}: ShelfTabsProps) {
  return (
    <View style={styles.row}>
      {SHELVES.map((shelf) => {
        const isActive = shelf.key === active;
        const tint = isActive ? ShopPalette.lacquerDeep : mutedColor;

        return (
          <AnimatedPressable
            key={shelf.key}
            onPress={() => onSelect(shelf.key)}
            pressScale={0.94}
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={shelf.label}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? ShopPalette.goldLeaf : chipColor,
                borderColor: isActive ? ShopPalette.goldDeep : "transparent",
              },
            ]}
          >
            <Ionicons name={shelf.icon as any} size={13} color={tint} />
            <Text
              style={[styles.label, { color: tint }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {shelf.label}
            </Text>
            {shelf.key === "VAULT" && vaultCount > 0 ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive
                      ? ShopPalette.lacquerDeep
                      : ShopPalette.goldLeaf,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isActive
                        ? ShopPalette.goldLeaf
                        : ShopPalette.lacquerDeep,
                    },
                  ]}
                  allowFontScaling={false}
                >
                  {vaultCount}
                </Text>
              </View>
            ) : null}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 12,
    fontWeight: FontWeights.extrabold,
    flexShrink: 1,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: FontWeights.extrabold,
  },
});
