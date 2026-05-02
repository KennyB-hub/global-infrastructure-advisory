heartbeat.js
export function heartbeat() {
    return {
        status: "alive",
        timestamp: Date.now()
    };
}
