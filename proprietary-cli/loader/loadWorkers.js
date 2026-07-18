// proprietary-cli/loader/loadWorkers.js

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { buildContext } from "../context/context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load all backend workers into a map:
 *   { workerName: workerModule }
 */
export async function loadWorkers(options = {}) {
    const ctx = buildContext({ mode: "workers", ...options });

    // Adjust this if your workers live somewhere else
    const workersDir = path.join(ctx.repoRoot, "seven-os", "backend", "worker");

    const workers = {};

    for (const file of fs.readdirSync(workersDir)) {
        if (!file.endsWith(".js")) continue;

        const fullPath = path.join(workersDir, file);
        const mod = await import(pathToFileURL(fullPath).href);

        const worker = mod.default || mod;
        const name =
            worker.name ||
            worker.workerName ||
            path.parse(file).name;

        workers[name] = worker;
    }

    return workers;
}
