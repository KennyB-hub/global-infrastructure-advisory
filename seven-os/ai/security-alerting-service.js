// security-alerting-service.js
// V12 Alpha – Security Alerting Service

const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "document-template-registry.json");

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

/**
 * Alert thresholds
 */
const THRESHOLDS = {
  highRisk: 70,
  criticalRisk: 85,
  trustZoneOverload: 25, // max templates per trustZone before alert
  sectorRiskAverage: 60
};

/**
 * Utility: group by key
 */
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "unknown";
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

/**
 * Generate alerts based on registry state.
 */
function generateAlerts() {
  const registry = loadRegistry();
  const templates = registry.templates;

  const alerts = [];

  // 1. High-risk templates
  templates.forEach((t) => {
    if (t.riskScore >= THRESHOLDS.criticalRisk) {
      alerts.push({
        type: "CRITICAL_RISK",
        templateId: t.templateId,
        message: `Template '${t.templateId}' is CRITICAL risk (${t.riskScore}).`
      });
    } else if (t.riskScore >= THRESHOLDS.highRisk) {
      alerts.push({
        type: "HIGH_RISK",
        templateId: t.templateId,
        message: `Template '${t.templateId}' is high risk (${t.riskScore}).`
      });
    }
  });

  // 2. Blocked templates
  templates
    .filter((t) => t.status === "blocked")
    .forEach((t) => {
      alerts.push({
        type: "BLOCKED_TEMPLATE",
        templateId: t.templateId,
        message: `Template '${t.templateId}' is BLOCKED by security policy.`
      });
    });

  // 3. Escalated templates
  templates
    .filter((t) => t.status === "escalated")
    .forEach((t) => {
      alerts.push({
        type: "ESCALATED_TEMPLATE",
        templateId: t.templateId,
        message: `Template '${t.templateId}' was auto-escalated to trustZone '${t.trustZone}'.`
      });
    });

  // 4. TrustZone overload
  const tzGroups = groupBy(templates, "trustZone");
  Object.entries(tzGroups).forEach(([zone, list]) => {
    if (list.length > THRESHOLDS.trustZoneOverload) {
      alerts.push({
        type: "TRUSTZONE_OVERLOAD",
        trustZone: zone,
        message: `TrustZone '${zone}' is overloaded (${list.length} templates).`
      });
    }
  });

  // 5. Sector average risk alerts
  const sectorGroups = groupBy(templates, "sector");
  Object.entries(sectorGroups).forEach(([sector, list]) => {
    const avg =
      list.reduce((sum, t) => sum + (t.riskScore || 0), 0) / list.length;

    if (avg >= THRESHOLDS.sectorRiskAverage) {
      alerts.push({
        type: "SECTOR_RISK",
        sector,
        message: `Sector '${sector}' has elevated average risk (${avg.toFixed(
          1
        )}).`
      });
    }
  });

  return alerts;
}

/**
 * Exported API
 */
function getSecurityAlerts() {
  return generateAlerts();
}

module.exports = {
  getSecurityAlerts
};
