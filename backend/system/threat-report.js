import { fetchThreatEvents, buildThreatSummary } from "../threat/threat-reporting.js";

export async function systemThreatReport(env) {
    const events = await fetchThreatEvents(env);
    const summary = buildThreatSummary(events);

    return {
        name: "GIA Threat Overview",
        status: "online",
        summary
    };
}
