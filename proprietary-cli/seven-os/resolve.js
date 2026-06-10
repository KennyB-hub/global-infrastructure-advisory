// resolve.js — Seven‑OS Absolute Path Resolver
// © 2026 Global Infrastructure Advisory

import path from "path";
import { fileURLToPath } from "url";
import filemap from "./filemap.json" assert { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Seven‑OS resolver
 * Usage:
 *   import { seven } from "../seven-os/resolve.js";
 *   const modulePath = seven("ai/engine/decision.js");
 */
export function seven(route) {
    const [root, ...rest] = route.split("/");

    const base = filemap[root];
    if (!base) {
        throw new Error(
            `Seven‑OS Resolver Error: Unknown root "${root}". ` +
            `Valid roots: ${Object.keys(filemap).join(", ")}`
        );
    }

    return path.join(__dirname, "..", base, ...rest);
}
