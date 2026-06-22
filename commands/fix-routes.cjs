// commands/fix-routes.cjs
// Seven‑OS Route Repair + Recovery Engine (CJS)

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ROUTES_FILE = path.join(ROOT, "routing-map.json");

const REPORT_DIR = path.join(ROOT, "reports");
const FIX_REPORT = path.join(
  REPORT_DIR,
  `routing-fix-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);
const RECOVERY_REPORT = path.join(
  REPORT_DIR,
  `routing-recovery-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

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
      return filePath;
  }
}

function run() {
  console.log("\n🛠 Seven‑OS Route Repair + Recovery Engine\n");

  if (!fs.existsSync(ROUTES_FILE)) {
    console.error("❌ routing-map.json not found.");
    process.exit(1);
  }

  const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8")).routes;
  const allFiles = walk(ROOT);

  const fixReport = [];
  const recoveryReport = [];

  let moved = 0;
  let missing = 0;
  let recovered = 0;
  let correct = 0;

  for (const [key, filePath] of Object.entries(routes)) {
    const oldPath = path.join(ROOT, filePath);
    const newRelative = resolveTargetPath(key, filePath);
    const newPath = path.join(ROOT, newRelative);

    if (fs.existsSync(oldPath)) {
      if (oldPath === newPath) {
        correct++;
        fixReport.push({ key, oldPath, newPath, status: "correct" });
      } else {
        moveFile(oldPath, newPath);
        moved++;
        fixReport.push({ key, oldPath, newPath, status: "moved" });
      }
      continue;
    }

    // Missing file — attempt recovery
    missing++;

    const filename = path.basename(filePath);
    const candidates = allFiles.filter(f => f.endsWith(filename));

    if (candidates.length > 0) {
      const found = candidates[0];
      moveFile(found, newPath);
      recovered++;
      recoveryReport.push({ key, expected: oldPath, found, movedTo: newPath, status: "recovered" });
    } else {
      recoveryReport.push({ key, expected: oldPath, status: "missing" });
    }
  }

  ensureDir(REPORT_DIR);

  fs.writeFileSync(
    FIX_REPORT,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totals: { moved, missing, correct },
        entries: fixReport
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    RECOVERY_REPORT,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totals: { recovered, missing },
        entries: recoveryReport
      },
      null,
      2
    )
  );

  console.log("\n🔥 Route repair + recovery complete.");
  console.log(`📄 Fix report: ${FIX_REPORT}`);
  console.log(`📄 Recovery report: ${RECOVERY_REPORT}\n`);
}

run();
