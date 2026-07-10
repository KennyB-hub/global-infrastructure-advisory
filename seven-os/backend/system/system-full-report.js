import { systemStatus } from "./system-endpoints.js";
import { systemDiagnostics } from "./system-endpoints.js";
import { systemDomains } from "./system-endpoints.js";
import { systemTrust } from "./system-endpoints.js";
import { getUptime } from "./uptime.js";

export function systemFullReport(manifest, AI) {
    return {
        timestamp: new Date().toISOString(),
        status: "ok",
        engine: systemStatus(manifest),
        diagnostics: systemDiagnostics(AI),
        domains: systemDomains(),
        trust: systemTrust(),
        uptime: getUptime()
    };
}
