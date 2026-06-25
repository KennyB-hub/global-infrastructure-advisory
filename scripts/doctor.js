#!/usr/bin/env node

/**
 * Seven‑OS Doctor — TS + OS Logic Integrity Edition
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_FILE = path.join(REPORT_DIR, "doctor-report.json");

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);

let report = {
  generated: new Date().toISOString(),
  checks: []
};

function addCheck(name, status, error = null) {
  report.checks.push({ name, status, error });
}

function check(name, fn) {
  try {
    fn();
    addCheck(name, "PASS");
  } catch (err) {
    addCheck(name, "FAIL", err.message);
  }
}

function requireDir(dir) {
  if (!fs.existsSync(path.join(ROOT, dir))) {
    throw new Error(`Missing directory: ${dir}`);
  }
}

function requireFile(file) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    throw new Error(`Missing file: ${file}`);
  }
}

// --------------------------------------
// 1. Directory Structure
// --------------------------------------
check("Directory Structure", () => {
  [
    "src",
    "ai",
    "engines",
    "autonomous-os",
    "public",
    "scripts",
    "runtime",
    "runtime/dashboards",
    "runtime/dashboards/universal"
  ].forEach(requireDir);
});

// --------------------------------------
// 2. Config Files
// --------------------------------------
check("Config Files", () => {
  ["package.json", "tsconfig.json", "ecosystem.config.js", "wrangler.toml"]
    .forEach(requireFile);
});

// --------------------------------------
// 3. TypeScript Syntax
// --------------------------------------
check("TypeScript Syntax", () => {
  execSync("npx tsc --noEmit", { stdio: "pipe" });
});

// --------------------------------------
// 4. Dependency Health
// --------------------------------------
check("Dependency Health", () => {
  execSync("npm ls --depth=0", { stdio: "pipe" });
});

// --------------------------------------
// 5. Circular Dependencies
// --------------------------------------
check("Circular Dependencies", () => {
  execSync("npx madge src --circular", { stdio: "pipe" });
});

// --------------------------------------
// 6. OS Logic Integrity
// --------------------------------------
check("OS Logic Integrity", () => {
  const required = [
    "runtime/runtime-manifest.json",
    "global/global-manifest.json",
    "runtime/dashboards/universal/renderer.ts",
    "runtime/dashboards/universal/types.ts"
  ];

  required.forEach(requireFile);

  const runtime = JSON.parse(
    fs.readFileSync(path.join(ROOT, "runtime/runtime-manifest.json"), "utf8")
  );

  if (!runtime.engines?.["engine-index"]?.engines) {
    throw new Error("Runtime manifest missing engine-index.engines");
  }

  if (!runtime.workers?.index?.workers) {
    throw new Error("Runtime manifest missing workers.index.workers");
  }

  if (!runtime.sectors) {
    throw new Error("Runtime manifest missing sectors");
  }

  if (!runtime.topology?.nodes) {
    throw new Error("Runtime manifest missing topology.nodes");
  }
});

// --------------------------------------
// 7. Dashboard Engine Integrity
// --------------------------------------
check("Dashboard Engine Integrity", () => {
  const layoutDir = path.join(ROOT, "runtime/dashboards/universal/layouts");
  const widgetDir = path.join(ROOT, "runtime/dashboards/universal/widgets");
  const themeDir = path.join(ROOT, "runtime/dashboards/universal/themes");

  if (!fs.existsSync(layoutDir)) throw new Error("Missing layouts directory");
  if (!fs.existsSync(widgetDir)) throw new Error("Missing widgets directory");
  if (!fs.existsSync(themeDir)) throw new Error("Missing themes directory");

  const layouts = fs.readdirSync(layoutDir).filter(f => f.endsWith(".ts"));
  if (layouts.length === 0) throw new Error("No TS layouts found");

  const widgets = fs.readdirSync(widgetDir).filter(f => f.endsWith(".ts"));
  if (widgets.length === 0) throw new Error("No TS widgets found");

  const themes = fs.readdirSync(themeDir).filter(f => f.endsWith(".ts"));
  if (themes.length === 0) throw new Error("No TS themes found");
});

// --------------------------------------
// 8. Sector Mapping
// --------------------------------------
check("Sector Mapping", () => {
  const file = path.join(ROOT, "sector-worker-mapping.csv");
  if (!fs.existsSync(file)) throw new Error("Missing sector-worker-mapping.csv");

  const csv = fs.readFileSync(file, "utf8");
  if (!csv.includes(",")) throw new Error("Invalid CSV structure");
});

// --------------------------------------
// 9. JSON Validation
// --------------------------------------
check("JSON Validation", () => {
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".json"));
  files.forEach(f => {
    JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
  });
});

// --------------------------------------
// 10. Governor Integrity
// --------------------------------------
check("Governor Integrity", () => {
  const govPath = path.join(ROOT, "autonomous-os/governor.js");
  if (!fs.existsSync(govPath)) {
    throw new Error("Missing governor.js (OS brain entrypoint)");
  }

  const governorCode = fs.readFileSync(govPath, "utf8");

  // Required imports
  const requiredImports = [
    "runDecisionEngine",
    "tools",
    "policies",
    "workflows",
    "filterAIOutput",
    "beforeExecution",
    "afterExecution",
    "validateAIOutput",
    "AutomationTasks",
    "FailsafeProtocols",
    "handleCyberApi",
    "handleGovViewApi",
    "handleOpportunityApi",
    "handleMarketplaceApi",
    "handleSectorMatchApi"
  ];

  requiredImports.forEach(symbol => {
    if (!governorCode.includes(symbol)) {
      console.log("Loading:", filePath);
      throw new Error(`Governor missing required import: ${symbol}`);
    }
  });

  // Required functions
  const requiredFunctions = [
    "scheduled",
    "fetch",
    "runAI"
  ];

  requiredFunctions.forEach(fn => {
    if (!governorCode.includes(`async ${fn}`) &&
        !governorCode.includes(`${fn}(`)) {
      throw new Error(`Governor missing required function: ${fn}`);
    }
  });

  // Required API routes
  const requiredRoutes = [
    "/api/cyber",
    "/api/gov/view",
    "/api/opportunities",
    "/api/marketplace",
    "/api/sector/match",
    "/api/deep-mind"
  ];

  requiredRoutes.forEach(route => {
    if (!governorCode.includes(route)) {
      throw new Error(`Governor missing API route: ${route}`);
    }
  });

  // Required OS modules
  const requiredModules = [
    "ai-engine/decision-engine.js",
    "ai-engine/tools/index.js",
    "ai-engine/policies/index.js",
    "ai-engine/workflow/index.js",
    "ai-engine/filters/code-filter.js",
    "ai-engine/hooks/before-execution.js",
    "ai-engine/hooks/after-execution.js",
    "ai-engine/validation/schema-guard.js",
    "system/automation-tasks.js",
    "system/failsafe-protocols.js",
    "system/api/cyber.js",
    "system/api/gov-view.js",
    "system/api/opportunity.js",
    "system/api/marketplace.js",
    "system/api/sector-match.js"
  ];

  requiredModules.forEach(mod => {
    const modPath = path.join(ROOT, "autonomous-os", mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`Missing required Governor module: ${mod}`);
    }
  });
});

// --------------------------------------
// Write JSON Report
// --------------------------------------
fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

console.log("\n🔥 Seven‑OS Doctor (TS + Logic Integrity) report generated:");
console.log(REPORT_FILE);
console.log("\nSummary:");
report.checks.forEach(c => {
  console.log(`${c.status === "PASS" ? "✔" : "❌"} ${c.name}`);
});
