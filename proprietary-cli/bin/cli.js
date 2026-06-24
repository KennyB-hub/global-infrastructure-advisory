#!/usr/bin/env node
// Seven OS — Proprietary Operator CLI
// Secrets must stay out of this repo. Use config.json for runtime settings.

import { loadCommands } from "../core/loader.js"
import { execute } from "../core/executor.js"
import { log, error } from "../core/logger.js"

async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        log("Seven OS Operator CLI")
        log("Usage: seven <command> [options]")
        return
    }

    const registry = await loadCommands()

    try {
        await execute(args, registry)   // ← REQUIRED FIX
    } catch (err) {
        error("Command failed:", err.message)
        process.exit(1)
    }
}

main()
