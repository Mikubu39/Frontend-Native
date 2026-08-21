/**
 * QuestStation - One stop on the day's rail: the node in the gutter and the
 * plate beside it.
 *
 * The plate carries a lip under its face, the same beveled construction the
 * shop uses, so the two tabs feel built by the same hand even though nothing
 * about their colour is shared.
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
import type { QuestNode } from "@/types/quest";
import { QuestProgress } from "./quest-progress";
import { QuestSeal } from "./quest-seal";
import { RailGutter, type RailLine } from "./quest-rail";

/** Row top → centre of the glyph disc, which is what the node lines up with. */
export const STATION_NODE_OFFSET = 38;

interface QuestStationProps {
  node: QuestNode;
  /** Drawn solid once the day has reached this station. */
  topLine: RailLine;
  bottomLine: RailLine;
  /** Index on the board, used to stagger the bar fills and the seals. */
  order: number;
}

export function QuestStation({
  node,
  topLine,
  bottomLine,
  order,
}: QuestStationProps) {
  const { colors, isDark } = useTheme();
  const { quest, state, pct, meta, caption } = node;

  const done = state === "done";
  /**
   * Gold means earned, violet means underway. A finished plate turning gold
   * is what makes the page warm up as it fills, and it points at the gold
   * chest waiting at the end of the rail. Vermilion is left to the seal
   * alone — used any wider it reads as an error, not an achievement.
   */
  const accent = done ? QuestPalette.gold : QuestPalette.trail;
  const lip = done ? QuestPalette.goldDeep : QuestPalette.trailDeep;
  /** Same hue, readable weight — see `goldInk`. */
  const ink = done ? goldInk(isDark) : QuestPalette.trail;
  /** Tinted rather than neutral grey: at 0% the track is the only colour
   * the plate has, and a dead grey bar makes a fresh board look broken. */
  const track = accent + "26";

  const dormantPlate = state === "pending";
  /**
   * The lip under the face is what gives the plate travel. `colors.border`
   * disappears against the cream background in light mode, taking the bevel
   * with it, so untouched plates get a muted mauve lip in both themes.
   */
  const dormantLip = QuestPalette.dormant + "59";
  const delay = 120 + order * 90;

  return (
    <View style={styles.row}>
      <RailGutter
        topLine={topLine}
        bottomLine={bottomLine}
        node={state}
        nodeOffset={STATION_NODE_OFFSET}
        surface={colors.background}
      />

      <View
        style={[
          styles.lip,
          { backgroundColor: dormantPlate ? dormantLip : lip },
        ]}
      >
        <View
          style={[
            styles.face,
            {
              backgroundColor: colors.card,
              borderColor: dormantPlate ? colors.border : accent + "66",
            },
          ]}
          accessibilityRole="summary"
          accessibilityLabel={`${quest.title}. ${caption}. ${quest.currentProgress} trên ${quest.targetValue}.`}
        >
          {done ? (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.doneWash]}
            />
          ) : null}

          <View style={styles.head}>
            <View
              style={[
                styles.glyph,
                {
                  backgroundColor: done
                    ? QuestPalette.goldWash
                    : QuestPalette.trailWash,
                  borderColor: dormantPlate ? colors.border : accent + "55",
                },
              ]}
            >
              <Ionicons name={meta.icon as any} size={20} color={ink} />
            </View>

            <View style={styles.headText}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {quest.title}
              </Text>
              {/*
                The only line on the plate that is not a restatement: the
                subtraction the player would otherwise do in their head.
              */}
              <Text
                testID="quest-caption"
                style={[
                  styles.caption,
                  { color: done ? ink : colors.textSecondary },
                ]}
              >
                {caption}
              </Text>
            </View>

            {done ? <QuestSeal delay={delay + 220} /> : null}
          </View>

          <QuestProgress
            pct={pct}
            current={Math.min(quest.currentProgress, quest.targetValue)}
            target={quest.targetValue}
            tone={accent}
            trackColor={track}
            counterColor={done ? ink : colors.textSecondary}
            delay={delay}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingBottom: Spacing.three,
  },
  lip: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingBottom: 4,
    marginLeft: Spacing.two,
  },
  face: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.four,
    gap: Spacing.four - 2,
    overflow: "hidden",
  },
  doneWash: {
    backgroundColor: QuestPalette.goldWash,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  glyph: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    lineHeight: 20,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
});
