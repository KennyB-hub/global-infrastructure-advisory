// template-security-policy-enforcer.js
// V12 Alpha – Template Security Policy Enforcer

const fs = require("fs");
const path = require("path");
const registryPath = path.join(__dirname, "document-template-registry.json");

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

/**
 * Hard security policy:
 * - Map securityLevel → minimum allowed trustZone
 * - Enforce max riskScore thresholds per trustZone
 */
const SECURITY_POLICY = {
  levels: {
    public: "public",
    internal: "farmer",
    restricted: "contractor",
    confidential: "employee",
    secret: "gov",
    deepgov: "deepgov"
  },
  maxRiskByTrustZone: {
    public: 20,
    farmer: 40,
    contractor: 60,
    employee: 70,
    admin: 80,
    gov: 90,
    deepgov: 100
  }
};

/**
 * Compare trustZone hierarchy.
 */
const TRUSTZONE_ORDER = [
  "public",
  "farmer",
  "contractor",
  "employee",
  "admin",
  "gov",
  "deepgov"
];

function trustZoneRank(zone) {
  const idx = TRUSTZONE_ORDER.indexOf(zone);
  return idx === -1 ? -1 : idx;
}

/**
 * Enforce policy on a single template object (in-memory).
 * Throws if policy is violated and cannot be auto-corrected.
 */
function enforcePolicyOnTemplate(template) {
  const {
    securityLevel,
    riskScore,
    trustZone
  } = template;

  if (!securityLevel || typeof riskScore !== "number") {
    throw new Error(
      `Template '${template.templateId}' missing security classification (securityLevel/riskScore)`
    );
  }

  const minZone = SECURITY_POLICY.levels[securityLevel];
  if (!minZone) {
    throw new Error(
      `Template '${template.templateId}' has unknown securityLevel '${securityLevel}'`
    );
  }

  const currentRank = trustZoneRank(trustZone);
  const minRank = trustZoneRank(minZone);

  if (currentRank === -1) {
    throw new Error(
      `Template '${template.templateId}' has invalid trustZone '${trustZone}'`
    );
  }

  // Enforce minimum trustZone for securityLevel
  if (currentRank < minRank) {
    // Auto-escalate trustZone upward
    template.trustZone = minZone;
    template.status = "escalated";
  }

  const maxRisk = SECURITY_POLICY.maxRiskByTrustZone[template.trustZone];
  if (typeof maxRisk !== "number") {
    throw new Error(
      `No maxRisk policy defined for trustZone '${template.trustZone}'`
    );
  }

  // If riskScore exceeds allowed threshold → block template
  if (riskScore > maxRisk) {
    template.status = "blocked";
    throw new Error(
      `Template '${template.templateId}' blocked: riskScore ${riskScore} exceeds max ${maxRisk} for trustZone '${template.trustZone}'`
    );
  }

  return template;
}

/**
 * Enforce policy on a template in the registry by templateId.
 */
function enforcePolicy(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const updated = enforcePolicyOnTemplate(template);

  saveRegistry(registry);
  return updated;
}

/**
 * Enforce policy on all templates in the registry.
 */
function enforcePolicyOnAllTemplates() {
  const registry = loadRegistry();
  const results = [];

  for (const template of registry.templates) {
    try {
      const updated = enforcePolicyOnTemplate(template);
      results.push({
        templateId: template.templateId,
        status: updated.status || "ok",
        trustZone: updated.trustZone,
        securityLevel: updated.securityLevel,
        riskScore: updated.riskScore,
        error: null
      });
    } catch (err) {
      results.push({
        templateId: template.templateId,
        status: template.status || "blocked",
        trustZone: template.trustZone,
        securityLevel: template.securityLevel,
        riskScore: template.riskScore,
        error: err.message
      });
    }
  }

  saveRegistry(registry);
  return results;
}

module.exports = {
  enforcePolicy,
  enforcePolicyOnAllTemplates,
  enforcePolicyOnTemplate
};
