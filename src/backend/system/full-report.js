full-report.js
export function fullReport(manifest, AI, startTime) {
    return {
        status: "online",
        manifest,
        aiEngine: typeof AI.run === "function",
        uptime: Date.now() - startTime,
        timestamp: Date.now()
    };
}
