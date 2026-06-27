// proprietary-cli/loader/worker.js

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { buildContext } from "../context/context.js";
import { resolvePath } from "../helpers/paths.js";
import { readJSON } from "../helpers/json.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all workers from /src/workers
export async function loadWorkers(options = {}) {
    const ctx = buildContext({ mode: "workers", ...options });

    const workersDir = path.join(ctx.repoRoot, "src", "workers");
    const workers = {};

    // Scan worker directory
    for (const file of fs.readdirSync(workersDir)) {
        if (!file.endsWith(".js")) continue;

        const fullPath = path.join(workersDir, file);

        // Windows + ESM safe import
        const mod = await import(pathToFileURL(fullPath).href);

        const worker = mod.default || mod;
        const name = worker.name || path.parse(file).name;

        workers[name] = worker;
    }

    return workers;
}
