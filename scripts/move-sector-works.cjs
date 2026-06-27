#!/usr/bin/env node

/**
 * Seven‑OS V12 Alpha — Sector Worker Relocation Script
 * Moves all workers back to their correct sector folders based on CSV mapping.
 */

import fs from "fs";
import path from "path";

const CSV_PATH = path.resolve("sector-worker-map.csv");
const PROJECT_ROOT = path.resolve("src");

function parseCSV() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const lines = raw.trim().split("\n").slice(1);

  return lines.map(line => {
    const [sector, workerPattern] = line.split(",").map(v => v.replace(/"/g, ""));
    return { sector, workerPattern };
  });
}

function findWorkerFiles() {
  const results = [];

  function scan(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const full = path.join(dir, item.name);

      if (item.isDirectory()) {
        scan(full);
      } else if (item.isFile() && item.name.includes("-worker")) {
        results.push(full);
      }
    }
  }

  scan(PROJECT_ROOT);
  return results;
}

function moveWorker(filePath, sector) {
  const fileName = path.basename(filePath);
  const targetDir = path.join(PROJECT_ROOT, "sectors", sector, "workers");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, fileName);

  fs.renameSync(filePath, targetPath);

  console.log(`✔ Moved ${fileName} → ${targetDir}`);
}

function main() {
  console.log("🔍 Loading sector worker map...");
  const map = parseCSV();

  console.log("🔍 Scanning for worker files...");
  const workerFiles = findWorkerFiles();

  console.log(`📦 Found ${workerFiles.length} worker files.`);

  for (const { sector, workerPattern } of map) {
    const patterns = workerPattern.split(";").map(p => p.trim());

    for (const file of workerFiles) {
      const fileName = path.basename(file);

      if (patterns.some(p => fileName.startsWith(p.replace("<region|default>", "")))) {
        moveWorker(file, sector);
      }
    }
  }

  console.log("✅ Worker relocation complete.");
}

main();
