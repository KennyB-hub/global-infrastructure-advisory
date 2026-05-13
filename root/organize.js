import fs from 'fs';
import path from 'path';

// Define the "Mission Control" directory map
const missionControl = {
    "public": ["index.html", ".html", ".svg"],
    "public/css": ["main.css", "admin.css"],
    "src/logic": ["sector.js", "space.js", "engine.js"],
    "src/data": ["config.json", "schema.js", "mock_data.js"],
    "src/auth": ["identity.ts", "vault"],
    "src/data/logs": [".log", "session_"]
};

// Ensure all directories exist
Object.keys(missionControl).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 [CREATED] Directory: ${dir}`);
    }
});

// The cleaner logic
fs.readdirSync('.').forEach(file => {
    // Skip hidden files and node_modules
    if (file.startsWith('.') || file === 'node_modules' || file === 'organize.js') {
        return;
    }

    for (const [targetDir, extensions] of Object.entries(missionControl)) {
        const shouldMove = extensions.some(ext => 
            file.endsWith(ext) || file === ext
        );

        if (shouldMove) {
            const destination = path.join(targetDir, file);
            try {
                fs.renameSync(file, destination);
                console.log(`🚀 [LAUNCH] ${file} → ${targetDir}`);
                break;
            } catch (err) {
                console.error(`❌ [ERROR] Failed to move ${file}: ${err.message}`);
            }
        }
    }
});

console.log(`✅ File organization complete!`);
