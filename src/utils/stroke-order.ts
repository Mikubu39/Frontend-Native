/**
 * Stroke-order helpers.
 *
 * The backend ships each character's stroke order as a JSON string of SVG path
 * data (KanjiVG-style). React Native has no DOM, so `hanzi-writer` (and any
 * other browser SVG library) is unusable here: we sample the paths ourselves
 * and grade the user's tracing against the sampled points.
 */

import { StrokeDefinition } from "@/types/alphabet";

export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeGrade {
  passed: boolean;
  /** Vì sao nét bị từ chối - dùng để hiển thị gợi ý cho người học. */
  reason?: "reversed" | "off-path" | "too-short";
}

/** Số điểm dùng để so khớp một nét. */
const SAMPLE_COUNT = 32;
/** Số đoạn thẳng dùng để làm phẳng một đoạn bezier. */
const BEZIER_STEPS = 12;

const COMMAND_PATTERN = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
const NUMBER_PATTERN = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/**
 * Parse chuỗi `strokeOrderData` của backend. Trả về mảng rỗng nếu dữ liệu
 * thiếu hoặc hỏng (màn hình sẽ tự fallback sang chế độ viết tự do).
 */
export function parseStrokeOrderData(raw?: string | null): StrokeDefinition[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is StrokeDefinition =>
          !!item && typeof item.path === "string" && item.path.length > 0,
      )
      .map((item, index) => ({
        strokeNum: Number(item.strokeNum) || index + 1,
        path: item.path,
      }))
      .sort((a, b) => a.strokeNum - b.strokeNum);
  } catch {
    return [];
  }
}

/**
 * KanjiVG dùng viewBox 109, một số bộ dữ liệu khác (hanzi-writer) dùng 1024.
 * Đoán kích thước từ toạ độ lớn nhất thay vì hard-code.
 */
export function estimateViewBoxSize(strokes: StrokeDefinition[]): number {
  let max = 0;
  for (const stroke of strokes) {
    const numbers = stroke.path.match(NUMBER_PATTERN);
    if (!numbers) continue;
    for (const value of numbers) {
      const abs = Math.abs(Number(value));
      if (Number.isFinite(abs) && abs > max) max = abs;
    }
  }
  if (max <= 0) return 109;
  if (max <= 120) return 109;
  if (max <= 1100) return 1024;
  return Math.ceil(max);
}

function readNumbers(input: string): number[] {
  const matches = input.match(NUMBER_PATTERN);
  if (!matches) return [];
  return matches.map(Number).filter((n) => Number.isFinite(n));
}

