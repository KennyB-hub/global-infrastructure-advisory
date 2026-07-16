// seven-os/backend/system/system-endpoints.js

export function getSystemEndpoints() {
  return {
    system: [
      "/system/status",
      "/system/health",
      "/system/full-report",
      "/system/security",
      "/system/routing",
      "/system/storage",
      "/system/infrastructure",
      "/system/trust",
      "/system/uptime",
      "/system/map"
    ],
    ai: ["/api/decision", "/api/cortex", "/api/deep-mind", "/api/ai"]
  };
}
