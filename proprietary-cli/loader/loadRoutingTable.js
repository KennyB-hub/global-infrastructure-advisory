// proprietary-cli/loader/loadRoutingTable.js

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { buildContext } from "../context/context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadRoutingTable(options = {}) {
    const ctx = buildContext({ mode: "routing", ...options });

    const routingDir = path.join(ctx.repoRoot, "seven-os", "backend", "routes");
    const table = {};

    for (const file of fs.readdirSync(routingDir)) {
        if (!file.endsWith(".js")) continue;

        const fullPath = path.join(routingDir, file);
        const mod = await import(pathToFileURL(fullPath).href);

        const route = mod.default || mod;
        const name = route.name || path.parse(file).name;

        table[name] = route;
    }

    return table;
}
