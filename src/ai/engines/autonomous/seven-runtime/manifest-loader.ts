import fs from "fs";
import path from "path";

export function loadGlobalManifest() {
  const file = path.join(process.cwd(), "global/global-manifest.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
