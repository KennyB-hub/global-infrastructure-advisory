import { traceEvent } from "../../core/tracing.js"

export const name = "telemetry"

export function run() {
    traceEvent("cli.command.run", { command: "telemetry" })
    console.log("Collecting telemetry…")
}
