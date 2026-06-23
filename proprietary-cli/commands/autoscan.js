const fs = require("fs");
const path = require("path");
const logger = require("../helpers/logger");

const ROOT = path.resolve(__dirname, "../..");
const REPORT = path.join(ROOT, "reports", "autoscan.json");

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, list);
    else list.push(full.replace(ROOT + path.sep, ""));
  }

  return list;
}

module.exports = {
  name: "proprietary-cli:commands:autoscan",
  description: "Scans the entire repository and produces autoscan.json.",

  async run() {
    logger.start(this.name);

    try {
      const files = walk(ROOT);

      if (!fs.existsSync(path.join(ROOT, "reports"))) {
        fs.mkdirSync(path.join(ROOT, "reports"));
      }

      fs.writeFileSync(REPORT, JSON.stringify({ files }, null, 2));

      logger.info(`Found ${files.length} files.`);
      logger.success(this.name);

    } catch (err) {
      logger.error(this.name, err);
      process.exitCode = 1;
    }
  }
};
