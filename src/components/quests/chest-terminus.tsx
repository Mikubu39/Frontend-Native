/**
 * ChestTerminus - Where the rail ends. The rail runs into it, so the reward
 * reads as the point of the whole page rather than a card that happens to
 * sit last.
 *
 * Three states, one panel: locked (how many quests are left), ready (open
 * it), opened (what it paid out).
 */

import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
/** The coin mark is the app's currency symbol; the shop owns the drawing. */
import { CoinMark } from "@/components/shop/coin-mark";
import { goldInk, QuestPalette } from "@/constants/quests";
import {
  BorderRadius,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import type { QuestBoardSummary } from "@/types/quest";
import { formatCoins } from "@/utils/shop";
import { ChestArt, type ChestState } from "./chest-art";
import { RailGutter } from "./quest-rail";

/** Row top → centre of the terminus node, level with the panel's eyebrow. */
const TERMINUS_NODE_OFFSET = 30;

interface ChestTerminusProps {
  summary: QuestBoardSummary;
  /** Solid once every quest the chest asks for is done. */
  railReached: boolean;
  onOpen: () => void;
  isOpening: boolean;
  error: string | null;
  /** Coins this session's open paid out, if it has happened yet. */
  rewardCoins: number | null;
}

export function ChestTerminus({
  summary,
  railReached,
  onOpen,
  isOpening,
  error,
  rewardCoins,
}: ChestTerminusProps) {
  const { colors, isDark } = useTheme();

  const state: ChestState = summary.chestOpened
    ? "opened"
    : summary.chestReady
      ? "ready"
      : "locked";

  const dormant = state === "locked";
  const accent = dormant ? colors.textSecondary : goldInk(isDark);

  const label = summary.chestOpened
    ? "Đã nhận hôm nay"
    : isOpening
      ? "Đang mở…"
      : summary.chestReady
        ? "Mở rương"
        : `Còn ${summary.remainingForChest} nhiệm vụ`;

  const body = summary.chestOpened
    ? "Bảng mới sẽ có rương mới. Hẹn chặng sau."
    : summary.chestReady
      ? `Xong ${summary.completed}/${summary.required} nhiệm vụ. Rương là của bạn.`
      : `Rương mở khi bạn xong ${summary.required} nhiệm vụ trong ngày.`;

  return (
    <View style={styles.row}>
      <RailGutter
        topLine={railReached ? "solid" : "dashed"}
        bottomLine="none"
        node={summary.chestReady || summary.chestOpened ? "chest" : "pending"}
        nodeOffset={TERMINUS_NODE_OFFSET}
        surface={colors.background}
      />

      <View
        style={[
          styles.lip,
          {
            backgroundColor: dormant
              ? QuestPalette.dormant + "59"
              : QuestPalette.goldDeep,
          },
        ]}
      >
        <View
          style={[
            styles.face,
            {
              backgroundColor: colors.card,
              borderColor: dormant ? colors.border : QuestPalette.gold + "77",
            },
          ]}
        >
          {dormant ? null : (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.goldWash]}
            />
          )}

          <Text style={[styles.eyebrow, { color: accent }]}>Cuối chặng</Text>

          <ChestArt state={state} />

          {rewardCoins !== null ? (
            <Animated.View
              entering={FadeInDown.springify().damping(13).stiffness(180)}
              style={styles.reward}
            >
              <CoinMark size={18} />
              <Text style={[styles.rewardAmount, { color: goldInk(isDark) }]}>
                +{formatCoins(rewardCoins)}
              </Text>
            </Animated.View>
          ) : (
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              {body}
            </Text>
          )}

          {error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          <AnimatedPressable
            onPress={onOpen}
            disabled={!summary.chestReady || isOpening}
            pressScale={0.97}
            accessibilityLabel={label}
            accessibilityHint={
              summary.chestReady ? "Nhận xu từ rương cuối chặng" : undefined
            }
            style={[
              styles.buttonLip,
              {
                backgroundColor: summary.chestReady
                  ? QuestPalette.goldDeep
                  : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.buttonFace,
                {
                  backgroundColor: summary.chestReady
                    ? QuestPalette.gold
                    : // `backgroundElement` is cream in light mode, which reads
                      // as an enabled gold button; a locked one must look inert.
                      isDark
                      ? colors.backgroundElement
                      : colors.borderSubtle,
                },
              ]}
            >
              {isOpening ? (
                <ActivityIndicator size="small" color="#2A1A05" />
              ) : (
                <>
                  <Ionicons
                    name={summary.chestReady ? "gift" : "lock-closed"}
                    size={17}
                    color={
                      summary.chestReady ? "#2A1A05" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.buttonLabel,
                      {
                        color: summary.chestReady
                          ? "#2A1A05"
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </>
              )}
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  lip: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingBottom: 5,
    marginLeft: Spacing.two,
  },
  face: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    overflow: "hidden",
  },
  goldWash: {
    backgroundColor: QuestPalette.goldWash,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  body: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    textAlign: "center",
    lineHeight: 19,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  rewardAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    fontVariant: ["tabular-nums"],
  },
  error: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: QuestPalette.seal,
    textAlign: "center",
  },
  buttonLip: {
    alignSelf: "stretch",
    borderRadius: BorderRadius.md,
    paddingBottom: 4,
    marginTop: Spacing.one,
  },
  buttonFace: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
  },
  buttonLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.3,
  },
});
