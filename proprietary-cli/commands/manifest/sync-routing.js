const fs = require("fs");
const path = require("path");
const logger = require("../../helpers/logger");
const { loadManifest } = require("./loader");

const ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.join(ROOT, "reports", "routing-state.json");

module.exports = {
  name: "proprietary-cli:commands:manifest:sync-routing",
  description: "Rebuilds routing-state.json from updated manifest.",

  async run() {
    logger.start(this.name);

    try {
      const manifest = loadManifest();

      const state = {
        timestamp: new Date().toISOString(),
        totalRoutes: Object.keys(manifest.routes).length,
        routes: manifest.routes
      };

      fs.writeFileSync(OUTPUT, JSON.stringify(state, null, 2));

      logger.info(`Routing state updated.`);
      logger.success(this.name);

    } catch (err) {
      logger.error(this.name, err);
      process.exitCode = 1;
    }
  }
};
