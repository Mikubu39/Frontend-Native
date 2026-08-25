#!/usr/bin/env node
// Combined hook (per AGENTS.md "Codebase Exploration" rule):
//   PreToolUse  (matcher: Read|Grep)                       -> gate
//   PostToolUse (matcher: mcp__codebase-memory-mcp__.*)    -> unlock
//
// Hard-blocks the first Read/Grep on a source-code file in a session until at
// least one codebase-memory-mcp graph tool has run successfully in that same
// session. Once unlocked, Read/Grep is unrestricted for the rest of the
// session. Auto-disables after MAX_BLOCKS denials so a genuine graph-coverage
// gap or an MCP outage can never trap the session with no way to read files.
//
// Deliberately narrow: only gates paths that look like source code the graph
// actually indexes (CODE_EXT). Non-code reads (json/sql/md/images/logs/etc.)
// and path-less/glob-less Grep calls always pass through — the graph can't
// help with those anyway, and false blocks are worse than a missed nudge.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MAX_BLOCKS = 2;
const GRAPH_TOOL = /^mcp__codebase-memory-mcp__/;
const CODE_EXT = /\.(ts|tsx|js|jsx|java|kt|py|go|rb|php|c|cpp|h|hpp|cs|swift|dart)\b/i;

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  /* no stdin, treat as empty */
}
const session = String(payload.session_id || "nosession").replace(/[^\w-]/g, "");
const flagFile = join(tmpdir(), `claude-graph-used-${session}.flag`);
const attemptFile = join(tmpdir(), `claude-graph-gate-${session}.count`);
const toolName = String(payload.tool_name || "");

const allow = () => process.exit(0);

// PostToolUse branch: a graph tool just ran — unlock Read/Grep for this session.
if (GRAPH_TOOL.test(toolName)) {
  try {
    writeFileSync(flagFile, "1");
  } catch {
    /* best effort */
  }
  allow();
}

// PreToolUse branch: Read or Grep.
if (existsSync(flagFile)) allow();

const input = payload.tool_input || {};
const target = String(input.file_path || input.path || input.glob || "");
if (!CODE_EXT.test(target)) allow(); // not a source-code target — nothing the graph would add

let attempt = 0;
try {
  attempt = parseInt(readFileSync(attemptFile, "utf8"), 10) || 0;
} catch {
  /* first attempt this session */
}
attempt += 1;
try {
  writeFileSync(attemptFile, String(attempt));
} catch {
  /* best effort */
}

if (attempt > MAX_BLOCKS) {
  process.stdout.write(
    JSON.stringify({
      systemMessage: `graph-gate: auto-disabled after ${MAX_BLOCKS} denials this session — proceeding without the graph.`,
    }),
  );
  allow();
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        "AGENTS.md: use a codebase-memory-mcp graph tool (search_graph, trace_path, " +
        "get_code_snippet, query_graph, get_architecture, search_code, check_index_coverage) " +
        `before reading/grepping source files. Call one graph tool first, then retry this ${toolName} ` +
        `call — it goes through immediately after. (attempt ${attempt}/${MAX_BLOCKS}; auto-disables after that)`,
    },
  }),
);
process.exit(0);
