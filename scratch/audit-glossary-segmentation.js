// One-off audit script: replicate the FE's JapaneseText DP segmentation + the
// toGlossary()/readGlossary() filters against the REAL exported DB data, to find
// every sentence where a word is cut wrong (false-positive particle/aux match)
// or cut short (a real word never becomes tappable because no dictionary key
// literally occurs in the sentence text).
//
// Inputs (pre-exported via docker exec mysql, see conversation):
//   /tmp/nihongo_audit/vocab.jsonl      -- one JSON object per vocabulary row
//   /tmp/nihongo_audit/questions.jsonl  -- one JSON object per lesson_questions row
//
// This is read-only analysis; does not touch the DB or the app.

const fs = require("fs");
const readline = require("readline");

const VOCAB_PATH = "C:\\Users\\Endministrator\\AppData\\Local\\Temp\\nihongo_audit\\vocab.jsonl";
const QUESTIONS_PATH = "C:\\Users\\Endministrator\\AppData\\Local\\Temp\\nihongo_audit\\questions.jsonl";

// ---- mirrors src/contexts/glossary-context.tsx GRAMMAR_AUX_WORDS ----
const GRAMMAR_AUX_WORDS = new Set(["です", "でした", "ます", "ません"]);
// ---- mirrors src/contexts/glossary-context.tsx SINGLE_KANA_REGEX ----
const SINGLE_KANA_REGEX = /^[぀-ゟ゠-ヿ]$/;

