// src/backend/threat/threat-summary.js
// GIA Sovereign Threat Summary Engine – V12 Alpha

export function buildThreatSummary(events = []) {
  const byRisk = {};
  const bySector = {};
  const byCategory = {};
  const severityScore = { low: 1, medium: 3, high: 5, critical: 8 };

  let totalSeverity = 0;

  for (const ev of events) {
    const risk = ev.riskLevel || "none";
    const sector = ev.sector || "unknown";

    // Count by risk
    byRisk[risk] = (byRisk[risk] || 0) + 1;

    // Count by sector
    bySector[sector] = (bySector[sector] || 0) + 1;

    // Count categories
    for (const cat of ev.categories || []) {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Severity weighting
    totalSeverity += severityScore[risk] || 0;
  }

  return {
    totalEvents: events.length,
    byRisk,
    bySector,
    byCategory,

    // Sovereign-grade metrics
    severityIndex: totalSeverity,
    averageSeverity: events.length ? totalSeverity / events.length : 0,

    // Trend detection (simple V12 baseline)
    trend: events.length >= 2
      ? (events[0].timestamp - events[events.length - 1].timestamp) / events.length
      : 0,

    generatedAt: Date.now()
  };
}
