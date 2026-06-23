const fs = require("fs");
const path = require("path");
const logger = require("../../helpers/logger");
const { loadManifest } = require("./loader");

const ROOT = path.resolve(__dirname, "../../..");
const AUTOSCAN = path.join(ROOT, "reports", "autoscan.json");
const OUTPUT = path.join(ROOT, "reports", "missing-routes.json");

module.exports = {
  name: "proprietary-cli:commands:manifest:find-missing-routes",
  description: "Compares autoscan.json to manifest.routes and identifies unmapped files.",

  async run() {
    logger.start(this.name);

    try {
      const autoscan = JSON.parse(fs.readFileSync(AUTOSCAN, "utf8"));
      const manifest = loadManifest();

      const mapped = new Set(Object.values(manifest.routes));
      const missing = {};

      for (const file of autoscan.files) {
        if (!mapped.has(file)) {
          const key = file.replace(/[\\/]/g, ":").replace(/\.(js|ts|cjs)$/, "");
          missing[file] = { suggestedRouteKey: key };
        }
      }

      fs.writeFileSync(OUTPUT, JSON.stringify({ missing }, null, 2));

      logger.info(`Missing routes: ${Object.keys(missing).length}`);
      logger.success(this.name);

    } catch (err) {
      logger.error(this.name, err);
      process.exitCode = 1;
    }
  }
};
