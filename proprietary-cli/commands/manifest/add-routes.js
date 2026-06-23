const fs = require("fs");
const path = require("path");
const logger = require("../../helpers/logger");
const { loadManifest } = require("./loader");

const ROOT = path.resolve(__dirname, "../../..");
const MISSING = path.join(ROOT, "reports", "missing-routes.json");
const MANIFEST = path.join(ROOT, "seven-os", "manifest.json");

module.exports = {
  name: "proprietary-cli:commands:manifest:auto-add-routes",
  description: "Adds missing routes to manifest.json using suggested route keys.",

  async run() {
    logger.start(this.name);

    try {
      const missing = JSON.parse(fs.readFileSync(MISSING, "utf8")).missing;
      const manifest = loadManifest();

      let added = 0;

      for (const [file, info] of Object.entries(missing)) {
        if (!manifest.routes[info.suggestedRouteKey]) {
          manifest.routes[info.suggestedRouteKey] = file;
          added++;
        }
      }

      fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

      logger.info(`Added ${added} new routes.`);
      logger.success(this.name);

    } catch (err) {
      logger.error(this.name, err);
      process.exitCode = 1;
    }
  }
};
