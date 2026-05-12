// template-change-history-api.js
// V12 Alpha – Template Change History API

const fs = require("fs");
const path = require("path");
const { diffTemplates } = require("../ai/template-diff-engine");

const HISTORY_DIR = path.join(process.cwd(), "logs/template-history");

if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

/**
 * Write a history entry to disk.
 */
function writeHistory(entry) {
  const fileName = `history-${Date.now()}.json`;
  const filePath = path.join(HISTORY_DIR, fileName);

  fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));

  return { fileName, filePath };
}

/**
 * Record a template version change.
 */
function recordTemplateChange(oldTemplate, newTemplate) {
  const diff = diffTemplates(oldTemplate, newTemplate);

  const entry = {
    timestamp: new Date().toISOString(),
    from: oldTemplate.templateId,
    to: newTemplate.templateId,
    diff,
    metadata: {
      oldVersion: oldTemplate.version,
      newVersion: newTemplate.version,
      trustZone: newTemplate.trustZone,
      sector: newTemplate.sector,
      docType: newTemplate.docType
    }
  };

  return writeHistory(entry);
}

/**
 * Load all history entries.
 */
function loadHistory() {
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const full = path.join(HISTORY_DIR, file);
    return JSON.parse(fs.readFileSync(full, "utf8"));
  });
}

/**
 * Express API router.
 */
module.exports = function (router) {
  // List all history entries
  router.get("/templates/history", (req, res) => {
    try {
      const history = loadHistory();
      res.json({ total: history.length, history });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Filter by templateId
  router.get("/templates/history/:templateId", (req, res) => {
    try {
      const { templateId } = req.params;
      const history = loadHistory().filter(
        (h) => h.from === templateId || h.to === templateId
      );
      res.json({ total: history.length, history });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
