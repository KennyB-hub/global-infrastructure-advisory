const fs = require('fs');
const path = require('path');

// Target your specific manifest file path
const manifestPath = path.join(__dirname, 'manifest.json'); 

try {
  let content = fs.readFileSync(manifestPath, 'utf8');

  // 1. Swap class strings safely
  content = content.replaceAll('"SevenRuntime"', '"Runtime"');
  
  // 2. Optional: Adjust paths if the manifest maps package dependencies
  // content = content.replaceAll('./seven-os/seven-bootstrap.ts', '@seven/os-runtime');

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('[Success] Global manifest updated cleanly.');
} catch (err) {
  console.error('[Error] Failed to patch manifest:', err);
}