function cubicAt(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

/**
 * Làm phẳng path SVG thành một polyline. Hỗ trợ M/L/H/V/C/S/Q/T/Z (cả dạng
 * tương đối). Lệnh cung tròn `A` hiếm gặp trong dữ liệu nét chữ nên được xấp
 * xỉ bằng đoạn thẳng tới điểm cuối.
 */
export function flattenSvgPath(d: string): StrokePoint[] {
  const points: StrokePoint[] = [];
  let current: StrokePoint = { x: 0, y: 0 };
  let subpathStart: StrokePoint = { x: 0, y: 0 };
  // Gom vào object: TypeScript không theo dõi được các phép gán bên trong
  // closure `addCubic`/`addQuadratic` nếu dùng biến `let` rời rạc.
  const controls: { cubic: StrokePoint | null; quad: StrokePoint | null } = {
    cubic: null,
    quad: null,
  };

  const push = (point: StrokePoint) => {
    const previous = points[points.length - 1];
    if (previous && previous.x === point.x && previous.y === point.y) return;
    points.push(point);
  };

  const addCubic = (c1: StrokePoint, c2: StrokePoint, end: StrokePoint) => {
    for (let step = 1; step <= BEZIER_STEPS; step += 1) {
      const t = step / BEZIER_STEPS;
      push({
        x: cubicAt(current.x, c1.x, c2.x, end.x, t),
        y: cubicAt(current.y, c1.y, c2.y, end.y, t),
      });
    }
    current = end;
    controls.cubic = c2;
    controls.quad = null;
  };

  const addQuadratic = (control: StrokePoint, end: StrokePoint) => {
    // Nâng bậc quadratic -> cubic để dùng chung bộ lấy mẫu.
    const c1 = {
      x: current.x + (2 / 3) * (control.x - current.x),
      y: current.y + (2 / 3) * (control.y - current.y),
    };
    const c2 = {
      x: end.x + (2 / 3) * (control.x - end.x),
      y: end.y + (2 / 3) * (control.y - end.y),
    };
    addCubic(c1, c2, end);
    controls.quad = control;
    controls.cubic = null;
  };

  COMMAND_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COMMAND_PATTERN.exec(d)) !== null) {
    const command = match[1];
    const args = readNumbers(match[2]);
    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();

    if (upper === "Z") {
      push({ ...subpathStart });
      current = { ...subpathStart };
      controls.cubic = null;
      controls.quad = null;
      continue;
    }

    const arity =
      upper === "M" || upper === "L" || upper === "T"
        ? 2
        : upper === "H" || upper === "V"
          ? 1
          : upper === "C"
            ? 6
            : upper === "S" || upper === "Q"
              ? 4
              : 7; // A

    for (let i = 0; i + arity <= args.length; i += arity) {
      const chunk = args.slice(i, i + arity);
      const baseX = relative ? current.x : 0;
      const baseY = relative ? current.y : 0;

      switch (upper) {
        case "M": {
          const end = { x: baseX + chunk[0], y: baseY + chunk[1] };
          // Chỉ cặp toạ độ đầu là moveto, các cặp sau là lineto ngầm định.
          if (i === 0) {
            current = end;
            subpathStart = { ...end };
            push({ ...end });
          } else {
            push({ ...end });
            current = end;
          }
          controls.cubic = null;
          controls.quad = null;
          break;
        }
        case "L": {
          const end = { x: baseX + chunk[0], y: baseY + chunk[1] };
          push({ ...end });
          current = end;
          controls.cubic = null;
          controls.quad = null;
          break;
        }
        case "H": {
          const end = { x: baseX + chunk[0], y: current.y };
          push({ ...end });
          current = end;
          controls.cubic = null;
          controls.quad = null;
          break;
        }
        case "V": {
          const end = { x: current.x, y: baseY + chunk[0] };
          push({ ...end });
          current = end;
          controls.cubic = null;
          controls.quad = null;
          break;
        }
        case "C": {
          addCubic(
            { x: baseX + chunk[0], y: baseY + chunk[1] },
            { x: baseX + chunk[2], y: baseY + chunk[3] },
            { x: baseX + chunk[4], y: baseY + chunk[5] },
          );
          break;
        }
        case "S": {
          const previous = controls.cubic;
          const reflected = previous
            ? {
                x: 2 * current.x - previous.x,
                y: 2 * current.y - previous.y,
              }
            : { ...current };
          addCubic(
            reflected,
            { x: baseX + chunk[0], y: baseY + chunk[1] },
            { x: baseX + chunk[2], y: baseY + chunk[3] },
          );
          break;
        }
        case "Q": {
          addQuadratic(
            { x: baseX + chunk[0], y: baseY + chunk[1] },
            { x: baseX + chunk[2], y: baseY + chunk[3] },
          );
          break;
        }
        case "T": {
          const previous = controls.quad;
          const reflected = previous
            ? {
                x: 2 * current.x - previous.x,
                y: 2 * current.y - previous.y,
              }
            : { ...current };
          addQuadratic(reflected, {
            x: baseX + chunk[0],
            y: baseY + chunk[1],
          });
          break;
        }
        default: {
          // A: xấp xỉ bằng đoạn thẳng tới điểm cuối.
          const end = { x: baseX + chunk[5], y: baseY + chunk[6] };
          push({ ...end });
          current = end;
          controls.cubic = null;
          controls.quad = null;
          break;
        }
      }
    }
  }

  return points;
}

