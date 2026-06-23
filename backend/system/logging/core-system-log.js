// backend/system/logging/system-log.js
// Simple system event logger (can later be wired to KV, D1, R2, etc.)

export async function logEvent(event) {
  const payload = {
    ...event,
    timestamp: event.timestamp || Date.now()
  };

  // For now, just console.log – safe for Workers
  console.log("[GIA-SYSTEM-EVENT]", JSON.stringify(payload));

  const loadRuntime = require("../../runtime/runtime-loader.cjs");
  const topology = loadRuntime().topology;

  // Later: write to KV / D1 / external SIEM
  return { logged: true };
}
