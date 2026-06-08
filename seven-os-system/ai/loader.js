// Seven‑OS Engine Loader – V12 Alpha
// Sovereign Dynamic Engine Discovery + ESM Loader

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of Seven‑OS
const ROOT = path.join(__dirname, "..");

//
// Utility: dynamic import that works for ESM + CJS
//
async function loadModule(filePath) {
    const mod = await import(filePath);
    return mod.default || mod;
}

//
// Utility: scan a folder recursively for .js engines
//
function scanEngines(dir) {
    const engines = [];

    if (!fs.existsSync(dir)) return engines;

    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            engines.push(...scanEngines(full));
        } else if (item.endsWith(".js")) {
            engines.push(full);
        }
    }

    return engines;
}

//
// MAIN: Load all engines from Seven‑OS
//
export async function loadAllEngines() {
    const engineMap = {};

    // 1. System Engines
    const systemDir = path.join(ROOT, "system");
    const systemEngines = scanEngines(systemDir);

    // 2. AI Engines
    const aiDir = path.join(ROOT, "ai");
    const aiEngines = scanEngines(aiDir);

    // 3. Runtime Engines (cattle, drone, disaster, infra, telecom, safety)
    const runtimeDir = path.join(ROOT, "runtime");
    const runtimeEngines = scanEngines(runtimeDir);

    // 4. Policy Engines
    const policyDir = path.join(ROOT, "policies");
    const policyEngines = scanEngines(policyDir);

    // 5. Log Engines
    const logDir = path.join(ROOT, "logs");
    const logEngines = scanEngines(logDir);

    // Combine all engine paths
    const all = [
        ...systemEngines,
        ...aiEngines,
        ...runtimeEngines,
        ...policyEngines,
        ...logEngines
    ];

    //
    // Load each engine dynamically
    //
    for (const filePath of all) {
        try {
            const mod = await loadModule(filePath);

            // Engine name = exported name OR filename
            const name =
                mod.engineId ||
                mod.name ||
                path.parse(filePath).name;

            engineMap[name] = {
                name,
                module: mod,
                path: filePath
            };
        } catch (err) {
            console.error("Engine failed to load:", filePath, err);
        }
    }

    return engineMap;
}

//
// Helper: Load a single engine by name
//
export async function loadEngineByName(name) {
    const all = await loadAllEngines();
    return all[name] || null;
}
