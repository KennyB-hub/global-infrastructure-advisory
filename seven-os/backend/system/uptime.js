// seven-os/backend/system/uptime.js

const START = Date.now();

export function getUptime() {
  const now = Date.now();
  const ms = now - START;
  return {
    ms,
    seconds: Math.floor(ms / 1000),
    startedAt: new Date(START).toISOString()
  };
}
