// commands/audit.js
// Seven‑OS Audit Runner (Corrected for seven-os/seven-runtime)

const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const { writeReport } = require("../utilities/write-report.cjs");

const ROOT = path.join(__dirname, "..");
const RUNTIME = path.join(ROOT, "seven-os", "seven-runtime");
const AUDIT_SCRIPT = path.join(RUNTIME, "tools", "run-repo-audit.js");

function run(label, cmd, args = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`❌ ${label} failed`);
    return false;
  }
  console.log(`✔ ${label} passed`);
  return true;
}

function runAudit() {
  console.log("\n🔍 Seven‑OS Audit Runner\n");

  // Check runtime path
  if (!fs.existsSync(RUNTIME)) {
    console.error("❌ seven-runtime not found at:");
    console.error(RUNTIME);
    console.error("Audit cannot continue.");
    process.exit(1);
  }

  console.log(`✔ seven-runtime found at: ${RUNTIME}`);

  // Check audit script
  if (!fs.existsSync(AUDIT_SCRIPT)) {
    console.error("❌ run-repo-audit.js not found at:");
    console.error(AUDIT_SCRIPT);
    console.error("Audit cannot continue.");
    process.exit(1);
  }

  console.log(`✔ Audit script found at: ${AUDIT_SCRIPT}`);

  // Run the audit
  const ok = run("Seven‑Runtime Audit", "node", [AUDIT_SCRIPT]);

  writeReport("audit", {
    status: ok ? "ok" : "failed",
    timestamp: new Date().toISOString(),
    script: AUDIT_SCRIPT
  });

  console.log("\n🔥 Seven‑OS Audit Complete\n");
}

runAudit();
