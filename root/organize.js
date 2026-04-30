organize.js
import fs from 'fs';
import path from 'path';

// Define the "Mission Control" directory map
const missionControl = {
    "public": ["index.html", ".html", ""public/css": ["Main.css"] 
, ".svg"], // UI Layer
    "src/logic": ["sector.js", "space.js", "engine.js"],        // Core Heartbeat
    "src/data": ["config.json", "schema.js", "mock_data.js"],  // Knowledge Base
    "src/auth": ["identity.ts", "vault"],                     // Security/Gov
    "src/data/logs": [".log", "session_"]                     // AI Thought Streams
};

Object.keys(missionControl).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// The cleaner logic
fs.readdirSync('.').forEach(file => {
    for (const [targetDir, extensions] of Object.entries(missionControl)) {
        if (extensions.some(ext => file.endsWith(ext) || file === ext)) {
            const destination = path.join(targetDir, file);
            fs.renameSync(file, destination);
            console.log(`🚀 [LAUNCH] ${file} moved to ${targetDir}`);
            break;
        }
    }
});



