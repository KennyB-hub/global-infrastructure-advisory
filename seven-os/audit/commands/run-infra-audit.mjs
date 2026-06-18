#!/usr/bin/env node

// Seven‑OS Full Infrastructure Audit (v3/v12)
// Runs InfrastructureAuditEngine across ALL sectors.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { InfrastructureAuditEngine } from "../seven-os/system/infrastructure/infrastructure-audit-engine.js";
import { writeReport } from "../utilities/write-report.cjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SECTORS_DIR = path.join(ROOT, "seven-os", "sectors");

async function runFullAudit() {
  console.log("\n🔍 Seven‑OS: Running full infrastructure audit...\n");

  if (!fs.existsSync(SECTORS_DIR)) {
    console.error("❌ No sectors found. Cannot run full audit.");
    process.exit(1);
  }

  const sectors = fs.readdirSync(SECTORS_DIR).filter(name =>
    fs.statSync(path.join(SECTORS_DIR, name)).isDirectory()
  );

  const results = {};

  for (const sector of sectors) {
    console.log(`\n📡 Auditing sector: ${sector}`);

    try {
      const result = await InfrastructureAuditEngine.runAudit(sector, {});
      results[sector] = {
        target: result.target,
        score: result.score || null,
        hazards: (result.hazards || []).length,
        compliance: result.compliance || {},
        keys: Object.keys(result)
      };

      console.log(`✔ Sector '${sector}' audit complete`);
    } catch (err) {
      console.error(`❌ Sector '${sector}' audit failed:`, err);
      results[sector] = { error: err.message };
    }
  }

  // Write global audit report
  writeReport("infrastructure-audit", {
    auditedAt: new Date().toISOString(),
    sectors: results
  });

  console.log("\n✅ Full infrastructure audit complete.\n");
  console.log("📄 Global audit report written.\n");
}

runFullAudit();
