#!/usr/bin/env node
/**
 * Proprietary-CLI Universal Router
 * --------------------------------
 * - Loads Seven-OS manifest
 * - Loads all CLI commands
 * - Builds unified routing map
 * - Executes the requested command
 */

const logger = require("../helpers/logger");
const { buildRoutingMap } = require("../core/loader");
const { printHelp } = require("../core/help");

(async () => {
  const args = process.argv.slice(2);

  // If no command provided → show help
  if (args.length === 0) {
    printHelp();
    return;
  }

  const routeKey = args[0];
  const commandArgs = args.slice(1);

  // Load manifest + CLI commands + unified routing
  const routing = buildRoutingMap();
  const cmd = routing.unified[routeKey];

  if (!cmd) {
    logger.warn(`Unknown command: ${routeKey}`);

    console.log("\nAvailable commands:");
    for (const key of Object.keys(routing.unified)) {
      console.log("  " + key);
    }

    console.log("\nTip: Run `proprietary-cli:help` for full help output.");
    process.exitCode = 1;
    return;
  }

  await cmd.run(commandArgs);
})();
