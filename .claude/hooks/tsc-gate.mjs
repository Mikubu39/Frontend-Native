#!/usr/bin/env node
// Stop hook: refuse to end the turn while `npx tsc --noEmit` reports errors.
//
// Enforces the AGENTS.md / behavior-guard rule mechanically instead of by prose.
// Only gates turns that actually touched TypeScript, and gives up after
// MAX_BLOCKS consecutive blocks so a genuinely stuck error can't trap the loop.

import { execFileSync, execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MAX_BLOCKS = 3;
const MAX_LINES = 40;

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  /* no stdin, treat as empty */
}
const session = String(payload.session_id || "nosession").replace(/[^\w-]/g, "");

let root;
try {
  root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
} catch {
  process.exit(0); // not a git repo, nothing to gate
}

// Only gate turns that actually touched TypeScript.
let dirty = "";
try {
  dirty = execFileSync("git", ["status", "--porcelain", "--", "*.ts", "*.tsx"], {
    cwd: root,
    encoding: "utf8",
  });
} catch {
  process.exit(0);
}
if (!dirty.trim()) process.exit(0);

let failure = "";
try {
  execSync("npx tsc --noEmit", {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  failure = `${e.stdout || ""}${e.stderr || ""}`.trim() || "tsc exited non-zero";
}

const counterFile = join(tmpdir(), `claude-tsc-gate-${session}.count`);
const clearCounter = () => {
  try {
    rmSync(counterFile, { force: true });
  } catch {
    /* best effort */
  }
};

if (!failure) {
  clearCounter();
  process.exit(0);
}

let attempt = 0;
try {
  attempt = parseInt(readFileSync(counterFile, "utf8"), 10) || 0;
} catch {
  /* first failure this session */
}
attempt += 1;
try {
  writeFileSync(counterFile, String(attempt));
} catch {
  /* best effort */
}

const emit = (obj) => process.stdout.write(JSON.stringify(obj));

if (attempt > MAX_BLOCKS) {
  clearCounter();
  emit({
    systemMessage: `tsc --noEmit still failing after ${MAX_BLOCKS} attempts — letting the turn end so you can take over.`,
  });
  process.exit(0);
}

const lines = failure.split(/\r?\n/).filter(Boolean);
const shown = lines.slice(0, MAX_LINES).join("\n");
const more =
  lines.length > MAX_LINES ? `\n… +${lines.length - MAX_LINES} more line(s)` : "";

emit({
  decision: "block",
  reason:
    `\`npx tsc --noEmit\` failed (attempt ${attempt}/${MAX_BLOCKS}). ` +
    `AGENTS.md forbids ending the turn with type errors — fix these, then finish:\n\n` +
    shown +
    more,
});
