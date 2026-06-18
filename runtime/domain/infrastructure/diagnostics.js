export async function monitorWorkerPerformance(workerId, responseTime, env) {
    const threshold = 1500; // 1.5 seconds

    if (responseTime > threshold) {
        console.warn(`[GOVERNOR] Worker ${workerId} is lagging. Initiating Logic Reset...`);
        
        // 1. Log the performance dip
        await logSystemEvent(`PERF_DIP: ${workerId} clocked at ${responseTime}ms`, env);
        
        // 2. Clear the Worker's cache/state to "wake it up"
        await env.STATE_KV.delete(`state_${workerId}`);
        
        // 3. Optional: Trigger a fresh SSH restart of the node if it persists
        return "RESTART_PENDING";
    }
    return "NOMINAL";
}
 
/**
 * diagnostics.js
 * ----------------
 * High-level infrastructure diagnostics for the GIA platform.
 * Uses infrastructure tools + utils for unified reporting.
 */

import { storageInspector } from "./tools/storage-inspector.js";
import { infraLog } from "./utils/infra-logger.js";
import { normalizePath } from "./utils/normalize-path.js";
import routingInspector from "./routing-inspector.js";
import sshManager from "./ssh-manager.js";

export default async function diagnostics(cf) {
    const report = {
        timestamp: new Date().toISOString(),
        storage: null,
        routing: null,
        ssh: null,
        logs: []
    };

    // 1. Storage
    try {
        report.storage = await storageInspector(cf);
        report.logs.push(infraLog("storage-inspection-complete"));
    } catch (err) {
        report.logs.push(infraLog("storage-inspection-error", { error: err.message }));
    }

    // 2. Routing
    try {
        report.routing = await routingInspector(cf);
        report.logs.push(infraLog("routing-inspection-complete"));
    } catch (err) {
        report.logs.push(infraLog("routing-inspection-error", { error: err.message }));
    }

    // 3. SSH (if enabled)
    try {
        report.ssh = await sshManager.status();
        report.logs.push(infraLog("ssh-status-complete"));
    } catch (err) {
        report.logs.push(infraLog("ssh-status-error", { error: err.message }));
    }

    // 4. Normalize paths in report (safety)
    report.logs.push(infraLog("normalize-paths"));
    report.path = normalizePath("/infrastructure/diagnostics");

    return report;
}
