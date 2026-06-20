#!/usr/bin/env node
const logger = require("../helpers/logger");
const { buildRoutingMap } = require("../core/loader");
const { printHelp } = require("../core/help");

// NEW: load internal + node_modules CJS commands
const { loadNodeModulesCommands } = require("../core/load-node-modules-commands.cjs");
const { loadInternalCommands } = require("../core/load-command");

(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    return;
  }

  const routeKey = args[0];
  const commandArgs = args.slice(1);

  // NEW: build unified command registry
  const internalCommands = loadInternalCommands();
  const externalCommands = loadNodeModulesCommands();

  // NEW: pass internal + external into routing map
  const routing = buildRoutingMap({
    internal: internalCommands,
    external: externalCommands
  });

  // NEW: unified command resolution
  const cmd =
    routing.unified[routeKey] ||
    internalCommands[routeKey] ||
    externalCommands[routeKey];

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

