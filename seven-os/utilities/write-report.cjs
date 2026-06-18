const fs = require("fs");
const path = require("path");

function writeReport(name, data) {
  const ROOT = process.cwd();
  const reportsDir = path.join(ROOT, "reports");

  fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(reportsDir, `${name}-${timestamp}.json`);

  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  console.log(`💾 Report saved: reports/${name}-${timestamp}.json`);
}

module.exports = { writeReport };
