// template-versioning.js
// V12 Alpha – Template Versioning System

const { registry } = require("./template-registry");

/**
 * Get all templates for a given docType + trustZone.
 */
function getTemplatesFor(docType, trustZone) {
  return registry.templates.filter(
    (t) => t.docType === docType && t.trustZone === trustZone
  );
}

/**
 * Get the active template (latest) for docType + trustZone.
 */
function getActiveTemplate(docType, trustZone) {
  const candidates = getTemplatesFor(docType, trustZone).filter(
    (t) => t.status === "active"
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // If multiple active, pick the highest semantic version
  return candidates.sort((a, b) =>
    compareSemver(b.version, a.version)
  )[0];
}

/**
 * Compare two semver strings (e.g. "1.0.0" vs "2.1.0").
 */
function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

/**
 * Resolve a template by templateId, following previousTemplateId chain if needed.
 */
function resolveTemplateLineage(templateId) {
  const chain = [];
  let current = registry.templates.find((t) => t.templateId === templateId);

  while (current) {
    chain.push(current);
    if (!current.previousTemplateId) break;
    current = registry.templates.find(
      (t) => t.templateId === current.previousTemplateId
    );
  }

  return chain;
}

module.exports = {
  getTemplatesFor,
  getActiveTemplate,
  resolveTemplateLineage
};
