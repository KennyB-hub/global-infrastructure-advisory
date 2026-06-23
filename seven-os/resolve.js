// resolve.js — Seven‑OS Absolute Path Resolver (CommonJS Edition)
// © 2026 Global Infrastructure Advisory

const path = require("path");
const fs = require("fs");

const ROOT_DIR = process.cwd();

// Safely load filemap.json using a standard synchronous filesystem read
let filemap = {};
const filemapPath = path.join(__dirname, "filemap.json");

try {
  if (fs.existsSync(filemapPath)) {
    filemap = JSON.parse(fs.readFileSync(filemapPath, "utf8"));
  } else {
    // Structural emergency fallback array map if Copilot misplaced the json asset
    console.log("⚠ [Resolver Note] filemap.json missing. Loading emergency operational layout.");
    filemap = {
      "ai": "runtime",
      "geo": "seven-os/geo",
      "infrastructure": "seven-os/infrastructure",
      "workers": "seven-os/infrastructure/workers",
      "api": "seven-os/api",
      "system": "seven-os/system"
    };
  }
} catch (err) {
  console.error("❌ Critical error reading filemap.json:", err.message);
}

/**
 * Seven‑OS Absolute Pathway Resolver Matrix
 * @param {string} route - The structural string route (e.g. "ai/engine/decision.js")
 */
function seven(route) {
  const segments = route.split("/");
  const root = segments[0];
  const rest = segments.slice(1);
  
  const base = filemap[root];
  if (!base) {
    throw new Error(
      `Seven‑OS Resolver Error: Unknown root "${root}". ` +
      `Valid roots: ${Object.keys(filemap).join(", ")}`
    );
  }
  
  // Resolve absolute paths back to the operating system root
  return path.join(__dirname, "..", base, ...rest);
}

// Enforce explicit CommonJS export
module.exports = {
  seven
};
