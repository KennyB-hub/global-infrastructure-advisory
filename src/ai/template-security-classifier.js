// template-security-classifier.js
// V12 Alpha – Template Security Classifier

const fs = require("fs");
const path = require("path");
const { getEngine } = require("./global-ai-loader");

const securityAI = getEngine("DOCUMENT_ENGINE");

/**
 * Load template HTML.
 */
function loadTemplateHtml(file) {
  const filePath = path.join(process.cwd(), "templates", file);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * AI-powered security classification.
 */
async function classifyTemplateSecurity(template) {
  const html = loadTemplateHtml(template.file);

  const prompt = `
    You are the V12 Alpha Template Security Classifier.

    Analyze the following HTML template and classify its security level.
    Consider:
    - trustZone: ${template.trustZone}
    - sector: ${template.sector}
    - docType: ${template.docType}
    - placeholders: ${template.placeholders.join(", ")}

    Evaluate:
    - presence of sensitive fields (SSN, DOB, financials, identity data)
    - government or contractor-specific content
    - operational or infrastructure details
    - risk of public exposure
    - required trustZone for safe access

    Output JSON with:
    {
      "securityLevel": "public" | "internal" | "restricted" | "confidential" | "secret" | "deepgov",
      "riskScore": 0-100,
      "reasoning": "...",
      "recommendedTrustZone": "public" | "farmer" | "contractor" | "employee" | "admin" | "gov" | "deepgov"
    }

    TEMPLATE:
    ${html}
  `;

  const result = await securityAI.classifySecurity(prompt);
  return JSON.parse(result);
}

module.exports = {
  classifyTemplateSecurity
};
