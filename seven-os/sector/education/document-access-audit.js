// document-access-audit.js
// V12 Alpha – Document Access Audit Log

const fs = require("fs");
const path = require("path");

const AUDIT_DIR = path.join(process.cwd(), "logs/document-access");

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

/**
 * Append an audit entry to the immutable log.
 */
function logDocumentAccess(entry) {
  const timestamp = new Date().toISOString();
  const fileName = `audit-${Date.now()}.json`;
  const filePath = path.join(AUDIT_DIR, fileName);

  const record = {
    timestamp,
    ...entry
  };

  fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

  return {
    status: "logged",
    file: fileName,
    path: filePath
  };
}

module.exports = {
  logDocumentAccess
};
