import fs from 'fs';
import path from 'path';

// Define the "Mission Control" directory map
const missionControl = {
    "public": ["index.html", ".html", ".svg"],  // UI Layer
    "public/css": ["main.css", "admin.css"],     // Stylesheets
    "src/logic": ["sector.js", "space.js", "engine.js"],        // Core Heartbeat
    "src/data": ["config.json", "schema.js", "mock_data.js"],  // Knowledge Base
    "src/auth": ["identity.ts", "vault.js"],                   // Security/Gov
    "src/data/logs": [".log", "session_"]                       // AI Thought Streams
};

// Ensure all directories exist
Object.keys(missionControl).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 [CREATED] Directory: ${dir}`);
    }
});

// The cleaner logic - moves files to correct locations
fs.readdirSync('.').forEach(file => {
    // Skip directories and special files
    if (fs.statSync(file).isDirectory() || file.startsWith('.')) {
        return;
    }

    for (const [targetDir, extensions] of Object.entries(missionControl)) {
        const matches = extensions.some(
            ext => file.endsWith(ext) || file === ext
        );
        
        if (matches) {
            try {
                const destination = path.join(targetDir, file);
                fs.renameSync(file, destination);
                console.log(`🚀 [LAUNCH] ${file} moved to ${targetDir}`);
                break;
            } catch (err) {
                console.error(`❌ [ERROR] Failed to move ${file}: ${err.message}`);
            }
        }
    }
});

console.log("\n✅ File organization complete!");
