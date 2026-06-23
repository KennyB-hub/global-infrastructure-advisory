const writeReport = require("../utilities/write-report.cjs");
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(process.cwd(), 'seven-os', 'global-manifest.json');

if (fs.existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  
  // Explicitly tie voice-flight handlers to the universal dashboard interface
  manifest.dashboard_routing = {
    universal_interface: "seven-os/backend/apis/program-matching-dashboard.js",
    hands_free_voice: "seven-os/backend/apis/voice-flight-handler.js",
    responder_telemetry: "seven-os/backend/apis/seven-responder-interface.ts"
  };
  
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ Universal Hands-Free Dashboard routing securely bound to Mission Phoenix.');
}
