/**
 * QuestHeader - The top of the board.
 *
 * The headline is the player's actual standing, not the word "Nhiệm vụ"
 * repeated from the tab bar underneath it. What the state means for the
 * chest goes on the line below, and the countdown to the next board sits in
 * a pill on the right where it can tick without moving anything.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { goldInk, QuestPalette } from "@/constants/quests";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import type { QuestBoardSummary } from "@/types/quest";
import { boardHeadline, boardSubline } from "@/utils/quests";

interface QuestHeaderProps {
  summary: QuestBoardSummary;
  /** "05:42:11", or null once the board is due to roll over. */
  countdown: string | null;
}

export function QuestHeader({ summary, countdown }: QuestHeaderProps) {
  const { colors, isDark } = useTheme();

  const tone = summary.chestReady ? goldInk(isDark) : QuestPalette.trail;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={[styles.eyebrow, { color: tone }]}>Chặng hôm nay</Text>

        <View
          style={[
            styles.countdown,
            {
              backgroundColor: isDark
                ? colors.backgroundElement
                : colors.borderSubtle,
            },
          ]}
          accessibilityRole="text"
          accessibilityLabel={
            countdown ? `Bảng làm mới sau ${countdown}` : "Bảng sắp làm mới"
          }
        >
          <Ionicons
            name="time-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.countdownLabel, { color: colors.textSecondary }]}
          >
            Làm mới sau
          </Text>
          <Text style={[styles.countdownValue, { color: colors.text }]}>
            {countdown ?? "--:--"}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.headline, { color: colors.text }]}
        accessibilityRole="header"
      >
        {boardHeadline(summary)}
      </Text>

      <Text style={[styles.subline, { color: colors.textSecondary }]}>
        {boardSubline(summary)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  countdownLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  countdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    fontVariant: ["tabular-nums"],
  },
  headline: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.extrabold,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subline: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    lineHeight: 21,
  },
});
