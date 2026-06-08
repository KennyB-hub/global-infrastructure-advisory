#!/usr/bin/env node
// Seven OS — Proprietary Operator CLI
// Secrets must stay out of this repo. Use config.json for runtime settings.

import { loadCommands } from "../commands/core/load.js";
import { execute } from "../commands/core/executor.js";
import { log, error } from "../commands/core/logger.js";
import { runCLI } from "../commands/index.js";
import { runSandboxAI } from "seven-os/sandbox";

runCLI();

async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        log("Seven OS Operator CLI")
        log("Usage: seven <command> [options]")
        return
    }

    const registry = await loadCommands()

    try {
        execute(args, registry)
    } catch (err) {
        error("Command failed:", err.message)
        process.exit(1)
    }
}

main()
