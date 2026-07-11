import { traceEvent } from "./tracing.js"

export function execute(args, registry) {
    const [command, ...rest] = args

    traceEvent("cli.execute", { command, args: rest })

    if (!registry[command]) {
        traceEvent("cli.unknown_command", { command })
        console.error(`Unknown command: ${command}`)
        process.exit(1)
    }

    registry[command].run(rest)
}
