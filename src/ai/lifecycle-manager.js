// template-lifecycle-manager.js
// V12 Alpha – Template Lifecycle Manager (Security-Aware)

const fs = require("fs");
const path = require("path");
const registryPath = path.join(__dirname, "document-template-registry.json");
const { enforceSecurity } = require("./template-lifecycle-security");

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

/**
 * Activate a template (and deactivate others in the same family).
 */
async function activateTemplate(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  // Deactivate all templates in the same docType + trustZone family
  registry.templates.forEach((t) => {
    if (t.docType === template.docType && t.trustZone === template.trustZone) {
      t.status = t.templateId === templateId ? "active" : "deprecated";
    }
  });

  // Apply security enforcement AFTER activation
  await enforceSecurity(templateId);

  saveRegistry(registry);
  return template;
}

/**
 * Deprecate a template.
 */
function deprecateTemplate(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  template.status = "deprecated";

  saveRegistry(registry);
  return template;
}

/**
 * Archive a template (cannot be used again).
 */
function archiveTemplate(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  template.status = "archived";

  saveRegistry(registry);
  return template;
}

/**
 * Roll back to a previous version.
 */
async function rollbackTemplate(templateId) {
  const registry = loadRegistry();

  const target = registry.templates.find((t) => t.templateId === templateId);
  if (!target) throw new Error(`Template not found: ${templateId}`);

  if (!target.previousTemplateId) {
    throw new Error(`Template ${templateId} has no previous version`);
  }

  const previous = registry.templates.find(
    (t) => t.templateId === target.previousTemplateId
  );

  if (!previous) {
    throw new Error(`Previous template not found: ${target.previousTemplateId}`);
  }

  // Activate previous version (security enforced inside)
  return await activateTemplate(previous.templateId);
}

/**
 * Promote a template to a new version (manual version bump).
 */
async function promoteTemplate(templateId, newFile, newPlaceholders) {
  const registry = loadRegistry();

  const oldTemplate = registry.templates.find((t) => t.templateId === templateId);
  if (!oldTemplate) throw new Error(`Template not found: ${templateId}`);

  // Compute next version
  const [major, minor, patch] = oldTemplate.version.split(".").map(Number);
  const newVersion = `${major}.${minor + 1}.0`;

  const newTemplateId = `${oldTemplate.docType.toUpperCase()}_${oldTemplate.trustZone.toUpperCase()}_V${newVersion.replace(/\./g, "_")}`;

  const newTemplate = {
    templateId: newTemplateId,
    name: oldTemplate.name,
    file: newFile,
    trustZone: oldTemplate.trustZone,
    sector: oldTemplate.sector,
    docType: oldTemplate.docType,
    placeholders: newPlaceholders,
    version: newVersion,
    status: "active",
    previousTemplateId: oldTemplate.templateId,
    createdAt: new Date().toISOString()
  };

  // Deprecate old version
  oldTemplate.status = "deprecated";

  // Insert new version
  registry.templates.push(newTemplate);

  // Apply security enforcement to the new version
  await enforceSecurity(newTemplateId);

  saveRegistry(registry);
  return newTemplate;
}

module.exports = {
  activateTemplate,
  deprecateTemplate,
  archiveTemplate,
  rollbackTemplate,
  promoteTemplate
};
