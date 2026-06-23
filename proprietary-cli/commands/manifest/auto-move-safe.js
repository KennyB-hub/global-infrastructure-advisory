const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const AUTOSCAN = path.join(ROOT, "reports", "missing-routes.json");
const MANIFEST = path.join(ROOT, "seven-os", "manifest.json");
const RECOVERY = path.join(ROOT, "reports", "recovery.json");
const QUARANTINE = path.join(ROOT, "src", "_autoscan_misplaced");

const VALID_ROOTS = ["runtime", "backend", "seven-os", "workers"];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function routeKeyToPath(routeKey) {
  const parts = routeKey.split(":");
  const root = parts.shift();
  const rel = parts.join("/");
  return { root, rel, full: path.join(root, rel + ".js") };
}

module.exports = {
  name: "proprietary-cli:commands:manifest:auto-move-safe",
  description: "Safely quarantines misplaced files and restores correct structure for runtime, backend, seven-os, and workers.",

  async run() {
    const autoscan = JSON.parse(fs.readFileSync(AUTOSCAN, "utf8"));
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

    ensureDir(QUARANTINE);

    const recovery = { moves: [], manifestUpdates: [] };

    for (const [filePath, info] of Object.entries(autoscan)) {
      const suggested = info.suggestedRouteKey;
      const { root, full } = routeKeyToPath(suggested);

      if (!VALID_ROOTS.includes(root)) continue;

      const actualFull = path.join(ROOT, filePath.replace(/\\/g, "/"));
      const quarantineTarget = path.join(QUARANTINE, filePath.replace(/\\/g, "/"));
      const restoredTarget = path.join(ROOT, full);

      // quarantine original
      if (fs.existsSync(actualFull)) {
        ensureDir(path.dirname(quarantineTarget));
        fs.renameSync(actualFull, quarantineTarget);

        recovery.moves.push({
          type: "quarantine",
          originalPath: filePath,
          quarantinePath: quarantineTarget.replace(ROOT + path.sep, "")
        });
      }

      // restore into correct location
      if (fs.existsSync(quarantineTarget)) {
        ensureDir(path.dirname(restoredTarget));
        fs.copyFileSync(quarantineTarget, restoredTarget);

        recovery.moves.push({
          type: "restore",
          fromQuarantine: quarantineTarget.replace(ROOT + path.sep, ""),
          restoredPath: full
        });
      }

      // update manifest
      manifest.routes[suggested] = full.replace(/\\/g, "/");

      recovery.manifestUpdates.push({
        routeKey: suggested,
        path: full.replace(/\\/g, "/")
      });
    }

    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(RECOVERY, JSON.stringify(recovery, null, 2));
  }
};
