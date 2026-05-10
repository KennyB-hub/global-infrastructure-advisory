// template-registry-auto.js
// V12 Alpha – Auto Template Registry Insertion

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
 * Compute next semantic version for a template family.
 */
function computeNextVersion(existingTemplates) {
  if (existingTemplates.length === 0) return "1.0.0";

  const versions = existingTemplates.map((t) => t.version);
  const latest = versions.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] > pb[i]) return -1;
      if (pa[i] < pb[i]) return 1;
    }
    return 0;
  })[0];

  const [major, minor, patch] = latest.split(".").map(Number);
  return `${major}.${minor + 1}.0`;
}

/**
 * Insert a new template into the registry automatically.
 */
function autoInsertTemplate({
  file,
  docType,
  trustZone,
  sector,
  placeholders
}) {
  const registry = loadRegistry();

  // Find existing templates for this docType + trustZone
  const family = registry.templates.filter(
    (t) => t.docType === docType && t.trustZone === trustZone
  );

  // Compute next version
  const version = computeNextVersion(family);

  // Build new templateId
  const templateId = `${docType.toUpperCase()}_${trustZone.toUpperCase()}_V${version.replace(/\./g, "_")}`;

  // Deprecate old templates
  family.forEach((t) => (t.status = "deprecated"));

  // Insert new template
  const newTemplate = {
    templateId,
    name: `${docType} (${trustZone})`,
    file,
    trustZone,
    sector,
    docType,
    placeholders,
    version,
    status: "active",
    previousTemplateId: family.length > 0 ? family[0].templateId : null,
    createdAt: new Date().toISOString()
  };

  registry.templates.push(newTemplate);

  // Save registry
  saveRegistry(registry);

  return newTemplate;
}

module.exports = {
  autoInsertTemplate
};
