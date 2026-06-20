const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUTOSCAN = path.join(ROOT, "reports", "missing-routes.json");
const MANIFEST = path.join(ROOT, "seven-os", "manifest.json");
const QUARANTINE = path.join(ROOT, "src", "_autoscan_misplaced");
const RECOVERY = path.join(ROOT, "reports", "recovery.json");

// Valid Seven‑OS ecosystem roots
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

function main() {
  console.log("🔧 Seven‑OS Auto‑Fix: Processing 10k+ misplaced files…");

  const autoscan = JSON.parse(fs.readFileSync(AUTOSCAN, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

  ensureDir(QUARANTINE);

  const recovery = { moves: [], manifestUpdates: [] };

  for (const [filePath, info] of Object.entries(autoscan)) {
    const suggested = info.suggestedRouteKey;

    // ⭐ FIX: Skip invalid or missing route keys
    if (!suggested || typeof suggested !== "string" || !suggested.includes(":")) {
      recovery.moves.push({
        type: "skip",
        reason: "Invalid or missing route key",
        filePath
      });
      continue;
    }

    const { root, full } = routeKeyToPath(suggested);

    // Only restore Seven‑OS ecosystem roots
    if (!VALID_ROOTS.includes(root)) continue;

    const actualFull = path.join(ROOT, filePath.replace(/\\/g, "/"));
    const quarantineTarget = path.join(QUARANTINE, filePath.replace(/\\/g, "/"));
    const restoredTarget = path.join(ROOT, full);

    // 1. Move original to quarantine (if it exists)
    if (fs.existsSync(actualFull)) {
      ensureDir(path.dirname(quarantineTarget));
      fs.renameSync(actualFull, quarantineTarget);

      recovery.moves.push({
        type: "quarantine",
        originalPath: filePath,
        quarantinePath: quarantineTarget.replace(ROOT + path.sep, "")
      });
    }

    // 2. Restore file into correct location
    if (fs.existsSync(quarantineTarget)) {
      ensureDir(path.dirname(restoredTarget));
      fs.copyFileSync(quarantineTarget, restoredTarget);

      recovery.moves.push({
        type: "restore",
        fromQuarantine: quarantineTarget.replace(ROOT + path.sep, ""),
        restoredPath: full
      });
    }

    // 3. Update manifest
    manifest.routes[suggested] = full.replace(/\\/g, "/");

    recovery.manifestUpdates.push({
      routeKey: suggested,
      path: full.replace(/\\/g, "/")
    });
  }

  // Write updated manifest + recovery log
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(RECOVERY, JSON.stringify(recovery, null, 2));

  console.log("✅ Auto‑Fix Complete.");
  console.log("📄 See reports/recovery.json for full details.");
}

main();

