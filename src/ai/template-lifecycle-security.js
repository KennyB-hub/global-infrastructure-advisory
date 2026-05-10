// template-lifecycle-security.js
// V12 Alpha – Security-Aware Lifecycle Enforcement

const fs = require("fs");
const path = require("path");
const registryPath = path.join(__dirname, "document-template-registry.json");
const { classifyTemplateSecurity } = require("./template-security-classifier");
const { enforcePolicyOnTemplate } = require("./template-security-policy-enforcer");

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

/**
 * Enforce security classification on a template.
 */
async function enforceSecurity(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  // Run AI security classifier
  const security = await classifyTemplateSecurity(template);

  template.securityLevel = security.securityLevel;
  template.riskScore = security.riskScore;
  template.recommendedTrustZone = security.recommendedTrustZone;
  template.securityReasoning = security.reasoning;
  // after template.securityLevel / riskScore / recommendedTrustZone are set:
  enforcePolicyOnTemplate(template);

  // Auto-escalate trustZone if needed
  if (template.trustZone !== security.recommendedTrustZone) {
    template.trustZone = security.recommendedTrustZone;
    template.status = "escalated";
  }

  // Auto-block templates too sensitive for public use
  if (security.securityLevel === "secret" || security.securityLevel === "deepgov") {
    template.status = "restricted";
  }

  saveRegistry(registry);

  return {
    templateId,
    appliedSecurity: security.securityLevel,
    riskScore: security.riskScore,
    trustZone: template.trustZone,
    status: template.status
  };
}

module.exports = {
  enforceSecurity
};
