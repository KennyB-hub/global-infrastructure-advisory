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
