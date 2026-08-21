/**
 * RankTabs - Horizontal segmented selector for switching between ranks.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { RankResponse } from "@/types/api";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";

interface RankTabsProps {
  ranks: RankResponse[];
  activeRankId: number | null;
  onSelect: (rankId: number) => void;
  cardColor: string;
  borderColor: string;
  chipBg: string;
  textSecondaryColor: string;
}

export function RankTabs({
  ranks,
  activeRankId,
  onSelect,
  cardColor,
  borderColor,
  chipBg,
  textSecondaryColor,
}: RankTabsProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cardColor, borderBottomColor: borderColor },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {ranks.map((r) => {
          const isActive = r.rankId === activeRankId;
          return (
            <AnimatedPressable
              key={r.rankId}
              style={[
                styles.tab,
                { backgroundColor: isActive ? Colors.primary : chipBg },
              ]}
              onPress={() => onSelect(r.rankId)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? "#FFFFFF" : textSecondaryColor },
                ]}
              >
                {r.name}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  tab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
});
