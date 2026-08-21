/**
 * AlphabetGrid - Ma trận bảng chữ cái, gom nhóm theo `groupName` (Hàng A, Hàng K...).
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import { FontSizes, FontWeights, Spacing } from "@/constants/theme";
import { AlphabetCharacter, AlphabetGroup } from "@/types/alphabet";
import { AlphabetCell } from "./alphabet-cell";

interface AlphabetGridProps {
  groups: AlphabetGroup[];
  cellSize: number;
  /** Khoảng cách giữa các ô; phải khớp với công thức tính cellSize của màn hình. */
  gap?: number;
  columns?: number;
  selectedId?: number | null;
  onSelect: (character: AlphabetCharacter) => void;
}

export function AlphabetGrid({
  groups,
  cellSize,
  gap = 6,
  columns = 5,
  selectedId,
  onSelect,
}: AlphabetGridProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {groups.map((group, groupIndex) => (
        <Animated.View
          key={group.groupName || `group-${groupIndex}`}
          entering={FadeInDown.delay(groupIndex * 60).duration(280)}
          style={styles.group}
        >
          <View style={styles.groupHeader}>
            <Text style={[styles.groupName, { color: colors.textSecondary }]}>
              {group.groupName}
            </Text>
            <View
              style={[
                styles.groupLine,
                { backgroundColor: colors.borderSubtle },
              ]}
            />
          </View>

          <View style={[styles.row, { gap }]}>
            {group.characters.map((character) => (
              <AlphabetCell
                key={character.characterId}
                character={character}
                size={cellSize}
                selected={selectedId === character.characterId}
                onPress={onSelect}
              />
            ))}
            {/* Giữ lưới thẳng hàng khi nhóm không đủ số cột. */}
            {Array.from(
              {
                length:
                  (columns - (group.characters.length % columns)) % columns,
              },
              (_, index) => (
                <View
                  key={`spacer-${index}`}
                  style={{ width: cellSize, height: cellSize + 10 }}
                />
              ),
            )}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.five,
  },
  group: {
    gap: Spacing.two,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  groupName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  groupLine: {
    flex: 1,
    height: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
