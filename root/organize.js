import fs from 'fs';
import path from 'path';

// Define the "Mission Control" directory map
const missionControl = {
    "root/public": [".html", ".svg"],  // UI Layer
    "root/src/logic": ["sector.js", "space.js", "engine.js"],        // Core Heartbeat
    "root/src/data": ["config.json", "schema.js", "mock_data.js"],  // Knowledge Base
    "root/src/auth": ["identity.ts", "vault"],                     // Security/Gov
    "root/src/data/logs": [".log", "session_"]                     // AI Thought Streams
};

// Create directories
Object.keys(missionControl).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ [MKDIR] Created directory: ${dir}`);
    }
});

// The cleaner logic
fs.readdirSync('.').forEach(file => {
    // Skip directories and system files
    if (fs.statSync(file).isDirectory() || file.startsWith('.')) {
        return;
    }
    
    for (const [targetDir, extensions] of Object.entries(missionControl)) {
        if (extensions.some(ext => file.endsWith(ext) || file === ext)) {
            const destination = path.join(targetDir, file);
            
            // Avoid moving if source and destination are the same
            if (file !== destination) {
                fs.renameSync(file, destination);
                console.log(`🚀 [LAUNCH] ${file} moved to ${targetDir}`);
            }
            break;
        }
    }
});

console.log('✅ Organization complete!');
