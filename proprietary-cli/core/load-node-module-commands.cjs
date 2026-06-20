const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const NODE_MODULES = path.join(ROOT, "node_modules");

// Only load packages that explicitly expose CLI commands
const COMMAND_ENTRY_FILES = [
  "cli.js",
  "index.js",
  "command.js",
  "commands.js"
];

function safeRequire(p) {
  try {
    return require(p);
  } catch {
    return null;
  }
}

function loadNodeModulesCommands() {
  const commands = {};

  if (!fs.existsSync(NODE_MODULES)) {
    return commands;
  }

  const packages = fs.readdirSync(NODE_MODULES);

  for (const pkg of packages) {
    // skip scoped packages for now
    if (pkg.startsWith("@")) continue;

    const pkgPath = path.join(NODE_MODULES, pkg);
    const stat = fs.statSync(pkgPath);

    if (!stat.isDirectory()) continue;

    // Look for known CLI entry files
    for (const entry of COMMAND_ENTRY_FILES) {
      const entryPath = path.join(pkgPath, entry);

      if (fs.existsSync(entryPath)) {
        const mod = safeRequire(entryPath);

        if (mod && typeof mod === "object") {
          for (const [key, handler] of Object.entries(mod)) {
            if (typeof handler === "function") {
              const routeKey = `external:${pkg}:${key}`;
              commands[routeKey] = handler;
            }
          }
        }
      }
    }
  }

  return commands;
}

module.exports = { loadNodeModulesCommands };
