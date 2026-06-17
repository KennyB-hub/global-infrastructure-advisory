#!/usr/bin/env node
// © 2026 Global Infrastructure Advisory — Compiled Asset Extension Fixer

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = process.cwd();
const scanTargets = ["seven-os", "runtime", "backend", "src"];

// Import your Seven‑OS report writer
import { writeReport } from "./utilities/write-report.cjs";

console.log('==================================================');
console.log('🛠️   FIXING COMPILED COMMONJS EXTENSIONS           ');
console.log('==================================================\n');

const fixes = [];

function scanAndFix(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      scanAndFix(fullPath);
    } else if (entry.name.endsWith(".js")) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");

        // Detect compiled CJS patterns that break ESM
        if (
          content.includes("Object.defineProperty(exports") ||
          content.includes('"use strict";') ||
          content.includes("exports.")
        ) {
          const targetCjsPath = fullPath.replace(/\.js$/, ".cjs");

          fs.renameSync(fullPath, targetCjsPath);

          const relative = path.relative(ROOT_DIR, targetCjsPath);
          console.log(`  ⚡ Converted compiled file to .cjs: ${relative}`);

          fixes.push({
            original: fullPath,
            converted: targetCjsPath,
            relative,
          });
        }
      } catch (err) {
        // Skip locked files safely
      }
    }
  }
}

scanTargets.forEach(target => scanAndFix(path.join(ROOT_DIR, target)));

console.log("\n📝 Writing conversion report...");

await writeReport("compiled-extension-fixer", {
  root: ROOT_DIR,
  totalFixes: fixes.length,
  fixes,
});

console.log("✅ Extension conversion sweep completed successfully.\n");
