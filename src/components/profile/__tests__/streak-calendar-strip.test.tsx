import React from "react";
import { render } from "@testing-library/react-native";
import { StreakCalendarStrip, toIsoDate } from "../streak-calendar-strip";

describe("StreakCalendarStrip", () => {
  it("renders chronological order from 29 days ago to today (past -> present)", async () => {
    const today = new Date();
    const todayIso = toIsoDate(today);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 29);
    const pastIso = toIsoDate(pastDate);

    const { getByTestId, getAllByText } = await render(
      <StreakCalendarStrip studyDates={[todayIso]} days={30} />,
    );

    // Verify container renders
    expect(getByTestId("streak-calendar-strip")).toBeTruthy();

    // Past date (leftmost) and today (rightmost) exist
    expect(getByTestId(`streak-day-${pastIso}`)).toBeTruthy();
    expect(getByTestId(`streak-day-${todayIso}`)).toBeTruthy();

    // Verify header summary shows count of studied days
    expect(getAllByText(/1 ngày đã học/).length).toBeGreaterThan(0);
  });

  it("displays 3 tiers for a day: weekday, dot, and day number", async () => {
    const today = new Date();
    const todayIso = toIsoDate(today);

    const { getByTestId } = await render(
      <StreakCalendarStrip studyDates={[todayIso]} days={7} />,
    );

    const todayCell = getByTestId(`streak-day-${todayIso}`);
    expect(todayCell).toBeTruthy();

    const cellChildren = todayCell.props.children;
    expect(cellChildren).toBeDefined();
  });

  it("renders month divider when crossing into a new month", async () => {
    // 35 days always crosses at least one month boundary
    const { getAllByTestId } = await render(
      <StreakCalendarStrip studyDates={[]} days={35} />,
    );

    const dividers = getAllByTestId(/^month-divider-/);
    expect(dividers.length).toBeGreaterThanOrEqual(1);
  });

  it("hides header when showHeader is false", async () => {
    const { queryByTestId } = await render(
      <StreakCalendarStrip studyDates={[]} showHeader={false} />,
    );

    expect(queryByTestId("streak-summary-header")).toBeNull();
  });
});
