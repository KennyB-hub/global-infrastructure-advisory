// workers/system/cyber/threat-score.engine.js

// workers/system/cyber/threat-score.engine.js

const INDICATOR_WEIGHTS = {
  // Identity / Auth
  invalid_token: 40,
  missing_auth: 30,
  privilege_escalation_attempt: 50,

  // Network
  internal_ip_access: 10,
  external_ip_suspicious: 30,
  geo_mismatch: 25,

  // Behavior
  unauthorized_access_attempt: 40,
  brute_force_pattern: 50,
  high_request_volume: 30,
  unusual_method: 20,

  // Data
  sensitive_resource_access: 40,
  exfil_pattern: 60,

  // System
  tamper_detection: 50,
  config_change_unapproved: 40
};

function collectIndicators(data, context) {
  const indicators = [];

  if (!context?.authValid) indicators.push("missing_auth");
  if (context?.authValid === false) indicators.push("invalid_token");

  if (data.action === "unauthorized_access") indicators.push("unauthorized_access_attempt");
  if (data.action === "privilege_escalation") indicators.push("privilege_escalation_attempt");

  if (data.requests && data.requests > 1000) indicators.push("high_request_volume");
  if (data.method && !["GET", "POST"].includes(data.method)) indicators.push("unusual_method");

  if (data.resource && data.resource.includes("/admin")) indicators.push("sensitive_resource_access");

  if (data.tamperDetected) indicators.push("tamper_detection");
  if (data.configChange && !data.approvedChange) indicators.push("config_change_unapproved");

  if (data.ip && data.ip.startsWith("10.")) indicators.push("internal_ip_access");

  return indicators;
}

function computeScore(indicators) {
  return indicators.reduce((sum, key) => sum + (INDICATOR_WEIGHTS[key] || 10), 0);
}

function mapLevel(score) {
  if (score >= 120) return "critical";
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  if (score > 0) return "low";
  return "none";
}

export function scoreThreat(data, context) {
  const indicators = collectIndicators(data, context);
  const score = computeScore(indicators);
  const level = mapLevel(score);

  return {
    score,
    level,
    indicators
  };
}
