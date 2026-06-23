/**
 * GIA SOVEREIGN AUTOMATION
 * Manages heartbeats, failsafes, and dual-KV synchronization.
 */
import { FailsafeProtocols } from './failsafe-protocols.js';

export const AutomationTasks = {
    /**
     * Main loop triggered every 5 minutes via Cron
     */
    async runDailyOps(env) {
        console.log("[SYSTEM] Starting Autonomous Diagnostic Cycle...");

        const results = await Promise.allSettled([
            this.checkGlobalNodeHealth(env),
            this.syncProgrammingVault(env),
            this.monitorWorkerEfficiency(env)
        ]);

        return results;
    },

    /**
     * Heartbeat: Pings NATO/Gov and Sector Nodes
     */
    async checkGlobalNodeHealth(env) {
        // This pulls from your GLOBAL_CACHE (KV 1)
        const nodes = await env.GLOBAL_CACHE.get("NODE_REGISTRY", { type: "json" }) || [];
        
        for (const node of nodes) {
            try {
                const response = await fetch(node.endpoint, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
                if (!response.ok) throw new Error("Latency Breach");
            } catch (err) {
                console.error(`[FAILSAFE] Node ${node.name} compromised. Triggering Protocol...`);
                await FailsafeProtocols.execute(node.sector, 'NODE_OFFLINE', env);
            }
        }
    },

    /**
     * Programming Sync: Moves logic from GitHub Vault to Global Cache
     */
    async syncProgrammingVault(env) {
        console.log("[SYSTEM] Checking PROGRAMMING_VAULT for GitHub updates...");
        
        // Pull the "New" programming you added from GitHub
        const newLogic = await env.PROGRAMMING_VAULT.get("LATEST_BUILD");
        
        if (newLogic) {
            // Push to the Active GLOBAL_CACHE (KV 1) so the platform uses it
            await env.GLOBAL_CACHE.put("ACTIVE_LOGIC", newLogic);
            console.log("[SYSTEM] Active Logic updated from Programming Vault.");
        }
    },

    /**
     * Oversight: Identifies "Lazy" AI Workers
     */
    async monitorWorkerEfficiency(env) {
        const stats = await env.GLOBAL_CACHE.get("WORKER_STATS", { type: "json" });
        if (stats && stats.latency > 1500) {
            console.warn("[GOVERNOR] AI Worker fatigue detected. Resetting logic-gates...");
            // Logic to clear temp state and force a fresh "Logic Reset"
            await env.GLOBAL_CACHE.delete("TEMP_COMPUTE_STATE");
        }
    }
};
