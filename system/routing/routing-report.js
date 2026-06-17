const fs = require("fs");
const path = require("path");

async function writeRoutingReport(maps, issues) {
  const report = {
    timestamp: new Date().toISOString(),
    maps,
    issues
  };

  const out = path.join(process.cwd(), "reports", "routing-report.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
}

module.exports = { writeRoutingReport };
