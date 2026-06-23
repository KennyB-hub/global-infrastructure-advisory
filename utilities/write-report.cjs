// utilities/write-report.cjs
const fs = require("fs");
const path = require("path");

module.exports = function writeReport(filename, data) {
  try {
    const reportsDir = path.join(process.cwd(), "reports");

    // Ensure /reports exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    console.log(`📄 Report written: ${filePath}`);
    return filePath;
  } catch (err) {
    console.error("❌ Failed to write report:", err);
    return null;
  }
};
