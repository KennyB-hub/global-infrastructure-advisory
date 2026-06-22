// commands/fix-routes.cjs
// Seven‑OS Route Repair Engine (CJS)
// Moves misplaced files based on route namespace
// Writes full report to /reports/routing-fix-<timestamp>.json

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "routing-map.json");

const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_FILE = path.join(
  REPORT_DIR,
  `routing-fix-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function moveFile(oldPath, newPath) {
  ensureDir(path.dirname(newPath));
  fs.renameSync(oldPath, newPath);
  console.log(`✔ Moved: ${oldPath} → ${newPath}`);
}

function resolveTargetPath(key, filePath) {
  const ext = path.extname(filePath) || ".ts";
  const [namespace, name] = key.split(":");

  switch (namespace) {
    case "avionics":
      return `seven-os/seven-runtime/drone/${name}${ext}`;

    case "visualization":
      return `seven-os/utilities/dashboard/universal/${name}${ext}`;

    case "backend":
      return `backend/${name}${ext}`;

    case "infrastructure":
      return `seven-os/utilities/dashboard/universal/layouts/${name}${ext}`;

    case "transit":
      return `seven-os/sectors/roads/topology/${name}${ext}`;

    default:
      return filePath; // leave unchanged if unknown
  }
}

function run() {
  console.log("\n🛠 Seven‑OS Route Repair Engine\n");

  if (!fs.existsSync(ROUTES_FILE)) {
    console.error("❌ routing-map.json not found.");
    process.exit(1);
  }

  const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8")).routes;
  const report = [];

  let moved = 0;
  let missing = 0;
  let correct = 0;

  for (const [key, filePath] of Object.entries(routes)) {
    const oldPath = path.join(ROOT, filePath);
    const newRelative = resolveTargetPath(key, filePath);
    const newPath = path.join(ROOT, newRelative);

    if (!fs.existsSync(oldPath)) {
      console.log(`⚠ Missing file: ${oldPath}`);
      report.push({ key, oldPath, newPath, status: "missing" });
      missing++;
      continue;
    }

    if (oldPath === newPath) {
      report.push({ key, oldPath, newPath, status: "correct" });
      correct++;
      continue;
    }

    moveFile(oldPath, newPath);
    report.push({ key, oldPath, newPath, status: "moved" });
    moved++;
  }

  ensureDir(REPORT_DIR);

  const finalReport = {
    timestamp: new Date().toISOString(),
    totals: { moved, missing, correct },
    entries: report
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(finalReport, null, 2));

  console.log("\n🔥 Route repair complete.");
  console.log(`📄 Report written to: ${REPORT_FILE}\n`);
}

run();
