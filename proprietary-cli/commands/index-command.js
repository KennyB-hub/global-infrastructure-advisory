const logger = require("../helpers/logger");
const { loadCommands } = require("./index");
const { loadManifest } = require("./manifest/loader");
const path = require("path");

module.exports = {
  name: "proprietary-cli:commands:index",
  description: "Prints a formatted table of all registered proprietary-cli commands.",

  async run() {
    logger.start(this.name);

    try {
      const registry = await loadCommands();
      const manifest = loadManifest();

      const rows = [];

      for (const [routeKey, mod] of Object.entries(registry)) {
        rows.push({
          routeKey,
          description: mod.description || "(no description provided)",
          file: mod.__filePath || "(unknown)"
        });
      }

      // Pretty table output
      console.log("\n📦 Proprietary CLI Command Index\n");
      console.log("Route Key".padEnd(45) + "Description".padEnd(45) + "File Path");
      console.log("-".repeat(120));

      for (const row of rows) {
        console.log(
          row.routeKey.padEnd(45) +
          row.description.padEnd(45) +
          row.file
        );
      }

      console.log("\nTotal Commands:", rows.length);
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
    console.log("  proprietary-cli commands:index\n");
  }
};
