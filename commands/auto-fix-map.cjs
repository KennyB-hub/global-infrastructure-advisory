const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MAP = path.join(ROOT, "reports", "missing-routes.json"); 
const QUARANTINE = path.join(ROOT, "src", "_autoscan_misplaced");
const RECOVERY = path.join(ROOT, "reports", "recovery-from-map.json");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function moveFile(currentRel, targetRel) {
  const from = path.join(ROOT, currentRel);
  const to = path.join(ROOT, targetRel);

  if (!fs.existsSync(from)) {
    return { type: "missing", from, to };
  }

  ensureDir(path.dirname(to));
  fs.renameSync(from, to);

  return { type: "move", from, to };
}

function main() {
  console.log("🔧 Seven‑OS Auto‑Fix (map‑based): restoring files to their targets…");

  const map = JSON.parse(fs.readFileSync(MAP, "utf8"));
  ensureDir(QUARANTINE);

  const recovery = { moves: [] };

  for (const entry of map.runtime || []) {
    const { file, target } = entry;
    const basename = path.basename(file);
    const dest = path.join(target, basename);

    const result = moveFile(file, dest);
    recovery.moves.push({ group: "seven-runtime", ...result });
  }

  for (const entry of map.dashboard || []) {
    const { file, target } = entry;
    const basename = path.basename(file);
    const dest = path.join(target, basename);

    const result = moveFile(file, dest);
    recovery.moves.push({ group: "dashboard", ...result });
  }

  for (const entry of map.sector || []) {
    const { file, target, sector } = entry;
    const basename = path.basename(file);

    const sectorRoot = sector ? path.join(target, sector) : target;
    const dest = path.join(sectorRoot, basename);

    const result = moveFile(file, dest);
    recovery.moves.push({ group: "sector", sector, ...result });
  }

  fs.writeFileSync(RECOVERY, JSON.stringify(recovery, null, 2));
  console.log("✅ Map‑based auto‑fix complete.");
  console.log("📄 See reports/recovery-from-map.json for details.");
}

main();
