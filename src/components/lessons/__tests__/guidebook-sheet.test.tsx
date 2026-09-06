import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { GuidebookSheet } from "../guidebook-sheet";
import { ThemeProvider } from "@/contexts/theme-context";

describe("GuidebookSheet", () => {
  it("renders topic guidebook details correctly and handles close", async () => {
    const handleClose = jest.fn();

    const { getByText } = await render(
      <ThemeProvider>
        <GuidebookSheet
          visible={true}
          topicIndex={0}
          topicTitle="Chào hỏi hằng ngày"
          onClose={handleClose}
        />
      </ThemeProvider>,
    );

    // Verify header and topic title
    expect(getByText("PHẦN 1")).toBeTruthy();
    expect(getByText("Chào hỏi hằng ngày")).toBeTruthy();

    // Verify sections
    expect(getByText("TỔNG QUAN & NGỮ PHÁP")).toBeTruthy();
    expect(getByText("CÁC BÀI HỌC TRONG PHẦN NÀY")).toBeTruthy();
    expect(getByText("TỪ VỰNG THEN CHỐT")).toBeTruthy();
    expect(getByText("MẪU CÂU THƯỜNG DÙNG")).toBeTruthy();

    // Verify a sample vocab from topic 1
    expect(getByText("おはよう")).toBeTruthy();

    // Verify close action
    const closeBtn = getByText("ĐÃ HIỂU →");
    fireEvent.press(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("returns null when not visible", async () => {
    const { queryByText } = await render(
      <ThemeProvider>
        <GuidebookSheet
          visible={false}
          topicIndex={0}
          topicTitle="Chào hỏi hằng ngày"
          onClose={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(queryByText("PHẦN 1")).toBeNull();
  });
});
