// document-audit-dashboard.js
// V12 Alpha – Document Audit Dashboard API

const fs = require("fs");
const path = require("path");

const AUDIT_DIR = path.join(process.cwd(), "logs/document-access");

/**
 * Load all audit log files.
 */
function loadAuditLogs() {
  if (!fs.existsSync(AUDIT_DIR)) return [];

  const files = fs.readdirSync(AUDIT_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const fullPath = path.join(AUDIT_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(raw);
  });
}

/**
 * Filter logs based on query parameters.
 */
function filterLogs(logs, filters) {
  return logs.filter((log) => {
    for (const key in filters) {
      if (filters[key] && log[key] !== filters[key]) return false;
    }
    return true;
  });
}

/**
 * Sort logs by timestamp (newest first).
 */
function sortLogs(logs) {
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Paginate logs.
 */
function paginate(logs, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return logs.slice(start, start + limit);
}

/**
 * Express router for dashboard API.
 */
module.exports = function (router) {
  router.get("/audit/logs", (req, res) => {
    try {
      const {
        trustZone,
        docType,
        sector,
        fallback,
        templateVersion,
        page = 1,
        limit = 20
      } = req.query;

      const logs = loadAuditLogs();

      const filtered = filterLogs(logs, {
        trustZone,
        docType,
        sector,
        fallback: fallback === "true" ? true : fallback === "false" ? false : null,
        templateVersion
      });

      const sorted = sortLogs(filtered);
      const paginated = paginate(sorted, Number(page), Number(limit));

      res.json({
        total: filtered.length,
        page: Number(page),
        limit: Number(limit),
        results: paginated
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
