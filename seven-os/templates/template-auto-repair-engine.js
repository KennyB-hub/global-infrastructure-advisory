// template-auto-repair-engine.js
// V12 Alpha – Template Auto-Repair Engine

const fs = require("fs");
const path = require("path");
const { getEngine } = require("../ai/engines/global-ai-loader.js");

const repairAI = getEngine("DOCUMENT_ENGINE");

/**
 * Load template HTML.
 */
function loadTemplate(file) {
  const filePath = path.join(process.cwd(), "templates", file);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Save repaired template.
 */
function saveTemplate(file, html) {
  const filePath = path.join(process.cwd(), "templates", file);
  fs.writeFileSync(filePath, html);
}

/**
 * Auto-repair HTML using AI.
 */
async function repairHtml(html, expectedPlaceholders) {
  const prompt = `
    You are the V12 Alpha Template Auto-Repair Engine.

    Repair the following HTML template:
    - Fix malformed HTML
    - Ensure all tags are closed
    - Ensure <html>, <head>, <body> exist
    - Preserve all existing content
    - Insert missing placeholders: ${expectedPlaceholders.join(", ")}
    - Remove placeholders not in expected list
    - Keep formatting clean and professional
    - Do NOT add styling unless necessary

    TEMPLATE:
    ${html}
  `;

  return await repairAI.repairTemplate(prompt);
}

/**
 * Auto-repair a template file.
 */
async function autoRepairTemplate(template, expectedPlaceholders) {
  const originalHtml = loadTemplate(template.file);

  const repairedHtml = await repairHtml(originalHtml, expectedPlaceholders);

  saveTemplate(template.file, repairedHtml);
  recordTemplateChange(template, { ...template, file: repairedFile });

  return {
    status: "repaired",
    file: template.file,
    placeholders: expectedPlaceholders
  };
}

module.exports = {
  autoRepairTemplate
};
