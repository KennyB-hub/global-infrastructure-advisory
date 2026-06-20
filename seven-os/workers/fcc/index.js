const fs = require("fs");
const path = require("path");
const logger = require("../helpers/logger");

const ROOT = path.resolve(__dirname, "..");

async function loadCommands() {
  const registry = {};

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
          logger.error("command-loader", err);
        }
      }
    }
  }

  walk(path.join(ROOT, "commands"));
  return registry;
}

module.exports = { loadCommands };
