/**
 * Quests Screen — "the day's track".
 *
 * One rail runs down the page: every quest is a station on it, ground you
 * have covered is drawn solid and what is ahead is dashed, and the rail
 * terminates at the chest. Finishing a quest stamps a vermilion seal on its
 * plate — the single loud moment on an otherwise quiet screen.
 *
 * Data and actions live in `useQuests`; this file composes the layout.
 */

import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  BoardEmpty,
  BoardSkeleton,
  ChestTerminus,
  QuestHeader,
  QuestStation,
} from "@/components/quests";
import { QuestPalette } from "@/constants/quests";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useCountdown } from "@/hooks/use-countdown";
import { useQuests } from "@/hooks/use-quests";

/** The floating tab bar is 56pt plus whatever the device reserves below it. */
const TAB_BAR_HEIGHT = 56;

export default function QuestsTabScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const board = useQuests();
  const countdown = useCountdown(board.resetAt);

  const blockColor = isDark ? colors.backgroundElement : colors.borderSubtle;
  const hasQuests = board.nodes.length > 0;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + Spacing.six,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={board.isRefreshing}
            onRefresh={board.refresh}
            tintColor={QuestPalette.trail}
          />
        }
      >
        <QuestHeader summary={board.summary} countdown={countdown} />

        {board.isLoading ? (
          <BoardSkeleton blockColor={blockColor} />
        ) : !hasQuests ? (
          <BoardEmpty />
        ) : (
          <View style={styles.track}>
            {board.nodes.map((node, index) => {
              const next = board.nodes[index + 1];
              /**
               * A segment is solid when the day has reached the station
               * below it. Drawing it from the *next* node keeps the two
               * halves of every stretch in agreement, so the rail never
               * changes texture mid-gap.
               */
              const reached = node.state !== "pending";
              const nextReached = next
                ? next.state !== "pending"
                : board.summary.remainingForChest === 0;

              return (
                <QuestStation
                  key={node.quest.questId}
                  node={node}
                  order={index}
                  topLine={reached ? "solid" : "dashed"}
                  bottomLine={nextReached ? "solid" : "dashed"}
                />
              );
            })}
          </View>
        )}

        {board.isLoading || !hasQuests ? null : (
          <View style={styles.track}>
            <ChestTerminus
              summary={board.summary}
              railReached={board.summary.remainingForChest === 0}
              onOpen={board.claimChest}
              isOpening={board.isOpeningChest}
              error={board.chestError}
              rewardCoins={board.rewardCoins}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
  track: {
    paddingHorizontal: Spacing.five,
  },
});
