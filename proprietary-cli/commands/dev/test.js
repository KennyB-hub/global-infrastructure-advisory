// proprietary-cli/commands/dev/test.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { loadWorkers } from "../../loader/loadWorkers.js";
import { loadRoutingTable } from "../../loader/loadRoutingTable.js";

import { readJSON } from "../../helpers/json.js";
import { resolvePath } from "../../helpers/paths.js";

import { buildContext } from "../../context/context.js";

// Read the test mode from CLI arguments
const mode = process.argv[2];

export const name = "test";

export async function run() {
    console.log("Running tests…");
}

// Wrap test logic in an async function so we can use await safely
async function main() {
    console.log("Seven-OS CLI Test Mode:", mode);

    // Build context for this test run
    const ctx = buildContext({ mode });
    console.log("Context resolved:", ctx);

    if (mode === "sandbox") {
        console.log("Running sandbox test…");
        await run(); // your existing sandbox logic
        process.exit(0);
    }

    if (mode === "workers") {
        console.log("Running worker registry test…");

        const workers = await loadWorkers(ctx);

        console.log("Workers loaded:", Object.keys(workers));
        process.exit(0);
    }

    if (mode === "routing") {
        console.log("Running routing test…");

        const routing = await loadRoutingTable(ctx);

        console.log("Routing table:", routing);
        process.exit(0);
    }

    if (mode === "loader") {
        console.log("Running loader test…");

        // Example: load evidence JSON
        const evidence = readJSON(resolvePath("reports", "sector-worker-evidence.json"));

        console.log("Evidence entries:", Object.keys(evidence).length);
        console.log("First sector:", Object.keys(evidence)[0]);

        process.exit(0);
    }

    console.log("Unknown test mode:", mode);
    process.exit(1);
}

// Execute the test runner
main();


