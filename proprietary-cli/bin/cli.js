#!/usr/bin/env node

const path = require("path");
const logger = require("../helpers/logger");
const { loadCommands } = require("../commands/index");

(async () => {
  const args = process.argv.slice(2);
  const routeKey = args[0] || "proprietary-cli:help";
  const commandArgs = args.slice(1);

  const registry = await loadCommands();

  const cmd = registry[routeKey];

  if (!cmd) {
    logger.warn(`Unknown command route: ${routeKey}`);
    console.log("\nAvailable commands:");
    for (const key of Object.keys(registry)) {
      console.log(`  ${key}`);
    }
    process.exitCode = 1;
    return;
  }

  await cmd.run(commandArgs);
})();
