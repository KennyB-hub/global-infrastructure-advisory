// Stores each threat event as a KV entry.
// Key format: threat:<timestamp>:<random>
export async function recordThreatEvent(env, threatResult) {
    const key = `threat:${threatResult.timestamp}:${crypto.randomUUID()}`;

    const value = JSON.stringify({
        riskLevel: threatResult.riskLevel,
        categories: threatResult.categories,
        sector: threatResult.sector,
        timestamp: threatResult.timestamp
    });

    await env.GIA_THREATS.put(key, value);

    return { stored: true, key };
}
