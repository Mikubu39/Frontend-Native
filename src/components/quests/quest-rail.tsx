/**
 * RailGutter - The left column every row on the board shares: a line coming
 * in from the row above, the station's own node, and a line running on to
 * the next.
 *
 * Ground already covered is drawn solid; the road ahead is dashed. That one
 * distinction is what turns a column of cards into a route.
 */

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { QuestPalette, RailMetrics } from "@/constants/quests";

export type RailLine = "solid" | "dashed" | "none";
export type RailNode = "done" | "active" | "pending" | "chest";

interface RailGutterProps {
  topLine: RailLine;
  bottomLine: RailLine;
  node: RailNode;
  /** Distance from the top of the row to the node's centre. */
  nodeOffset: number;
  /** Board background — the node's ring is knocked out of it. */
  surface: string;
}

const DASH = 5;
const DASH_GAP = 5;

function Line({
  kind,
  color,
  style,
}: {
  kind: RailLine;
  color: string;
  style: object;
}) {
  const [height, setHeight] = useState(0);

  if (kind === "none") return null;

  if (kind === "solid") {
    return (
      <View
        pointerEvents="none"
        style={[styles.line, { backgroundColor: color }, style]}
      />
    );
  }

  /**
   * Dashes are stacked views rather than a dashed border: React Native drops
   * `borderStyle: "dashed"` back to solid on several Android builds.
   */
  const dashes = Math.max(1, Math.floor(height / (DASH + DASH_GAP)));

  return (
    <View
      pointerEvents="none"
      style={[styles.line, style]}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      {Array.from({ length: dashes }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dash,
            { backgroundColor: color, marginBottom: DASH_GAP },
          ]}
        />
      ))}
    </View>
  );
}

function Node({ node, surface }: { node: RailNode; surface: string }) {
  if (node === "pending") {
    return (
      <View
        style={[
          styles.node,
          styles.nodePending,
          { borderColor: QuestPalette.dormant, backgroundColor: surface },
        ]}
      />
    );
  }

  /** Earned milestones are gold; the one you are working on is violet. */
  const accent = node === "active" ? QuestPalette.trail : QuestPalette.gold;

  return (
    <View
      style={[
        styles.node,
        {
          borderColor: surface,
          backgroundColor: node === "active" ? surface : accent,
        },
      ]}
    >
      {node === "active" ? (
        <View style={[styles.core, { backgroundColor: accent }]} />
      ) : null}
    </View>
  );
}

export function RailGutter({
  topLine,
  bottomLine,
  node,
  nodeOffset,
  surface,
}: RailGutterProps) {
  const centre = nodeOffset;
  /** Solid means the day has reached here; dashed means it has not. */
  const toneOf = (kind: RailLine) =>
    kind === "solid" ? QuestPalette.trail : QuestPalette.dormant;

  return (
    <View style={styles.gutter} pointerEvents="none">
      <Line
        kind={topLine}
        color={toneOf(topLine)}
        style={{ top: 0, height: Math.max(0, centre - 12) }}
      />
      <Line
        kind={bottomLine}
        color={toneOf(bottomLine)}
        style={{ top: centre + 12, bottom: -1 }}
      />
      <View
        style={[styles.nodeSlot, { top: centre - RailMetrics.nodeSize / 2 }]}
      >
        <Node node={node} surface={surface} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gutter: {
    width: RailMetrics.gutter,
    alignSelf: "stretch",
  },
  line: {
    position: "absolute",
    left: (RailMetrics.gutter - RailMetrics.lineWidth) / 2,
    width: RailMetrics.lineWidth,
    borderRadius: RailMetrics.lineWidth,
    overflow: "hidden",
  },
  dash: {
    width: RailMetrics.lineWidth,
    height: DASH,
    borderRadius: RailMetrics.lineWidth,
  },
  nodeSlot: {
    position: "absolute",
    left: (RailMetrics.gutter - RailMetrics.nodeSize) / 2,
  },
  node: {
    width: RailMetrics.nodeSize,
    height: RailMetrics.nodeSize,
    borderRadius: RailMetrics.nodeSize / 2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  nodePending: {
    width: RailMetrics.nodeSizePending,
    height: RailMetrics.nodeSizePending,
    borderRadius: RailMetrics.nodeSizePending / 2,
    borderWidth: 2.5,
    marginTop: (RailMetrics.nodeSize - RailMetrics.nodeSizePending) / 2,
    marginLeft: (RailMetrics.nodeSize - RailMetrics.nodeSizePending) / 2,
  },
  core: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
