// src/backend/system/system-status.js

import { getUptime } from "./uptime.js";

export function systemStatusReport(manifest = {}) {
  return {
    name: "GIA System Status",
    version: manifest.version || "unknown",
    uptime: getUptime(),
    env: manifest.env || "unknown",
    notes: manifest.notes || null
  };
}
