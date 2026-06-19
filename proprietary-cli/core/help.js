/**
 * Proprietary-CLI Help Engine
 * ---------------------------
 * - Generates dynamic help output
 * - Reads unified routing map
 * - Formats command descriptions
 */

const logger = require("../helpers/logger");
const { buildRoutingMap } = require("./loader");

function formatRow(col1, col2) {
  return col1.padEnd(45) + col2;
}

function generateHelp() {
  const routing = buildRoutingMap();
  const commands = routing.unified;

  const rows = [];

  for (const [routeKey, mod] of Object.entries(commands)) {
    rows.push({
      routeKey,
      description: mod?.description || "(no description provided)"
    });
  }

  rows.sort((a, b) => a.routeKey.localeCompare(b.routeKey));

  return rows;
}

function printHelp() {
  logger.start("cli-help");

  const rows = generateHelp();

  console.log("\n📘 Proprietary-CLI Help\n");
  console.log(formatRow("Route Key", "Description"));
  console.log("-".repeat(90));

  for (const row of rows) {
    console.log(formatRow(row.routeKey, row.description));
  }

  console.log("\nTotal Commands:", rows.length);
  logger.success("cli-help");
}

module.exports = { printHelp, generateHelp };
