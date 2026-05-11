// template-migration-tool.js
// V12 Alpha – Template Migration Tool

const fs = require("fs");
const path = require("path");
const { autoRepairTemplate } = require("./template-auto-repair-engine");
const { promoteTemplate } = require("./template-lifecycle-manager");

/**
 * Load HTML template file.
 */
function loadHtml(file) {
  const filePath = path.join(process.cwd(), "templates", file);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Save HTML template file.
 */
function saveHtml(file, html) {
  const filePath = path.join(process.cwd(), "templates", file);
  fs.writeFileSync(filePath, html);
}

/**
 * Extract placeholders from HTML.
 */
function extractPlaceholders(html) {
  const matches = html.match(/{{(.*?)}}/g) || [];
  return matches.map((m) => m.replace(/{{|}}/g, ""));
}

/**
 * Merge placeholder sets.
 */
function mergePlaceholders(oldList, newList) {
  const merged = new Set([...oldList, ...newList]);
  return Array.from(merged);
}

/**
 * Migrate template content from old → new version.
 */
async function migrateTemplate(oldTemplate, newFileName) {
  const oldHtml = loadHtml(oldTemplate.file);

  // Extract placeholders from old version
  const oldPlaceholders = extractPlaceholders(oldHtml);

  // Create new template file (copy old content)
  const newFile = newFileName.endsWith(".html")
    ? newFileName
    : `${newFileName}.html`;

  const newFilePath = path.join(process.cwd(), "templates", newFile);
  saveHtml(newFile, oldHtml);

  // Auto-repair new template
  await autoRepairTemplate(
    { file: newFile },
    oldPlaceholders
  );

  // Promote template to new version
  const promoted = promoteTemplate(
    oldTemplate.templateId,
    newFile,
    oldPlaceholders
  );

  return {
    status: "migrated",
    from: oldTemplate.templateId,
    to: promoted.templateId,
    file: newFile,
    placeholders: oldPlaceholders
  };
}

module.exports = {
  migrateTemplate
};
