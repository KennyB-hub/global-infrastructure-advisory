// © 2026 Global Infrastructure Advisory
// Seven‑OS V12 Alpha — Log Loader (src/logs)
// Used by routing audit + infra audit engines

import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("seven-os/logs");

export function loadLogFile(filename) {
  const filePath = path.join(LOG_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return { error: "Failed to parse log", details: err.message };
  }
}

export function loadAllLogs() {
  const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith(".json"));
  const logs = {};

  for (const file of files) {
    try {
      logs[file] = JSON.parse(fs.readFileSync(path.join(LOG_DIR, file), "utf8"));
    } catch (err) {
      logs[file] = { error: "Failed to parse", details: err.message };
    }
  }

  return logs;
}

