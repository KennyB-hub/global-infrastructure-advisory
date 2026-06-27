// proprietary-cli/context/context.js

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the repo root (three levels up from CLI)
const repoRoot = path.join(__dirname, "..", "..");

export function buildContext(options = {}) {
    const cwd = process.cwd();

    return {
        cwd,
        repoRoot,

        // Common directories
        cliDir: path.join(repoRoot, "proprietary-cli"),
        helpersDir: path.join(repoRoot, "proprietary-cli", "helpers"),
        loaderDir: path.join(repoRoot, "proprietary-cli", "loader"),
        commandsDir: path.join(repoRoot, "proprietary-cli", "commands"),
        reportsDir: path.join(repoRoot, "reports"),

        // Runtime options
        mode: options.mode || null,
        command: options.command || null,
        worker: options.worker || null,
        sector: options.sector || null,

        // Environment
        env: process.env
    };
}
