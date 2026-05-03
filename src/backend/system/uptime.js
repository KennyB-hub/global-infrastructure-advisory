uptime.js 
export function uptime(startTime) {
    return {
        uptimeMs: Date.now() - startTime,
        coldStart: startTime
    };
}
