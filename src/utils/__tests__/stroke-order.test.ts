import {
  estimateViewBoxSize,
  flattenSvgPath,
  gradeStroke,
  parseStrokeOrderData,
  resamplePolyline,
  sampleStrokePath,
} from "@/utils/stroke-order";

describe("parseStrokeOrderData", () => {
  it("parses the backend JSON string and sorts strokes by strokeNum", () => {
    const raw = JSON.stringify([
      { strokeNum: 2, path: "M 10 10 L 90 10" },
      { strokeNum: 1, path: "M 50 5 L 50 95" },
    ]);

    const strokes = parseStrokeOrderData(raw);

    expect(strokes).toHaveLength(2);
    expect(strokes[0].strokeNum).toBe(1);
    expect(strokes[1].strokeNum).toBe(2);
  });

  it("returns an empty list for missing or malformed data", () => {
    expect(parseStrokeOrderData(null)).toEqual([]);
    expect(parseStrokeOrderData(undefined)).toEqual([]);
    expect(parseStrokeOrderData("not json")).toEqual([]);
    expect(parseStrokeOrderData('{"strokeNum":1}')).toEqual([]);
    expect(parseStrokeOrderData("[{}]")).toEqual([]);
  });
});

describe("estimateViewBoxSize", () => {
  it("detects the KanjiVG 109 grid", () => {
    expect(
      estimateViewBoxSize([
        { strokeNum: 1, path: "M40.5,41.75c1.62,0.62,4.09,0.55,6.06" },
      ]),
    ).toBe(109);
  });

  it("detects the 1024 grid used by hanzi-writer style data", () => {
    expect(
      estimateViewBoxSize([{ strokeNum: 1, path: "M 100 100 L 900 512" }]),
    ).toBe(1024);
  });
});

describe("flattenSvgPath", () => {
  it("follows absolute and relative line commands", () => {
    const points = flattenSvgPath("M 10 10 L 50 10 l 0 40 H 10 V 10");

    expect(points[0]).toEqual({ x: 10, y: 10 });
    expect(points).toContainEqual({ x: 50, y: 10 });
    expect(points).toContainEqual({ x: 50, y: 50 });
    expect(points).toContainEqual({ x: 10, y: 50 });
    expect(points[points.length - 1]).toEqual({ x: 10, y: 10 });
  });

  it("flattens cubic curves into a polyline that ends on the curve endpoint", () => {
    const points = flattenSvgPath("M 0 0 C 0 50 100 50 100 100");

    expect(points.length).toBeGreaterThan(5);
    expect(points[points.length - 1]).toEqual({ x: 100, y: 100 });
  });
});

describe("resamplePolyline", () => {
  it("returns evenly spaced points along a straight line", () => {
    const points = resamplePolyline(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      5,
    );

    expect(points).toHaveLength(5);
    expect(points[2].x).toBeCloseTo(50, 5);
    expect(points[4].x).toBeCloseTo(100, 5);
  });
});

describe("gradeStroke", () => {
  const target = sampleStrokePath("M 10 50 L 90 50");
  const viewBox = 109;

  const trace = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    steps = 16,
  ) =>
    Array.from({ length: steps + 1 }, (_, index) => ({
      x: from.x + ((to.x - from.x) * index) / steps,
      y: from.y + ((to.y - from.y) * index) / steps,
    }));

  it("accepts a stroke traced along the guide", () => {
    expect(
      gradeStroke(trace({ x: 10, y: 52 }, { x: 90, y: 48 }), target, viewBox)
        .passed,
    ).toBe(true);
  });

  it("rejects a stroke drawn in the wrong direction", () => {
    const grade = gradeStroke(
      trace({ x: 90, y: 50 }, { x: 10, y: 50 }),
      target,
      viewBox,
    );

    expect(grade.passed).toBe(false);
    expect(grade.reason).toBe("reversed");
  });

  it("rejects a stroke that is far off the guide", () => {
    const grade = gradeStroke(
      trace({ x: 10, y: 100 }, { x: 90, y: 100 }),
      target,
      viewBox,
    );

    expect(grade.passed).toBe(false);
    expect(grade.reason).toBe("off-path");
  });

  it("rejects a tap that is too short to be a stroke", () => {
    const grade = gradeStroke(
      trace({ x: 10, y: 50 }, { x: 14, y: 50 }, 2),
      target,
      viewBox,
    );

    expect(grade.passed).toBe(false);
    expect(grade.reason).toBe("too-short");
  });
});
