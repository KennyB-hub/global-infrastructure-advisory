#!/usr/bin/env node
// © 2026 Global Infrastructure Advisory — Compiled Asset Extension Fixer

import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();
const scanTargets = ["seven-os", "runtime", "backend", "src"];

console.log('==================================================');
console.log('🛠️   FIXING COMPILED COMMONJS EXTENSIONS           ');
console.log('==================================================\n');

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
        
        // Identify compiled TypeScript/CommonJS patterns that crash ESM
        if (content.includes("Object.defineProperty(exports") || content.includes("use strict\";")) {
          const targetCjsPath = fullPath.substring(0, fullPath.length - 3) + ".cjs";
          
          fs.renameSync(fullPath, targetCjsPath);
          console.log(`  ⚡ Converted compiled file to .cjs: ${path.relative(ROOT_DIR, targetCjsPath)}`);
        }
      } catch (err) {
        // Safe skip if file is currently locked by another terminal process
      }
    }
  }
}

scanTargets.forEach(target => scanAndFix(path.join(ROOT_DIR, target)));
console.log("\n✅ Extension conversion sweep completed successfully.");
