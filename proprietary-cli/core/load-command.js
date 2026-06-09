import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommand() {
    const command = {};
    const base = path.join(__dirname, "..", "command");

    for (const group of fs.readdirSync(base)) {
        const groupPath = path.join(base, group);

        for (const file of fs.readdirSync(groupPath)) {
            if (!file.endsWith(".js")) continue;

            const fullPath = path.join(groupPath, file);

            // Convert Windows path → file:// URL
            const mod = await import(pathToFileURL(fullPath).href);

            const command = mod.default || mod;
            const name = command.name || path.parse(file).name;

            command[name] = command;
        }
    }

    return command;
}
