import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load manifest safely (sandbox‑compatible)
const manifestPath = path.join(__dirname, "../../manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

export async function run() {
  console.log("Booting Seven‑OS Runtime…");

  return {
    status: "booted",
    version: manifest.version,
    runtime: manifest.runtime_id || "unknown",
    sectors: Object.keys(manifest.sectors || {}),
    engines: manifest.engines?.["engine-index"]?.engines?.length || 0,
    workers: manifest.workers?.index?.workers?.length || 0
  };
}
