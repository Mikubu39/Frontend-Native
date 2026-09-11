/**
 * Integration tests cho nút hành động chính.
 *
 * Nút này được 30 màn import nên hành vi của nó phải được khoá lại: bấm thì
 * gọi đúng một lần, khoá thì không gọi, đang tải thì không cho bấm lần hai.
 */
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { GradientButton } from "../gradient-button";
import { Colors } from "@/constants/theme";

/** Gộp mảng style RN thành một object phẳng để tra thuộc tính. */
function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, item) => ({ ...acc, ...flatten(item) }),
      {},
    );
  }
  return (style as Record<string, unknown>) ?? {};
}

describe("GradientButton", () => {
  it("hiện nhãn và gọi onPress khi bấm", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <GradientButton title="TIẾP TỤC" onPress={onPress} />,
    );

    fireEvent.press(getByText("TIẾP TỤC"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("không gọi onPress khi bị khoá", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <GradientButton
        testID="cta"
        title="TIẾP TỤC"
        onPress={onPress}
        disabled
      />,
    );

    fireEvent.press(getByTestId("cta"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("chặn bấm lần hai trong lúc đang tải", async () => {
    const onPress = jest.fn();
    const { getByTestId, queryByText } = await render(
      <GradientButton
        testID="cta"
        title="ĐANG NỘP BÀI..."
        onPress={onPress}
        loading
      />,
    );

    fireEvent.press(getByTestId("cta"));

    expect(onPress).not.toHaveBeenCalled();
    // Nhãn nhường chỗ cho vòng quay, tránh người dùng tưởng nút còn bấm được.
    expect(queryByText("ĐANG NỘP BÀI...")).toBeNull();
  });

  it("báo đúng trạng thái khoá / đang bận cho trình đọc màn hình", async () => {
    const { getByTestId } = await render(
      <GradientButton
        testID="cta"
        title="TIẾP TỤC"
        onPress={jest.fn()}
        loading
      />,
    );

    expect(getByTestId("cta").props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });

  it("dùng nhãn làm tên mặc định, và ưu tiên accessibilityLabel khi có", async () => {
    const { getByLabelText, rerender } = await render(
      <GradientButton title="TIẾP TỤC" onPress={jest.fn()} />,
    );
    expect(getByLabelText("TIẾP TỤC")).toBeTruthy();

    await rerender(
      <GradientButton
        title="TIẾP TỤC"
        onPress={jest.fn()}
        accessibilityLabel="Sang câu tiếp theo"
      />,
    );
    expect(getByLabelText("Sang câu tiếp theo")).toBeTruthy();
  });

  // Chốt chặn cho lỗi đã gặp thật: có lúc nút outline được vẽ nền chàm trong
  // khi chữ cũng màu chàm — chàm trên chàm, nút hiện ra trống trơn không chữ.
  it.each([["outline" as const], ["ghost" as const]])(
    "biến thể %s không tự sơn nền, nên chữ luôn đọc được",
    async (variant) => {
      const { getByTestId } = await render(
        <GradientButton
          testID="cta"
          title="ĐỂ SAU"
          onPress={jest.fn()}
          variant={variant}
        />,
      );

      const surface = flatten(getByTestId("cta-surface").props.style);
      expect(surface.backgroundColor).toBe("transparent");
    },
  );

  it("nút đặc có gờ đáy tối hơn mặt nút", async () => {
    const { getByTestId } = await render(
      <GradientButton testID="cta" title="TIẾP TỤC" onPress={jest.fn()} />,
    );

    const surface = flatten(getByTestId("cta-surface").props.style);
    expect(surface.backgroundColor).toBe(Colors.primary);
    expect(surface.borderBottomWidth).toBeGreaterThan(0);
    expect(surface.borderBottomColor).not.toBe(Colors.primary);
  });

  it("nút bị khoá mất gờ đáy — không trông như bấm được", async () => {
    const { getByTestId } = await render(
      <GradientButton
        testID="cta"
        title="TIẾP TỤC"
        onPress={jest.fn()}
        disabled
      />,
    );

    const surface = flatten(getByTestId("cta-surface").props.style);
    expect(surface.borderBottomWidth).toBe(0);
  });

  it("biến thể outline vẫn bấm được", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <GradientButton title="THỬ LẠI" onPress={onPress} variant="outline" />,
    );

    fireEvent.press(getByText("THỬ LẠI"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
