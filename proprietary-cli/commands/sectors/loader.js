// seven-os/manifest/loader.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cache = null;

export function loadGlobalManifest() {
  if (cache) return cache;

  const filePath = path.join(__dirname, "seven-os/sectors/global-manifest.json");
  const raw = fs.readFileSync(filePath, "utf8");
  cache = JSON.parse(raw);

  return cache;
}
