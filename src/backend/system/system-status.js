import { getUptime } from "./uptime.js";

export function systemStatusReport(manifest) {
    const uptime = getUptime();

    return {
        name: manifest?.engine || "GIA Deep Mind 2100",
        version: manifest?.version || "unknown",
        environment: manifest?.environment || "production",
        uptime: uptime.uptimeMs,
        coldStart: uptime.coldStart,
        timestamp: uptime.timestamp,
        status: "ok"
    };
}
