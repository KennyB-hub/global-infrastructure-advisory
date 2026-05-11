// template-validation-engine.js
// V12 Alpha – Self-Healing Document Template Validation Engine

const fs = require("fs");
const path = require("path");
const { registry } = require("./template-registry");
const { autoRepairTemplate } = require("./template-auto-repair-engine");

/**
 * Validate that a template file exists.
 */
function validateTemplateFile(template) {
  const filePath = path.join(process.cwd(), "templates", template.file);

  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      error: `Template file missing: ${template.file}`,
      code: "FILE_MISSING"
    };
  }

  return { valid: true };
}

/**
 * Validate that all placeholders appear in the template file.
 */
function validatePlaceholders(template) {
  const filePath = path.join(process.cwd(), "templates", template.file);
  const html = fs.readFileSync(filePath, "utf8");

  const missing = template.placeholders.filter(
    (p) => !html.includes(`{{${p}}}`)
  );

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing placeholders in template '${template.templateId}': ${missing.join(", ")}`,
      code: "PLACEHOLDERS_MISSING",
      missing
    };
  }

  return { valid: true };
}

/**
 * Validate trustZone and sector fields.
 */
function validateMetadata(template) {
  const validTrustZones = [
    "public",
    "farmer",
    "contractor",
    "employee",
    "admin",
    "gov",
    "deepgov"
  ];

  if (!validTrustZones.includes(template.trustZone)) {
    return {
      valid: false,
      error: `Invalid trustZone '${template.trustZone}' in template '${template.templateId}'`,
      code: "INVALID_TRUSTZONE"
    };
  }

  if (!template.sector || typeof template.sector !== "string") {
    return {
      valid: false,
      error: `Missing or invalid sector in template '${template.templateId}'`,
      code: "INVALID_SECTOR"
    };
  }

  if (!template.docType || typeof template.docType !== "string") {
    return {
      valid: false,
      error: `Missing or invalid docType in template '${template.templateId}'`,
      code: "INVALID_DOCTYPE"
    };
  }

  return { valid: true };
}

/**
 * Self-healing validation wrapper.
 */
async function validateTemplate(template) {
  // Run all checks
  const checks = [
    validateMetadata(template),
    validateTemplateFile(template),
    validatePlaceholders(template)
  ];

  const failed = checks.find((c) => !c.valid);

  // If everything is valid → return success
  if (!failed) {
    return {
      templateId: template.templateId,
      valid: true,
      repaired: false
    };
  }

  // If file missing → cannot repair
  if (failed.code === "FILE_MISSING") {
    return {
      templateId: template.templateId,
      valid: false,
      repaired: false,
      error: failed.error
    };
  }

  // If placeholders missing → auto-repair
  if (failed.code === "PLACEHOLDERS_MISSING") {
    await autoRepairTemplate(template, template.placeholders);

    // Re-run validation after repair
    return await validateTemplate(template);
  }

  // If metadata invalid → cannot auto-repair
  return {
    templateId: template.templateId,
    valid: false,
    repaired: false,
    error: failed.error
  };
}

/**
 * Validate all templates in the registry.
 */
async function validateAllTemplates() {
  const results = [];

  for (const template of registry.templates) {
    const result = await validateTemplate(template);
    results.push(result);
  }

  return results;
}

module.exports = {
  validateTemplate,
  validateAllTemplates
};
