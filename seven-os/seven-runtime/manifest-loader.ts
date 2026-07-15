import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function loadGlobalManifest() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const file = path.join(__dirname, "global-manifest.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
