export async function fetchThreatEvents(env) {
    const list = await env.GIA_THREATS.list({ prefix: "threat:" });

    const events = [];
    for (const item of list.keys) {
        const raw = await env.GIA_THREATS.get(item.name);
        if (!raw) continue;

        try {
            events.push(JSON.parse(raw));
        } catch {
            continue;
        }
    }

    return events;
}

export function buildThreatSummary(events = []) {
    const byRisk = {};
    const bySector = {};
    const byCategory = {};

    for (const ev of events) {
        const risk = ev.riskLevel || "none";
        const sector = ev.sector || "unknown";

        byRisk[risk] = (byRisk[risk] || 0) + 1;
        bySector[sector] = (bySector[sector] || 0) + 1;

        for (const cat of ev.categories || []) {
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        }
    }

    return {
        totalEvents: events.length,
        byRisk,
        bySector,
        byCategory,
        generatedAt: Date.now()
    };
}
