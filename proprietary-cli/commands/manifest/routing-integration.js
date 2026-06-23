/**
 * Seven‑OS Manifest Routing Integration
 * -------------------------------------
 * - Loads manifest routes
 * - Compares them to CLI command registry
 * - Reports missing / extra / aligned routes
 */

const logger = require("../../helpers/logger");
const { loadManifest } = require("./loader");
const { loadCommands } = require("../index");

module.exports = {
  name: "proprietary-cli:commands:manifest:routing-integration",
  description: "Integrates Seven‑OS manifest routes with proprietary-cli commands and reports alignment.",

  async run() {
    logger.start(this.name);

    try {
      const manifest = loadManifest();
      const routes = manifest.routes || {};
      const registry = await loadCommands();

      const manifestRouteKeys = Object.keys(routes);
      const cliRouteKeys = Object.keys(registry);

      const missingInCLI = [];
      const extraInCLI = [];
      const aligned = [];

      for (const routeKey of manifestRouteKeys) {
        if (cliRouteKeys.includes(routeKey)) {
          aligned.push(routeKey);
        } else {
          missingInCLI.push(routeKey);
        }
      }

      for (const routeKey of cliRouteKeys) {
        if (!manifestRouteKeys.includes(routeKey)) {
          extraInCLI.push(routeKey);
        }
      }

      console.log("\n📡 Seven‑OS Manifest Routing Integration Report\n");

      console.log("Aligned Routes:", aligned.length);
      aligned.forEach(k => console.log("  ✔ " + k));

      console.log("\nRoutes in manifest but missing in CLI:", missingInCLI.length);
      missingInCLI.forEach(k => console.log("  ✖ " + k));

      console.log("\nRoutes in CLI but not in manifest:", extraInCLI.length);
      extraInCLI.forEach(k => console.log("  ⚠ " + k));

      logger.info(`Aligned: ${aligned.length}, Missing: ${missingInCLI.length}, Extra: ${extraInCLI.length}`);
      logger.success(this.name);

    } catch (err) {
      logger.error(this.name, err);
      process.exitCode = 1;
    }
  },

  help() {
    console.log(`\n${this.name}`);
    console.log(this.description);
    console.log("\nUsage:");
    console.log("  proprietary-cli manifest:routing-integration\n");
  }
};