function readJsonl(path) {
  const text = fs.readFileSync(path, "utf8");
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// ---- mirrors src/contexts/glossary-context.tsx toGlossary() ----
function buildGlobalGlossary(vocabRows) {
  const out = {};
  for (const item of vocabRows) {
    if (!item.surface) continue;
    if (item.item_type === "KANA") continue;
    if (item.surface.length === 1 && SINGLE_KANA_REGEX.test(item.surface)) continue;
    if (GRAMMAR_AUX_WORDS.has(item.surface)) continue;
    out[item.surface] = { r: item.romaji, v: item.meaning_vn, srcId: item.id };
    if (item.reading && item.reading !== item.surface) {
      out[item.reading] = { r: item.romaji, v: item.meaning_vn, srcId: item.id };
    }
  }
  return out;
}

// ---- mirrors src/utils/quiz-mapper.ts readGlossary() ----
function readLocalGlossary(metadataJson) {
  const raw = metadataJson && metadataJson.glossary;
  if (!raw || typeof raw !== "object") return undefined;
  const out = {};
  for (const [word, entry] of Object.entries(raw)) {
    if (!word || !entry || typeof entry !== "object") continue;
    if (word.length === 1 && SINGLE_KANA_REGEX.test(word)) continue;
    if (GRAMMAR_AUX_WORDS.has(word)) continue;
    const { r, v } = entry;
    if (r || v) out[word] = { r, v };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// ---- mirrors the DP in src/components/ui/japanese-text.tsx JapaneseText ----
const PUNCT_REGEX = /[。、！？?!\s.,「」『』()\[\]:：]/;

function segment(rawText, dictionary) {
  const n = rawText.length;
  const dp = Array.from({ length: n + 1 }, () => ({ score: 0, tokens: [] }));

  for (let i = 0; i < n; i++) {
    const cur = dp[i];
    const char = rawText[i];

    if (PUNCT_REGEX.test(char)) {
      const candScore = cur.score + 1;
      if (candScore > dp[i + 1].score) {
        const last = cur.tokens[cur.tokens.length - 1];
        let nextTokens;
        if (last && !last.lookup) {
          nextTokens = [...cur.tokens.slice(0, -1), { text: last.text + char }];
        } else {
          nextTokens = [...cur.tokens, { text: char }];
        }
        dp[i + 1] = { score: candScore, tokens: nextTokens };
      }
      continue;
    }

    if (cur.score >= dp[i + 1].score) {
      const last = cur.tokens[cur.tokens.length - 1];
      let nextTokens;
      if (last && !last.lookup) {
        nextTokens = [...cur.tokens.slice(0, -1), { text: last.text + char }];
      } else {
        nextTokens = [...cur.tokens, { text: char }];
      }
      dp[i + 1] = { score: cur.score, tokens: nextTokens };
    }

    const rest = rawText.slice(i);
    for (const word in dictionary) {
      if (rest.startsWith(word)) {
        const wLen = word.length;
        const candScore = cur.score + wLen * wLen;
        if (candScore > dp[i + wLen].score) {
          dp[i + wLen] = {
            score: candScore,
            tokens: [...cur.tokens, { text: word, lookup: dictionary[word] }],
          };
        }
      }
    }
  }

  return dp[n].tokens;
}

// ---- Japanese char-class helpers ----
const KANJI_RE = /[一-鿿㐀-䶿]/;
const JP_RE = /[぀-ヿ一-鿿㐀-䶿ー]/;

function findUncoveredKanjiRuns(chunks) {
  const runs = [];
  let cur = "";
  for (const chunk of chunks) {
    if (chunk.lookup) {
      if (cur) {
        runs.push(cur);
        cur = "";
      }
      continue;
    }
    // Unmatched chunk: scan char by char, only keep kanji runs (kana gaps are
    // usually legitimate particles/okurigana, not "missing vocab").
    for (const ch of chunk.text) {
      if (KANJI_RE.test(ch)) {
        cur += ch;
      } else {
        if (cur) {
          runs.push(cur);
          cur = "";
        }
      }
    }
  }
  if (cur) runs.push(cur);
  return runs;
}

function extractJapaneseFields(obj, out, seenKeys) {
  if (!obj || typeof obj !== "object") return;
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string" && (key === "kana" || key === "jp" || key === "prompt")) {
      if (JP_RE.test(val)) out.add(val);
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      // Do not descend into "glossary" — that's dictionary data, not prompt text.
      if (key !== "glossary") extractJapaneseFields(val, out, seenKeys);
    }
  }
}

function main() {
  const vocabRows = readJsonl(VOCAB_PATH);
  const questionRows = readJsonl(QUESTIONS_PATH);

  const globalGlossary = buildGlobalGlossary(vocabRows);
  console.log(`Global glossary size after FE filters: ${Object.keys(globalGlossary).length} (raw vocab rows: ${vocabRows.length})`);

  // dedupe (text, localGlossaryJSON) pairs since many question_type variants repeat the same sentence
  const seen = new Map(); // key -> {text, localGlossary, questionIds}
  let leakedShortMatches = [];
  let uncoveredReport = [];

  for (const q of questionRows) {
    let meta;
    try {
      meta = typeof q.metadata_json === "string" ? JSON.parse(q.metadata_json) : q.metadata_json;
    } catch {
      continue;
    }
    if (!meta) continue;

    const texts = new Set();
    extractJapaneseFields(meta, texts, new Set());
    const localGlossary = readLocalGlossary(meta);

    for (const text of texts) {
      const dictKey = JSON.stringify(localGlossary || {});
      const key = text + "||" + dictKey;
      if (!seen.has(key)) {
        seen.set(key, { text, localGlossary, questionIds: [] });
      }
      seen.get(key).questionIds.push(q.id);
    }
  }

  console.log(`Unique (text, local-glossary) pairs to analyze: ${seen.size}`);

  for (const { text, localGlossary, questionIds } of seen.values()) {
    const merged = { ...globalGlossary, ...(localGlossary || {}) };
    const chunks = segment(text, merged);

    // Sanity: confirm no length-1 or GRAMMAR_AUX_WORDS leaked through despite filters
    // (would indicate a bug in the filter logic itself, not the data).
    for (const c of chunks) {
      if (c.lookup && ((c.text.length === 1 && SINGLE_KANA_REGEX.test(c.text)) || GRAMMAR_AUX_WORDS.has(c.text))) {
        leakedShortMatches.push({ text, matched: c.text, questionIds: questionIds.slice(0, 3) });
      }
    }

    const uncoveredKanjiRuns = findUncoveredKanjiRuns(chunks);
    if (uncoveredKanjiRuns.length > 0) {
      uncoveredReport.push({
        text,
        uncoveredKanjiRuns,
        questionIds: questionIds.slice(0, 3),
        totalQuestionHits: questionIds.length,
      });
    }
  }

  console.log("\n=== SANITY CHECK: leaked length-1 / GRAMMAR_AUX matches (should be empty) ===");
  console.log(leakedShortMatches.length === 0 ? "OK — none found." : JSON.stringify(leakedShortMatches, null, 2));

  console.log(`\n=== UNCOVERED KANJI RUNS (candidates for missing/mismatched vocab, like 気をつけて before the fix) ===`);
  console.log(`Sentences with at least one uncovered kanji run: ${uncoveredReport.length} / ${seen.size}`);

  // Aggregate by the uncovered kanji substring itself, to see which specific
  // words/kanji are the recurring offenders rather than listing every sentence.
  const byRun = new Map();
  for (const r of uncoveredReport) {
    for (const run of r.uncoveredKanjiRuns) {
      if (!byRun.has(run)) byRun.set(run, { run, exampleSentences: [], totalHits: 0 });
      const entry = byRun.get(run);
      entry.totalHits += r.totalQuestionHits;
      if (entry.exampleSentences.length < 2) entry.exampleSentences.push(r.text);
    }
  }
  const sortedRuns = [...byRun.values()].sort((a, b) => b.totalHits - a.totalHits);
  console.log(`Distinct uncovered kanji runs: ${sortedRuns.length}`);
  for (const r of sortedRuns) {
    console.log(`  "${r.run}"  (~${r.totalHits} question rows)  e.g. ${r.exampleSentences.map((s) => JSON.stringify(s)).join(", ")}`);
  }

  const outDir = "C:\\Users\\Endministrator\\AppData\\Local\\Temp\\nihongo_audit";
  fs.writeFileSync(outDir + "\\uncovered_report.json", JSON.stringify(sortedRuns, null, 2));
  fs.writeFileSync(outDir + "\\leaked_report.json", JSON.stringify(leakedShortMatches, null, 2));
}

main();
