// commands/audit.js
// Seven‑OS Dependency & Integrity Auditor (Clean CJS)

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { writeReport } = require("../utilities/write-report.cjs");

function run(label, cmd, args = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });

  if (result.error) {
    console.error(`❌ ${label} error:`, result.error);
    return { ok: false };
  }

  if (result.status !== 0) {
    console.error(`❌ ${label} failed`);
    return { ok: false };
  }

  console.log(`✔ ${label} passed`);
  return { ok: true };
}

function runAudit() {
  console.log("\n🔍 Seven‑OS Audit — Dependency & Integrity Check\n");

  const root = path.join(__dirname, "..");
  const pkgPath = path.join(root, "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.error("❌ package.json not found. Cannot run audit.");
    process.exit(1);
  }

  // 1. NPM Audit
  const audit = run("NPM Audit", "npm", ["audit", "--audit-level=high"]);

  // 2. Outdated packages
  const outdated = run("Outdated Packages", "npm", ["outdated"]);

  // 3. Install check
  const installCheck = run("Install Verification", "npm", ["install", "--dry-run"]);

  // 4. Module resolution check
  console.log("\n=== Module Resolution Check ===");
  let missingModules = [];
  const pkg = require(pkgPath);

  if (pkg.dependencies) {
    for (const dep of Object.keys(pkg.dependencies)) {
      try {
        require.resolve(dep);
      } catch {
        console.log(`⚠ Missing module: ${dep}`);
        missingModules.push(dep);
      }
    }
  }

  if (missingModules.length === 0) {
    console.log("✔ All modules resolved correctly");
  }

  // 5. Write audit report
  writeReport("audit", {
    status: "ok",
    timestamp: new Date().toISOString(),
    audit: audit.ok,
    outdated: outdated.ok,
    installCheck: installCheck.ok,
    missingModules
  });

  console.log("\n🔥 Seven‑OS Audit Complete\n");
}

runAudit();
