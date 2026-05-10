// security-posture-dashboard.js
// V12 Alpha – Security Posture Dashboard API

const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "../ai/document-template-registry.json");

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

/**
 * Count occurrences in an array.
 */
function countBy(arr, key) {
  const map = {};
  arr.forEach((item) => {
    const value = item[key] || "unknown";
    map[value] = (map[value] || 0) + 1;
  });
  return map;
}

/**
 * Compute risk buckets.
 */
function riskBuckets(templates) {
  return {
    low: templates.filter((t) => t.riskScore <= 25).length,
    medium: templates.filter((t) => t.riskScore > 25 && t.riskScore <= 50).length,
    high: templates.filter((t) => t.riskScore > 50 && t.riskScore <= 75).length,
    critical: templates.filter((t) => t.riskScore > 75).length
  };
}

/**
 * Express API router.
 */
module.exports = function (router) {
  router.get("/security/posture", (req, res) => {
    try {
      const registry = loadRegistry();
      const templates = registry.templates;

      const securityLevels = countBy(templates, "securityLevel");
      const trustZones = countBy(templates, "trustZone");
      const sectors = countBy(templates, "sector");
      const docTypes = countBy(templates, "docType");

      const blocked = templates.filter((t) => t.status === "blocked");
      const escalated = templates.filter((t) => t.status === "escalated");
      const highRisk = templates.filter((t) => t.riskScore > 70);

      const riskDistribution = riskBuckets(templates);

      res.json({
        totals: {
          templates: templates.length,
          blocked: blocked.length,
          escalated: escalated.length,
          highRisk: highRisk.length
        },
        distributions: {
          securityLevels,
          trustZones,
          sectors,
          docTypes,
          riskDistribution
        },
        lists: {
          blocked,
          escalated,
          highRisk
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
