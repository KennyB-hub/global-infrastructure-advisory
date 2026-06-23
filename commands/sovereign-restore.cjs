
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "seven-os", "global-manifest.json");
const LOG = path.join(ROOT, "reports", "sovereign-restore-log.json");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (entry === "node_modules") continue;
      if (entry === ".git") continue;
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function main() {
  console.log("🔧 Sovereign restore using global-manifest.json…");

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const allFiles = walk(ROOT);

  // Build lookup by filename
  const byName = new Map();
  for (const full of allFiles) {
    const name = path.basename(full);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(full);
  }

  const moves = [];

  for (const engine of manifest.engines || []) {
    const desiredRel = engine.path;
    const desiredAbs = path.join(ROOT, desiredRel);
    const desiredName = path.basename(desiredRel);

    // Already in correct place
    if (fs.existsSync(desiredAbs)) continue;

    const candidates = byName.get(desiredName) || [];

    if (candidates.length === 0) {
      moves.push({ status: "missing", name: desiredName, target: desiredRel });
      continue;
    }

    // Pick the first actual location
    const from = candidates.shift(); // <-- REMOVE used file from list

    // If no more candidates, delete the key
    if (candidates.length === 0) {
      byName.delete(desiredName);
    }

    ensureDir(path.dirname(desiredAbs));

    // Only move if the file still exists
    if (fs.existsSync(from)) {
      fs.renameSync(from, desiredAbs);

      moves.push({
        status: "moved",
        name: desiredName,
        from: from.replace(ROOT + path.sep, ""),
        to: desiredRel
      });
    } else {
      moves.push({
        status: "skipped-missing-at-move",
        name: desiredName,
        from: from.replace(ROOT + path.sep, ""),
        to: desiredRel
      });
    }
  }

  ensureDir(path.dirname(LOG));
  fs.writeFileSync(LOG, JSON.stringify({ moves }, null, 2));

  console.log("✅ Sovereign restore pass complete.");
  console.log("📄 See reports/sovereign-restore-log.json");
}

main();
