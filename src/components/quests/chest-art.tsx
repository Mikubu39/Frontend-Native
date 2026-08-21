/**
 * ChestArt - The reward at the end of the rail, drawn rather than typed.
 *
 * The old board used an emoji, which changes shape on every platform and
 * cannot take the board's own gold. This is three states of one object:
 * shut and dormant, shut and gold, or open with the lid tipped back.
 */

import React from "react";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { QuestPalette } from "@/constants/quests";

export type ChestState = "locked" | "ready" | "opened";

interface ChestArtProps {
  state: ChestState;
  size?: number;
}

export function ChestArt({ state, size = 104 }: ChestArtProps) {
  const dormant = state === "locked";
  const line = dormant ? QuestPalette.dormant : QuestPalette.gold;
  const deep = dormant ? QuestPalette.dormant : QuestPalette.goldDeep;
  const fill = dormant ? "transparent" : QuestPalette.goldWash;
  const open = state === "opened";

  const height = Math.round(size * 0.78);

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 104 82"
      accessibilityRole="image"
      accessibilityLabel={
        open ? "Rương đã mở" : dormant ? "Rương còn khoá" : "Rương đã sẵn sàng"
      }
    >
      {/* Body */}
      <Rect
        x={12}
        y={34}
        width={80}
        height={42}
        rx={7}
        fill={fill}
        stroke={line}
        strokeWidth={3}
      />
      {/* Straps */}
      <Rect x={26} y={34} width={5} height={42} fill={deep} opacity={0.45} />
      <Rect x={73} y={34} width={5} height={42} fill={deep} opacity={0.45} />

      {/* Lid — hinged at its back-left corner so it tips instead of sliding. */}
      <G
        rotation={open ? -26 : 0}
        originX={14}
        originY={34}
        opacity={open ? 0.9 : 1}
      >
        <Path
          d="M12 34 C12 12, 92 12, 92 34 Z"
          fill={fill}
          stroke={line}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <Path d="M12 34 H92" stroke={line} strokeWidth={3} />
      </G>

      {/* Lock plate. Once the lid is off there is nothing left to lock. */}
      {open ? null : (
        <>
          <Rect
            x={44}
            y={30}
            width={16}
            height={19}
            rx={4}
            fill={dormant ? "transparent" : QuestPalette.gold}
            stroke={line}
            strokeWidth={2.5}
          />
          <Circle
            cx={52}
            cy={39}
            r={3}
            fill={dormant ? line : QuestPalette.goldDeep}
          />
        </>
      )}
    </Svg>
  );
}
