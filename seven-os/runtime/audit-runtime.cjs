// Seven‑Runtime Audit Script
// Scans seven-runtime/ and reports files that do NOT belong there.

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "seven-runtime");

// Patterns that DO belong in runtime
const RUNTIME_KEYWORDS = [
  "context",
  "loader",
  "processor",
  "runtime",
  "worker",
  "state",
  "router",
  "engine",
  "pipeline"
];

// Patterns that DO NOT belong in runtime
const WRONG_KEYWORDS = [
  "test",
  "simulate",
  "schema",
  "util",
  "helper",
  "mock",
  "scan",
  "report",
  "ingest",
  "hazard",
  "score",
  "compliance",
  "audit",
  "tools",
  "r2",
  "api",
  "command",
  "domain",
  "infrastructure",
  "sector",
  "overlay",
  "map"
];

function walk(dir, list = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, list);
    else list.push(full);
  }
  return list;
}

function audit() {
  console.log("\n🔍 Auditing seven-runtime/ ...\n");

  const files = walk(RUNTIME);
  const relativeFiles = files.map(f => path.relative(ROOT, f).replace(/\\/g, "/"));

  const misplaced = [];

  for (const file of relativeFiles) {
    const name = path.basename(file).toLowerCase();

    // If it contains a forbidden keyword → it's misplaced
    if (WRONG_KEYWORDS.some(k => name.includes(k))) {
      misplaced.push({
        file,
        reason: "Contains non-runtime keyword",
        suggested: suggestFolder(name)
      });
      continue;
    }

    // If it does NOT contain any runtime keyword → suspicious
    if (!RUNTIME_KEYWORDS.some(k => name.includes(k))) {
      misplaced.push({
        file,
        reason: "Does not match runtime module patterns",
        suggested: "utilities/ or domain/ (manual review)"
      });
    }
  }

  if (misplaced.length === 0) {
    console.log("✅ Runtime folder is clean. No misplaced files.\n");
    return;
  }

  console.log("⚠️  Misplaced files detected:\n");
  for (const m of misplaced) {
    console.log(`• ${m.file}`);
    console.log(`    Reason: ${m.reason}`);
    console.log(`    Suggested: ${m.suggested}\n`);
  }
}

function suggestFolder(name) {
  if (name.includes("ingest")) return "domain/infrastructure/ingestion/";
  if (name.includes("hazard")) return "domain/infrastructure/hazards/";
  if (name.includes("score")) return "domain/infrastructure/scoring/";
  if (name.includes("compliance")) return "domain/infrastructure/compliance/";
  if (name.includes("audit")) return "domain/infrastructure/audit/";
  if (name.includes("report")) return "domain/infrastructure/report/";
  if (name.includes("tools")) return "domain/infrastructure/tools/";
  if (name.includes("r2")) return "domain/infrastructure/r2/";
  if (name.includes("sector")) return "domain/<sector>/logic/";
  if (name.includes("api")) return "api/";
  if (name.includes("util") || name.includes("helper")) return "utilities/";
  return "utilities/ or domain/ (manual review)";
}

audit();
