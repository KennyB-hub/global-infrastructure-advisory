// template-fallback-generator.js
// V12 Alpha – AI Fallback Template Generator

const { getEngine } = require("./global-ai-loader");
const fs = require("fs");
const path = require("path");

// Load AI engine capable of generating templates
const templateAI = getEngine("DOCUMENT_ENGINE");

/**
 * Generate a new HTML template using AI when none exists.
 */
async function generateFallbackTemplate(docType, sector, trustZone) {
  const prompt = `
    Create an HTML document template for:
    - docType: ${docType}
    - sector: ${sector}
    - trustZone: ${trustZone}

    Use {{placeholders}} for all variable fields.
    Keep it clean, professional, and infrastructure‑aligned.
  `;

  const html = await templateAI.generateTemplate(prompt);

  const fileName = `${docType}-${trustZone}-auto.html`;
  const filePath = path.join(process.cwd(), "templates", fileName);

  fs.writeFileSync(filePath, html);

  return {
    file: fileName,
    html
  };
}

module.exports = {
  generateFallbackTemplate
};
