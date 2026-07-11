import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { readJSON } from "../helpers/json.js";
import { resolvePath } from "../helpers/paths.js";
import { buildContext } from "../context/context.js";
import { traceEvent } from "./tracing.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(options = {}) {
  const ctx = buildContext({ mode: "commands", ...options });

  const commands = {};
  const base = path.join(__dirname, "..", "commands");

  for (const group of fs.readdirSync(base)) {
    const groupPath = path.join(base, group);

    for (const file of fs.readdirSync(groupPath)) {
      if (!file.endsWith(".js")) continue;

      const fullPath = path.join(groupPath, file);

      // Windows + ESM safe import
      const mod = await import(pathToFileURL(fullPath).href);

      const cmd = mod.default || mod;
      const name = cmd.name || path.parse(file).name;

      commands[name] = cmd;
      traceEvent("cli.command_discovered", { group, file, command: name });
    }
  }

  return commands;
}
