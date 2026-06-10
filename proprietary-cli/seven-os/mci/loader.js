// seven-os/ai/mci/loader.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cache = null;

export function loadMci() {
  if (cache) return cache;

  const filePath = path.join(__dirname, "mci.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  if (!parsed.sectors || typeof parsed.sectors !== "object") {
    throw new Error("MCI: invalid structure (missing sectors)");
  }

  cache = parsed;
  return cache;
}
