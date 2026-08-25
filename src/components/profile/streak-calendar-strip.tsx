/**
 * StreakCalendarStrip - Horizontal heat-map of the last N days, showing which
 * days the user studied (GET /users/me/streak/calendar). One square per day,
 * oldest to newest, lit up for days present in `studyDates`.
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing } from "@/constants/theme";

interface StreakCalendarStripProps {
  studyDates: string[];
  days?: number;
  activeColor: string;
  inactiveColor: string;
  textColor: string;
  textSecondaryColor: string;
}

/** Local (không phải UTC) yyyy-MM-dd, khớp với LocalDate server trả về. */
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function StreakCalendarStrip({
  studyDates,
  days = 30,
  activeColor,
  inactiveColor,
  textColor,
  textSecondaryColor,
}: StreakCalendarStripProps) {
  const cells = useMemo(() => {
    const studied = new Set(studyDates);
    const today = new Date();
    const result: { iso: string; label: string; studied: boolean }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = toIsoDate(d);
      result.push({ iso, label: `${d.getDate()}`, studied: studied.has(iso) });
    }
    return result;
  }, [studyDates, days]);

  return (
    <View style={styles.row}>
      {cells.map((cell) => (
        <View key={cell.iso} style={styles.cellWrap}>
          <View
            style={[
              styles.cell,
              { backgroundColor: cell.studied ? activeColor : inactiveColor },
            ]}
          />
          <Text
            style={[
              styles.dayLabel,
              { color: cell.studied ? textColor : textSecondaryColor },
            ]}
          >
            {cell.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  cellWrap: {
    alignItems: "center",
    gap: 4,
  },
  cell: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.sm,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
});
