// workers/system/cyber/threat-score.engine.js

export function scoreThreat(data, context) {
  const indicators = [];

  if (data.ip && data.ip.startsWith("10.")) {
    indicators.push("internal_ip_access");
  }

  if (data.action === "unauthorized_access") {
    indicators.push("unauthorized_access_attempt");
  }

  const score = indicators.length * 20;

  return {
    score,
    level: score >= 60 ? "high" : score >= 30 ? "medium" : "low",
    indicators
  };
}
