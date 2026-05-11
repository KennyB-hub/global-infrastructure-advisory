// document-generator.js
// V12 Alpha – AI Document Generator Layer (Version-Aware + Fallback)

const fs = require("fs");
const path = require("path");

const { retrieveDocuments } = require("./document-retrieval");
const { getEngine } = require("./global-ai-loader");
const { getActiveTemplate } = require("./template-versioning");
const { generateFallbackTemplate } = require("./template-fallback-generator");
const { autoInsertTemplate } = require("./template-registry-auto");
const { logDocumentAccess } = require("./document-access-audit");

// Load your PDF generator engine (html-pdf, puppeteer, etc.)
const pdfEngine = getEngine("DOCUMENT_ENGINE");

/**
 * Load an HTML template by filename.
 */
function loadTemplateFile(fileName) {
  const templatePath = path.join(process.cwd(), "templates", fileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${fileName}`);
  }

  return fs.readFileSync(templatePath, "utf8");
}

/**
 * Replace {{placeholders}} in the template with data.
 */
function applyDataToTemplate(html, data) {
  let output = html;

  for (const key in data) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    output = output.replace(placeholder, data[key] ?? "");
  }

  return output;
}

/**
 * Generate a PDF from a template file + data.
 */
async function generatePdfDocument(templateFile, data) {
  const html = loadTemplateFile(templateFile);
  const filled = applyDataToTemplate(html, data);

  const baseName = templateFile.replace(".html", "");
  const filename = `${baseName}-${Date.now()}.pdf`;
  const outputPath = path.join(process.cwd(), "docs/generated", filename);
  
  const result = await pdfEngine.createPdf(filled, outputPath);

  return {
    filename,
    path: outputPath,
    ...result
  };
}

// Step 6: Audit log
logDocumentAccess({
  query,
  trustZone: routing.trustZone,
  sector: routing.sector,
  docType: routing.docType,
  risk: routing.risk,
  templateUsed: template.file,
  templateVersion: template.version,
  fallback: template.version === "auto",
  outputPdf: pdf.filename
});

/**
 * AI-powered document generator:
 * 1. Semantic routing
 * 2. Version-aware template lookup
 * 3. AI fallback template generation if none exists
 * 4. Placeholder validation
 * 5. PDF generation
 */
async function generateDocumentFromQuery(query, userData = {}) {
  // Step 1: Build semantic routing plan
  const routing = await retrieveDocuments(query);

  // Step 2: Try to find the latest active template
  let template = getActiveTemplate(routing.docType, routing.trustZone);

  // Step 2b: If no template exists → AI fallback
if (!template) {
  const fallback = await generateFallbackTemplate(
    routing.docType,
    routing.sector,
    routing.trustZone
  );

  // Auto-insert into registry
  template = autoInsertTemplate({
    file: fallback.file,
    docType: routing.docType,
    trustZone: routing.trustZone,
    sector: routing.sector,
    placeholders: Object.keys(userData)
  });
}

  // Step 3: Validate placeholders
  const missing = template.placeholders.filter((p) => !(p in userData));
  if (missing.length > 0) {
    throw new Error(
      `Missing required template placeholders: ${missing.join(", ")}`
    );
  }

  // Step 4: Merge user data + routing metadata
  const data = {
    ...userData,
    trustZone: routing.trustZone,
    sector: routing.sector,
    risk: routing.risk,
    timestamp: new Date().toISOString(),
    templateVersion: template.version
  };

  // Step 5: Generate PDF
  return await generatePdfDocument(template.file, data);
}

module.exports = {
  generateDocumentFromQuery,
  generatePdfDocument
};
