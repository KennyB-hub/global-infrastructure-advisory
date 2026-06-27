import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

if (mode === "workers") {
    console.log("Running worker evidence test…");

    const evidence = loadJSON("sector-worker-evidence-expanded.json");

    console.log("Loaded evidence entries:", Object.keys(evidence).length);
    console.log("First sector:", Object.keys(evidence)[0]);

    process.exit(0);
}
