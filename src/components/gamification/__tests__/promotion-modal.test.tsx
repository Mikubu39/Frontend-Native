import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PromotionModal } from "../promotion-modal";
import { ThemeProvider } from "@/contexts/theme-context";

describe("PromotionModal", () => {
  it("renders rank promotion celebration correctly and handles continue press", async () => {
    const handleClose = jest.fn();

    const { getByText, getByTestId } = await render(
      <ThemeProvider>
        <PromotionModal
          visible={true}
          newRankName="GOLD"
          onClose={handleClose}
        />
      </ThemeProvider>,
    );

    expect(getByText("XUẤT SẮC THĂNG HẠNG!")).toBeTruthy();
    expect(getByText("HẠNG VÀNG")).toBeTruthy();
    expect(getByTestId("promotion-badge-icon")).toBeTruthy();

    const continueBtn = getByText("TIẾP TỤC →");
    fireEvent.press(continueBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders Diamond rank configuration", async () => {
    const { getByText, getByTestId } = await render(
      <ThemeProvider>
        <PromotionModal
          visible={true}
          newRankName="DIAMOND"
          onClose={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(getByText("HẠNG KIM CƯƠNG")).toBeTruthy();
    expect(getByTestId("promotion-badge-icon")).toBeTruthy();
  });

  it("returns null when visible is false", async () => {
    const { queryByText } = await render(
      <ThemeProvider>
        <PromotionModal
          visible={false}
          newRankName="GOLD"
          onClose={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(queryByText("HẠNG VÀNG")).toBeNull();
  });
});
