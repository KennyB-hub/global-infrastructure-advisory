// backend/restore-root.js
// © 2026 Global Infrastructure Advisory — Root File Restoration Engine

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('==================================================');
console.log('🏗️   SEVEN-OS RECONSTRUCTION ENGINE ACTIVATED      ');
console.log('    REVERSING ROOT DEPLOYMENT CORRUPTION MATRIX   ');
console.log('==================================================\n');

// 1. Explicit target directory structure map built from your corporate manifest data
const folderBlueprints = {
  "seven-os/api": [
    "api-trust.js", "boundary.ts", "compliance.js", "deep-mind.js", "documents.js", 
    "donors.js", "ewo.js", "index.js", "load-matching.js", "marketplace.js", 
    "opportunities-active.js", "opportunities.js", "opportunity.js", 
    "program-matching-dashboard.js", "risk-trends.js", "router.js", "sector-math.js", 
    "sector-status.js", "security-posture-dashboard.js", "seven-responder-interface.ts", 
    "system.js", "users.js", "voice-flight-handler.js", "voice-flight.js", 
    "workforce.js", "[[path]].js"
  ],
  "seven-os/workers": [
    "admin-protect-worker.js", "ai-worker.js", "debug-worker.js", "field-enginegps-mapper.js", 
    "gia-deep-mind-2100.js", "organizer.js", "Topology Sync Worker.js", "worker.ts"
  ],
  "seven-os/sectors": [
    "agriculture.json", "airports.json", "bridges-tunnels.json", "building-code.json", 
    "climate.json", "cloud.json", "contractors.json", "cyber.json", "datacenters.json", 
    "disaster-response.json", "education.json", "energy-grid.json", "energy-pipeline.json", 
    "energy-transmission.json", "energy-storage.json", "finance.json", "food-supply.json", 
    "government.json", "health.json", "logistics.json", "manufacturing.json", "mining.json", 
    "oil-gas.json", "ports.json", "power-generation.json", "public-safety.json", "rail.json", 
    "roads.json", "sanitation.json", "space.json", "telecom-infra.json", "transport.json", 
    "water.json", "economics.json"
  ],
  "runtime": [
    "ai-decision.js", "collar-state-handler.ts", "collar-state-redis-handler.ts", 
    "decision-engine.js", "fix-runtime.ts", "restore-runtime.js", "scheduler.ts", 
    "state.js", "state.ts"
  ]
};

async function executeRestoration() {
  let filesRestoredCount = 0;

  for (const [targetFolder, fileList] of Object.entries(folderBlueprints)) {
    const destinationPath = path.join(ROOT_DIR, targetFolder);

    // Ensure the folder exist physically before moving files back
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
      console.log(`📁 Created directory framework: ${targetFolder}`);
    }

    fileList.forEach(fileName => {
      // Look for the flattened file sitting directly in the project root folder
      const sourceRootPath = path.join(ROOT_DIR, fileName);
      const targetDestinationPath = path.join(destinationPath, fileName);

      if (fs.existsSync(sourceRootPath)) {
        try {
          fs.renameSync(sourceRootPath, targetDestinationPath);
          console.log(`  ➡ Re-aligned [${fileName}] -> ${targetFolder}/${fileName}`);
          filesRestoredCount++;
        } catch (err) {
          console.error(`  ❌ Failed to move ${fileName}:`, err.message);
        }
      }
    });
  }

  console.log('\n==================================================');
  console.log('🏁   RECONSTRUCTION OPERATIONS COMPLETED          ');
  console.log(`     Total Flattened Components Re-aligned: ${filesRestoredCount}`);
  console.log('==================================================');
}

executeRestoration().catch(console.error);
