import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readJSON } from "../helpers/json.js";
import { resolvePath } from "../helpers/paths.js";
import { buildContext } from "../context/context.js";

export const name = "clean"

export function run() {
    console.log("Cleaning workspace…")
}
