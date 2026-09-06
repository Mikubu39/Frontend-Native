/**
 * StreakCalendarStrip - Horizontal heat-map of the last N days, showing which
 * days the user studied (GET /users/me/streak/calendar).
 * Displays in natural chronological order: oldest (past) to newest (today) from left to right.
 * Includes 3-tier day cell (Weekday, Dot, Day number), month separator, and 'Today' highlight.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BorderRadius, Spacing } from "@/constants/theme";

export interface StreakCalendarStripProps {
  studyDates: string[];
  days?: number;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
  textSecondaryColor?: string;
  borderColor?: string;
  isDark?: boolean;
  showHeader?: boolean;
}

const VI_WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Local (không phải UTC) yyyy-MM-dd, khớp với LocalDate server trả về. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function StreakCalendarStrip({
  studyDates,
  days = 30,
  activeColor = "#FF9600",
  inactiveColor = "rgba(150, 150, 150, 0.15)",
  textColor = "#1F2937",
  textSecondaryColor = "#6B7280",
  borderColor = "rgba(150, 150, 150, 0.2)",
  isDark = false,
  showHeader = true,
}: StreakCalendarStripProps) {
  const scrollRef = useRef<ScrollView>(null);

  const cells = useMemo(() => {
    const studied = new Set(studyDates);
    const today = new Date();
    const todayIso = toIsoDate(today);
    const result: {
      iso: string;
      dayOfWeek: string;
      dayOfMonth: string;
      month: number;
      isToday: boolean;
      isFirstOfMonth: boolean;
      studied: boolean;
    }[] = [];

    // Chronological order: from (days - 1) days ago to today (0 days ago)
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = toIsoDate(d);
      const isToday = iso === todayIso;
      const isFirstOfMonth = d.getDate() === 1;
      const dayOfWeek = VI_WEEKDAYS[d.getDay()];
      const month = d.getMonth() + 1;
      const dayOfMonth = `${d.getDate()}`;

      result.push({
        iso,
        dayOfWeek,
        dayOfMonth,
        month,
        isToday,
        isFirstOfMonth,
        studied: studied.has(iso),
      });
    }
    return result;
  }, [studyDates, days]);

  const studiedCount = useMemo(() => {
    return cells.filter((c) => c.studied).length;
  }, [cells]);

  const scrollToToday = () => {
    scrollRef.current?.scrollToEnd({ animated: false });
  };

  useEffect(() => {
    // Scroll to today on mount and when cells update
    const timer = setTimeout(() => {
      scrollToToday();
    }, 50);
    return () => {
      if (typeof clearTimeout !== "undefined") {
        clearTimeout(timer);
      } else if (typeof global !== "undefined" && global.clearTimeout) {
        global.clearTimeout(timer);
      }
    };
  }, [cells]);

  return (
    <View style={styles.container} testID="streak-calendar-strip">
      {showHeader && (
        <View style={styles.headerRow} testID="streak-summary-header">
          <Text style={[styles.headerSubtitle, { color: textSecondaryColor }]}>
            {days} ngày gần nhất
          </Text>
          <View
            style={[
              styles.streakBadge,
              {
                backgroundColor: isDark ? "rgba(255, 150, 0, 0.15)" : "#FFF7ED",
                borderColor: isDark ? "rgba(255, 150, 0, 0.3)" : "#FFEDD5",
              },
            ]}
          >
            <Text style={styles.streakBadgeText}>
              🔥 {studiedCount} ngày đã học
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={scrollToToday}
        onLayout={scrollToToday}
      >
        {cells.map((cell, index) => {
          const showMonthDivider = cell.isFirstOfMonth && index > 0;

          return (
            <React.Fragment key={cell.iso}>
              {showMonthDivider && (
                <View
                  style={styles.monthDividerContainer}
                  testID={`month-divider-${cell.month}`}
                >
                  <View
                    style={[
                      styles.monthDividerLine,
                      { backgroundColor: borderColor },
                    ]}
                  />
                  <View
                    style={[
                      styles.monthLabelPill,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "#F3F4F6",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthLabelText,
                        { color: textSecondaryColor },
                      ]}
                    >
                      Th{cell.month}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.monthDividerLine,
                      { backgroundColor: borderColor },
                    ]}
                  />
                </View>
              )}

              <View
                style={[
                  styles.dayColumn,
                  cell.isToday && styles.todayColumnPadding,
                ]}
                testID={`streak-day-${cell.iso}`}
              >
                {/* 1. Day of week */}
                <Text
                  style={[
                    styles.weekdayText,
                    {
                      color: cell.isToday ? activeColor : textSecondaryColor,
                      fontWeight: cell.isToday ? "700" : "500",
                    },
                  ]}
                >
                  {cell.dayOfWeek}
                </Text>

                {/* 2. Status dot */}
                <View
                  style={[
                    styles.cellDot,
                    {
                      backgroundColor: cell.studied
                        ? activeColor
                        : inactiveColor,
                    },
                    cell.isToday && [
                      styles.todayDotRing,
                      { borderColor: activeColor },
                    ],
                  ]}
                />

                {/* 3. Day of month */}
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      color: cell.isToday
                        ? activeColor
                        : cell.studied
                          ? textColor
                          : textSecondaryColor,
                      fontWeight: cell.isToday
                        ? "800"
                        : cell.studied
                          ? "700"
                          : "500",
                    },
                  ]}
                >
                  {cell.dayOfMonth}
                </Text>

                {/* Today indicator dot */}
                {cell.isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      { backgroundColor: activeColor },
                    ]}
                  />
                )}
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EA580C",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  dayColumn: {
    alignItems: "center",
    width: 32,
    gap: 5,
  },
  todayColumnPadding: {
    // subtle emphasize
  },
  weekdayText: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  cellDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  todayDotRing: {
    borderWidth: 2.5,
  },
  dayNumberText: {
    fontSize: 11,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: -2,
  },
  monthDividerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 3,
    height: 52,
  },
  monthDividerLine: {
    width: 1,
    flex: 1,
  },
  monthLabelPill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  monthLabelText: {
    fontSize: 9,
    fontWeight: "700",
  },
});
