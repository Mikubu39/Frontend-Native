import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { StrokeOrderCanvas } from "../stroke-order-canvas";
import { useTheme } from "@/contexts/theme-context";

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));

const mockedUseTheme = useTheme as jest.Mock;

const CANVAS_SIZE = 300;
const VIEW_BOX = 109; // toạ độ lớn nhất trong dữ liệu dưới đây là 90 -> lưới KanjiVG
const STROKE_DATA = JSON.stringify([{ strokeNum: 1, path: "M 10 50 L 90 50" }]);

/** Đổi toạ độ viewBox sang pixel trên canvas để giả lập chạm. */
const toPixel = (value: number) => (value * CANVAS_SIZE) / VIEW_BOX;

async function traceStroke(
  canvas: any,
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps = 12,
) {
  const at = (index: number) => ({
    nativeEvent: {
      locationX: toPixel(from.x + ((to.x - from.x) * index) / steps),
      locationY: toPixel(from.y + ((to.y - from.y) * index) / steps),
    },
  });

  await fireEvent(canvas, "touchStart", at(0));
  for (let index = 1; index <= steps; index += 1) {
    await fireEvent(canvas, "touchMove", at(index));
  }
  await fireEvent(canvas, "touchEnd", at(steps));
}

function renderCanvas(onComplete: jest.Mock, strokeOrderData = STROKE_DATA) {
  return render(
    <StrokeOrderCanvas
      symbol="い"
      strokeOrderData={strokeOrderData}
      size={CANVAS_SIZE}
      onComplete={onComplete}
    />,
  );
}

describe("StrokeOrderCanvas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        text: "#1A1A2E",
        textSecondary: "#6B7280",
        background: "#FFF8E7",
        card: "#FFFFFF",
        border: "#E5E7EB",
        borderSubtle: "#F3F4F6",
      },
    });
  });

  it("completes the character when every stroke is traced correctly", async () => {
    const onComplete = jest.fn();
    const { getByTestId, getByText } = await renderCanvas(onComplete);

    expect(getByText("Nét 1/1")).toBeTruthy();
    await traceStroke(
      getByTestId("stroke-order-canvas"),
      { x: 10, y: 50 },
      { x: 90, y: 50 },
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(true));
  });

  it("rejects a stroke drawn in the wrong direction", async () => {
    const onComplete = jest.fn();
    const { getByTestId, findByText } = await renderCanvas(onComplete);

    await traceStroke(
      getByTestId("stroke-order-canvas"),
      { x: 90, y: 50 },
      { x: 10, y: 50 },
    );

    expect(
      await findByText(
        "Nét bị vẽ ngược chiều. Hãy viết từ điểm chấm xanh đi ra nhé!",
      ),
    ).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("marks the question as wrong when the learner misses too many times", async () => {
    const onComplete = jest.fn();
    const { getByTestId } = await renderCanvas(onComplete);
    const canvas = getByTestId("stroke-order-canvas");

    // 3 nét lệch hẳn khỏi nét mẫu (mặc định chỉ cho phép sai 2 lần).
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await traceStroke(canvas, { x: 10, y: 100 }, { x: 90, y: 100 });
    }
    await traceStroke(canvas, { x: 10, y: 50 }, { x: 90, y: 50 });

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(false));
  });

  it("falls back to free drawing when the backend has no stroke data", async () => {
    const onComplete = jest.fn();
    const { getByTestId, getByText } = await renderCanvas(onComplete, "");

    expect(getByText("Viết tự do")).toBeTruthy();
    const finishButton = getByText("Tôi đã viết xong");

    // Chưa vẽ nét nào -> bấm không kích hoạt onComplete
    fireEvent.press(finishButton);
    expect(onComplete).not.toHaveBeenCalled();

    // Vẽ 1 nét tự do
    await traceStroke(
      getByTestId("stroke-order-canvas"),
      { x: 20, y: 20 },
      { x: 50, y: 50 },
    );

    // Đã vẽ nét -> bấm hoàn thành
    fireEvent.press(finishButton);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(true));
  });

  it("renders compound characters on a single line with scaled down font size", async () => {
    const onComplete = jest.fn();
    const { getByText } = await render(
      <StrokeOrderCanvas
        symbol="きょ"
        strokeOrderData=""
        size={CANVAS_SIZE}
        onComplete={onComplete}
      />,
    );

    const ghostText = getByText("きょ");
    expect(ghostText).toBeTruthy();
    expect(ghostText.props.numberOfLines).toBe(1);
    expect(ghostText.props.adjustsFontSizeToFit).toBe(true);
    expect(ghostText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: Math.round(CANVAS_SIZE * 0.36) }),
      ]),
    );
  });
});
