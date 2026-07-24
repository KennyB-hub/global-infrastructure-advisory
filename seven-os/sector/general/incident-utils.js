// incident-utils.js
// Small helpers for incident workflows

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
 * Deactivate a template without full lifecycle logic
 * (pure containment, not promotion/rollback).
 */
function deactivateTemplate(templateId) {
  const registry = loadRegistry();

  const template = registry.templates.find((t) => t.templateId === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  template.status = "blocked";

  saveRegistry(registry);
  return template;
}

module.exports = {
  deactivateTemplate
};
