// template-registry.js
// V12 Alpha – Document Template Registry Loader

const fs = require("fs");
const path = require("path");

const REGISTRY_PATH = path.join(
  __dirname,
  "document-template-registry.json"
);

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
  return JSON.parse(raw);
}

const registry = loadRegistry();

/**
 * Get template metadata by docType + trustZone.
 */
function findTemplate(docType, trustZone) {
  return registry.templates.find(
    (t) =>
      t.docType === docType &&
      t.trustZone === trustZone &&
      t.status === "active"
  );
}

/**
 * Get template metadata by templateId.
 */
function getTemplateById(templateId) {
  return registry.templates.find((t) => t.templateId === templateId);
}

/**
 * List all templates for a trustZone.
 */
function listTemplatesByTrustZone(trustZone) {
  return registry.templates.filter(
    (t) => t.trustZone === trustZone && t.status === "active"
  );
}

module.exports = {
  registry,
  findTemplate,
  getTemplateById,
  listTemplatesByTrustZone
};
