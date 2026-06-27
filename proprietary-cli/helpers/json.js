import fs from "fs";

export function readJSON(fullPath) {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}
