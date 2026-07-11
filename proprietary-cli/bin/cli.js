#!/usr/bin/env node
// Seven OS — Proprietary Operator CLI
// Secrets must stay out of this repo. Use config.json for runtime settings.

import { loadCommands } from "../core/loader.js"
import { execute } from "../core/executor.js"
import { log, error } from "../core/logger.js"
import { traceEvent } from "../core/tracing.js"

async function main() {
    const args = process.argv.slice(2)

    traceEvent("cli.start", { args })

    if (args.length === 0) {
        log("Seven OS Operator CLI")
        log("Usage: seven <command> [options]")
        traceEvent("cli.help_shown", { args })
        return
    }

    const registry = await loadCommands()
    traceEvent("cli.commands_loaded", { commandCount: Object.keys(registry).length })

    try {
        await execute(args, registry)
    } catch (err) {
        traceEvent("cli.error", { error: err.message, args })
        error("Command failed:", err.message)
        process.exit(1)
    }
}

main()
