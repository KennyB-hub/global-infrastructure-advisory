// Seven‑OS Command Loader – Stable Build

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const commandsDir = path.resolve(__dirname, "../commands");
  const registry = {};

  if (!fs.existsSync(commandsDir)) {
    console.error("Commands directory missing:", commandsDir);
    return registry;
  }

  const files = fs.readdirSync(commandsDir);

  for (const file of files) {
    const fullPath = path.join(commandsDir, file);

    // Only load .js or .cjs files
    if (!file.endsWith(".js") && !file.endsWith(".cjs")) continue;

    try {
      const mod = await import(fullPath);
      const name = path.basename(file).replace(/\.(js|cjs)$/, "");

      registry[name] = mod.default || mod;
    } catch (err) {
      console.error(`Failed to load command: ${file}`);
      console.error(err);
    }
  }

  return registry;
}
