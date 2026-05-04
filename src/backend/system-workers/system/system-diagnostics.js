export function diagnostics(AI) {
    return {
        aiEngine: typeof AI.run === "function",
        timestamp: Date.now()
    };
}
