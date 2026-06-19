/**
 * Universal CLI Loader for Proprietary-CLI
 * ----------------------------------------
 * - Loads Seven-OS manifest
 * - Loads all CLI commands
 * - Merges manifest routes + CLI command registry
 * - Provides unified routing map for the CLI router
 */

const fs = require("fs");
const path = require("path");
const logger = require("../helpers/logger");
const { loadManifest } = require("../commands/manifest/loader");

const ROOT = path.resolve(__dirname, "..");

/**
 * Load all CLI commands dynamically
 */
function loadCLICommands() {
  const registry = {};
  const commandsDir = path.join(ROOT, "commands");

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".js")) {
        try {
          const mod = require(full);

          const routeKey =
            mod.name ||
            full
              .replace(ROOT + path.sep, "")
              .replace(/\\/g, ":")
              .replace(/\//g, ":")
              .replace(/\.js$/, "");

          mod.__filePath = full.replace(ROOT + path.sep, "");

          registry[routeKey] = mod;

        } catch (err) {
          logger.error("cli-loader", err);
        }
      }
    }
  }

  walk(commandsDir);
  return registry;
}

/**
 * Build unified routing map
 */
function buildRoutingMap() {
  logger.start("cli-universal-loader");

  const manifest = loadManifest();
  const cliCommands = loadCLICommands();

  const routing = {
    manifestRoutes: manifest.routes || {},
    cliCommands,
    unified: {}
  };

  // Merge manifest routes first
  for (const [key, file] of Object.entries(manifest.routes)) {
    routing.unified[key] = cliCommands[key] || null;
  }

  // Add CLI-only commands
  for (const key of Object.keys(cliCommands)) {
    if (!routing.unified[key]) {
      routing.unified[key] = cliCommands[key];
    }
  }

  logger.success("cli-universal-loader");
  return routing;
}

module.exports = {
  loadCLICommands,
  buildRoutingMap
};
