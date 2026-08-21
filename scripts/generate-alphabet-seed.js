#!/usr/bin/env node
/**
 * Sinh dữ liệu seed đầy đủ cho tính năng Bảng chữ cái.
 *
 * Kết quả là JSON đúng định dạng `POST /api/v1/admin/alphabets/bulk`:
 *   [{ symbol, romaji, type, groupName, audioUrl, orderIndex, strokeOrderData }]
 *
 * Nét viết (`strokeOrderData`) lấy từ KanjiVG (https://kanjivg.tagaini.net),
 * giấy phép CC BY-SA 3.0 — xem scripts/seed/README.md để biết yêu cầu ghi công.
 *
 * Cách dùng:
 *   node scripts/generate-alphabet-seed.js
 *   node scripts/generate-alphabet-seed.js --no-strokes          # bỏ qua tải nét
 *   node scripts/generate-alphabet-seed.js --no-yoon             # bỏ âm ghép (きゃ...)
 *   node scripts/generate-alphabet-seed.js --audio=wikimedia     # audio .oga (chỉ Android)
 *   node scripts/generate-alphabet-seed.js --audio-base=https://cdn.cua-ban/audio
 */

const fs = require("fs");
const path = require("path");
const { buildCharacters } = require("./alphabet-table");

// Chạy qua `npm run seed:alphabets` nên cwd luôn là gốc dự án (giống các script
// khác trong thư mục này).
const OUTPUT_DIR = path.join(process.cwd(), "scripts", "seed");
const CACHE_DIR = path.join(process.cwd(), "scripts", ".cache", "kanjivg");
const KANJIVG_BASE =
  "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
const CONCURRENCY = 6;

function parseArgs(argv) {
  const options = {
    strokes: true,
    yoon: true,
    audioMode: "none",
    audioBase: null,
  };

  for (const arg of argv) {
    if (arg === "--no-strokes") options.strokes = false;
    else if (arg === "--no-yoon") options.yoon = false;
    else if (arg === "--audio=wikimedia") options.audioMode = "wikimedia";
    else if (arg.startsWith("--audio-base=")) {
      options.audioMode = "base";
      options.audioBase = arg.slice("--audio-base=".length).replace(/\/$/, "");
    } else if (arg.startsWith("--")) {
      console.warn(`Bỏ qua tham số không nhận diện được: ${arg}`);
    }
  }

  return options;
}

/** Mã file KanjiVG: codepoint hệ 16, 5 chữ số, chữ thường. Ví dụ あ -> 03042. */
function kanjivgId(symbol) {
  return symbol.codePointAt(0).toString(16).padStart(5, "0");
}

async function fetchStrokeSvg(symbol) {
  const id = kanjivgId(symbol);
  const cachePath = path.join(CACHE_DIR, `${id}.svg`);

  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  }

  const response = await fetch(`${KANJIVG_BASE}/${id}.svg`);
  if (!response.ok) {
    throw new Error(`KanjiVG ${id} (${symbol}) -> HTTP ${response.status}`);
  }

  const svg = await response.text();
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath, svg, "utf8");
  return svg;
}

/**
 * Rút các nét theo đúng thứ tự từ SVG của KanjiVG.
 * Mỗi nét có id dạng `kvg:03042-s1`, số sau `-s` chính là thứ tự nét.
 */
function extractStrokes(svg) {
  const pattern = /<path[^>]*id="kvg:[^"]*-s(\d+)"[^>]*\sd="([^"]+)"/g;
  const strokes = [];
  let match;

  while ((match = pattern.exec(svg)) !== null) {
    strokes.push({ strokeNum: Number(match[1]), path: match[2] });
  }

  return strokes.sort((a, b) => a.strokeNum - b.strokeNum);
}

function buildAudioUrl(character, options) {
  if (options.audioMode === "base") {
    const folder = character.type.toLowerCase();
    return `${options.audioBase}/${folder}/${character.romaji}.mp3`;
  }

  if (options.audioMode === "wikimedia") {
    // Wikimedia Commons đặt tên dạng "Ja-A.oga", "Ja-Ka.oga".
    const name =
      character.romaji.charAt(0).toUpperCase() + character.romaji.slice(1);
    return `https://commons.wikimedia.org/wiki/Special:FilePath/Ja-${name}.oga`;
  }

  return null;
}

/** Chạy `worker` trên `items` với số luồng giới hạn. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    })(),
  );

  await Promise.all(runners);
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const characters = [
    ...buildCharacters("HIRAGANA", { includeYoon: options.yoon }),
    ...buildCharacters("KATAKANA", { includeYoon: options.yoon }),
  ].map((character) => ({
    ...character,
    audioUrl: buildAudioUrl(character, options),
    strokeOrderData: null,
  }));

  console.log(`Đã dựng ${characters.length} chữ cái.`);

  const failures = [];
  let withStrokes = 0;
  let skippedCombos = 0;

  if (options.strokes) {
    console.log("Đang tải nét viết từ KanjiVG...");

    await mapWithConcurrency(characters, CONCURRENCY, async (character) => {
      // Âm ghép là tổ hợp 2 ký tự, KanjiVG chỉ có dữ liệu cho từng ký tự đơn.
      if ([...character.symbol].length > 1) {
        skippedCombos += 1;
        return;
      }

      try {
        const svg = await fetchStrokeSvg(character.symbol);
        const strokes = extractStrokes(svg);
        if (strokes.length === 0) {
          failures.push(`${character.symbol}: SVG không có nét nào`);
          return;
        }
        character.strokeOrderData = JSON.stringify(strokes);
        withStrokes += 1;
      } catch (error) {
        failures.push(`${character.symbol}: ${error.message}`);
      }
    });
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const hiragana = characters.filter((c) => c.type === "HIRAGANA");
  const katakana = characters.filter((c) => c.type === "KATAKANA");
  const write = (name, data) => {
    const file = path.join(OUTPUT_DIR, name);
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    const kb = (fs.statSync(file).size / 1024).toFixed(1);
    console.log(
      `  ${path.relative(process.cwd(), file)} (${data.length} chữ, ${kb} KB)`,
    );
  };

  console.log("Đã ghi:");
  write("alphabet-hiragana.json", hiragana);
  write("alphabet-katakana.json", katakana);
  write("alphabet-all.json", characters);

  console.log(
    `\nTổng kết: ${characters.length} chữ | có nét viết: ${withStrokes} | ` +
      `âm ghép bỏ qua nét: ${skippedCombos} | lỗi: ${failures.length}`,
  );

  if (failures.length > 0) {
    console.log("Các chữ tải nét thất bại:");
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
