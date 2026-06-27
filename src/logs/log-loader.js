// © 2026 Global Infrastructure Advisory
// Seven‑OS V12 Alpha — Log Loader (src/logs)
// Used by routing audit + infra audit engines

import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("src/logs");

export async function loadLogFile(filename) {
  try {
    const filePath = path.join(LOG_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return { ok: false, error: "Log file not found", filePath };
    }

    const raw = await fs.promises.readFile(filePath, "utf8");
    const json = JSON.parse(raw);

    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function loadAllLogs() {
  try {
    const files = await fs.promises.readdir(LOG_DIR);
    const jsonFiles = files.filter(f => f.endsWith(".json"));

    const logs = {};

    for (const file of jsonFiles) {
      try {
        const raw = await fs.promises.readFile(path.join(LOG_DIR, file), "utf8");
        logs[file] = JSON.parse(raw);
      } catch (err) {
        logs[file] = { error: "Failed to parse", details: err.message };
      }
    }

    return { ok: true, logs };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