function distance(a: StrokePoint, b: StrokePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function polylineLength(points: StrokePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Lấy `count` điểm cách đều nhau (theo chiều dài cung) trên một polyline.
 */
export function resamplePolyline(
  points: StrokePoint[],
  count: number = SAMPLE_COUNT,
): StrokePoint[] {
  if (points.length === 0) return [];
  if (points.length === 1 || count < 2) {
    return Array.from({ length: Math.max(count, 1) }, () => ({
      ...points[0],
    }));
  }

  const total = polylineLength(points);
  if (total === 0) {
    return Array.from({ length: count }, () => ({ ...points[0] }));
  }

  const step = total / (count - 1);
  const result: StrokePoint[] = [{ ...points[0] }];
  let segmentIndex = 1;
  let travelled = 0;
  let segmentStart = points[0];
  let segmentLength = distance(points[0], points[1]);

  for (let i = 1; i < count - 1; i += 1) {
    const target = step * i;
    while (
      travelled + segmentLength < target &&
      segmentIndex < points.length - 1
    ) {
      travelled += segmentLength;
      segmentIndex += 1;
      segmentStart = points[segmentIndex - 1];
      segmentLength = distance(segmentStart, points[segmentIndex]);
    }
    const ratio =
      segmentLength === 0 ? 0 : (target - travelled) / segmentLength;
    const segmentEnd = points[segmentIndex];
    result.push({
      x: segmentStart.x + (segmentEnd.x - segmentStart.x) * ratio,
      y: segmentStart.y + (segmentEnd.y - segmentStart.y) * ratio,
    });
  }

  result.push({ ...points[points.length - 1] });
  return result;
}

/** Lấy mẫu một nét từ path SVG, đã chuẩn hoá về `SAMPLE_COUNT` điểm. */
export function sampleStrokePath(
  d: string,
  count: number = SAMPLE_COUNT,
): StrokePoint[] {
  return resamplePolyline(flattenSvgPath(d), count);
}

function meanDistance(a: StrokePoint[], b: StrokePoint[]): number {
  if (a.length === 0 || a.length !== b.length) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let i = 0; i < a.length; i += 1) {
    total += distance(a[i], b[i]);
  }
  return total / a.length;
}

/**
 * Chấm một nét người dùng vừa vẽ so với nét mẫu.
 *
 * Cả hai mảng điểm phải cùng hệ toạ độ viewBox; `viewBoxSize` quyết định
 * ngưỡng sai số nên hàm này hoạt động với mọi bộ dữ liệu (109 hay 1024).
 */
export function gradeStroke(
  userPoints: StrokePoint[],
  targetPoints: StrokePoint[],
  viewBoxSize: number,
): StrokeGrade {
  if (targetPoints.length === 0) return { passed: true };
  if (userPoints.length < 2) return { passed: false, reason: "too-short" };

  const targetLength = polylineLength(targetPoints);
  const userLength = polylineLength(userPoints);
  // Nét quá ngắn (chạm nhẹ) không được tính, trừ khi nét mẫu vốn đã rất ngắn.
  if (userLength < Math.min(targetLength * 0.35, viewBoxSize * 0.05)) {
    return { passed: false, reason: "too-short" };
  }

  const sampledUser = resamplePolyline(userPoints, targetPoints.length);
  const forward = meanDistance(sampledUser, targetPoints);
  const backward = meanDistance([...sampledUser].reverse(), targetPoints);

  const meanTolerance = viewBoxSize * 0.16;
  const endTolerance = viewBoxSize * 0.26;

  if (backward < forward && backward <= meanTolerance) {
    return { passed: false, reason: "reversed" };
  }

  const startGap = distance(sampledUser[0], targetPoints[0]);
  const endGap = distance(
    sampledUser[sampledUser.length - 1],
    targetPoints[targetPoints.length - 1],
  );

  if (
    forward <= meanTolerance &&
    startGap <= endTolerance &&
    endGap <= endTolerance
  ) {
    return { passed: true };
  }

  return { passed: false, reason: "off-path" };
}

/** Chuyển polyline thành thuộc tính `d` của `<Path />`. */
export function toSvgPathData(points: StrokePoint[]): string {
  if (points.length === 0) return "";
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}
