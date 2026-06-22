// commands/routing-auto-fix.cjs
// Seven‑OS Full Auto‑Healing Routing Engine (runtime + backend + seven‑os)
// Writes JSON reports into /reports/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "routing-map.json");
const REPORT_DIR = path.join(ROOT, "reports");

const TS = new Date().toISOString().replace(/[:.]/g, "-");
const DISCOVERY_REPORT = path.join(REPORT_DIR, `routing-discovery-${TS}.json`);
const FIX_REPORT = path.join(REPORT_DIR, `routing-fix-${TS}.json`);
const CORRECTION_REPORT = path.join(REPORT_DIR, `routing-correction-${TS}.json`);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, list);
    else list.push(full);
  }
  return list;
}

function normalizeTypos(name) {
  return name
    .replace("cotrol", "control")
    .replace("reanderer", "renderer")
    .replace("pubic", "public")
    .replace("surch", "search")
    .replace("disance", "distance")
    .replace("mapping logic", "mapping-logic")
    .replace("normalize location", "normalize-location");
}

function resolveNamespaceTarget(key, filePath) {
  const ext = path.extname(filePath) || ".ts";
  const [namespace, rawName] = key.split(":");
  const name = normalizeTypos(rawName);

  switch (namespace) {
    case "avionics":
      return `seven-os/seven-runtime/drone/${name}${ext}`;
    case "visualization":
      return `seven-os/utilities/dashboard/universal/${name}${ext}`;
    case "infrastructure":
      return `seven-os/utilities/dashboard/universal/layouts/${name}${ext}`;
    case "transit":
      return `seven-os/sectors/roads/topology/${name}${ext}`;
    case "backend":
      return `backend/${name}${ext}`;

    default:
      return filePath;
  }
}

function main() {
  console.log("\n🧠 Seven‑OS Full Auto‑Healing Routing Engine\n");

  if (!fs.existsSync(ROUTES_FILE)) {
    console.error("❌ routing-map.json not found.");
    process.exit(1);
  }

  ensureDir(REPORT_DIR);

  const routesJson = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8"));
  const routes = routesJson.routes;

  const allFiles = walk(ROOT);
  fs.writeFileSync(
    DISCOVERY_REPORT,
    JSON.stringify({ timestamp: new Date().toISOString(), files: allFiles }, null, 2)
  );

  const fixEntries = [];
  const correctionEntries = [];

  let moved = 0;
  let missing = 0;
  let corrected = 0;
  let unchanged = 0;

  for (const [key, filePath] of Object.entries(routes)) {
    const originalPath = path.join(ROOT, filePath);
    const targetRelative = resolveNamespaceTarget(key, filePath);
    const targetPath = path.join(ROOT, targetRelative);

    const normalizedRelative = normalizeTypos(filePath);
    const normalizedPath = path.join(ROOT, normalizedRelative);

    // If typo correction changes path, record it
    if (normalizedRelative !== filePath) {
      correctionEntries.push({
        key,
        oldRoutePath: filePath,
        newRoutePath: normalizedRelative,
        reason: "typo-correction"
      });
      routes[key] = normalizedRelative;
      corrected++;
    }

    const existsExact = fs.existsSync(originalPath);
    const existsNormalized = fs.existsSync(normalizedPath);

    if (!existsExact && !existsNormalized) {
      missing++;
      correctionEntries.push({
        key,
        expected: filePath,
        status: "missing"
      });
      continue;
    }

    const sourcePath = existsExact ? originalPath : normalizedPath;

    if (sourcePath === targetPath) {
      unchanged++;
      fixEntries.push({
        key,
        sourcePath,
        targetPath,
        status: "correct"
      });
      continue;
    }

    ensureDir(path.dirname(targetPath));
    fs.renameSync(sourcePath, targetPath);
    moved++;
    fixEntries.push({
      key,
      sourcePath,
      targetPath,
      status: "moved"
    });
  }

    fs.writeFileSync(
    FIX_REPORT,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totals: { moved, missing, unchanged },
        entries: fixEntries
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    CORRECTION_REPORT,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totals: { corrected, missing },
        entries: correctionEntries
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    ROUTES_FILE,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalRoutes: Object.keys(routes).length,
        routes: routes
      },
      null,
      2
    )
  );

  console.log("Auto-healing complete.");
  console.log("Discovery report:   " + DISCOVERY_REPORT);
  console.log("Fix report:         " + FIX_REPORT);
  console.log("Correction report:  " + CORRECTION_REPORT);
}

main();
