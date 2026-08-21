/**
 * Kiểm tra dữ liệu seed thật (scripts/seed/alphabet-all.json) chạy được với bộ
 * chấm nét của app: parse được, đúng lưới 109, và một nét tô hoàn hảo thì PASS.
 *
 * Test tự bỏ qua nếu chưa chạy `npm run seed:alphabets`.
 */

import fs from "fs";
import path from "path";
import {
  estimateViewBoxSize,
  gradeStroke,
  parseStrokeOrderData,
  sampleStrokePath,
} from "@/utils/stroke-order";

interface SeedCharacter {
  symbol: string;
  romaji: string;
  type: string;
  groupName: string;
  audioUrl: string | null;
  orderIndex: number;
  strokeOrderData: string | null;
}

const SEED_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "scripts",
  "seed",
  "alphabet-all.json",
);

const seedExists = fs.existsSync(SEED_PATH);
const describeSeed = seedExists ? describe : describe.skip;

describeSeed("alphabet seed data", () => {
  const seed: SeedCharacter[] = seedExists
    ? JSON.parse(fs.readFileSync(SEED_PATH, "utf8"))
    : [];
  const withStrokes = seed.filter((item) => !!item.strokeOrderData);

  it("covers both syllabaries with unique order indexes", () => {
    const hiragana = seed.filter((item) => item.type === "HIRAGANA");
    const katakana = seed.filter((item) => item.type === "KATAKANA");

    expect(hiragana.length).toBeGreaterThanOrEqual(104);
    expect(katakana.length).toBe(hiragana.length);

    for (const group of [hiragana, katakana]) {
      const indexes = group.map((item) => item.orderIndex);
      expect(new Set(indexes).size).toBe(group.length);
      const symbols = group.map((item) => item.symbol);
      expect(new Set(symbols).size).toBe(group.length);
    }
  });

  it("ships parseable stroke data for every single-codepoint character", () => {
    const singles = seed.filter((item) => [...item.symbol].length === 1);
    const missing = singles.filter((item) => !item.strokeOrderData);

    expect(missing.map((item) => item.symbol)).toEqual([]);
    expect(withStrokes.length).toBe(singles.length);
  });

  it("parses every stroke onto the 109 grid the canvas expects", () => {
    const broken: string[] = [];

    for (const character of withStrokes) {
      const strokes = parseStrokeOrderData(character.strokeOrderData);
      if (strokes.length === 0) {
        broken.push(`${character.symbol}: không parse được`);
        continue;
      }
      if (estimateViewBoxSize(strokes) !== 109) {
        broken.push(`${character.symbol}: viewBox lạ`);
        continue;
      }
      for (const stroke of strokes) {
        const points = sampleStrokePath(stroke.path);
        const isFinite = points.every(
          (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
        );
        const inside = points.every(
          (point) =>
            point.x >= -5 && point.x <= 114 && point.y >= -5 && point.y <= 114,
        );
        if (!isFinite || !inside) {
          broken.push(`${character.symbol}: nét ${stroke.strokeNum} lệch lưới`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it("accepts a perfect trace of every stroke of every character", () => {
    const rejected: string[] = [];

    for (const character of withStrokes) {
      const strokes = parseStrokeOrderData(character.strokeOrderData);
      for (const stroke of strokes) {
        const target = sampleStrokePath(stroke.path);
        // Người dùng tô trùng khít nét mẫu -> phải luôn được chấm ĐÚNG.
        const grade = gradeStroke(target, target, 109);
        if (!grade.passed) {
          rejected.push(
            `${character.symbol} nét ${stroke.strokeNum} (${grade.reason})`,
          );
        }
      }
    }

    expect(rejected).toEqual([]);
  });

  it("still accepts a shaky trace within ~7% of the grid", () => {
    // PRNG cố định để test không bị nhấp nháy.
    let state = 42;
    const noise = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return (state / 2147483648 - 0.5) * 16; // +-8 đơn vị trên lưới 109
    };

    const rejected: string[] = [];

    for (const character of withStrokes) {
      for (const stroke of parseStrokeOrderData(character.strokeOrderData)) {
        const target = sampleStrokePath(stroke.path);
        const shaky = target.map((point) => ({
          x: point.x + noise(),
          y: point.y + noise(),
        }));
        if (!gradeStroke(shaky, target, 109).passed) {
          rejected.push(`${character.symbol} nét ${stroke.strokeNum}`);
        }
      }
    }

    expect(rejected).toEqual([]);
  });
});
