// Seven‑OS CLI Command Registry – V12 Alpha
// This file exists so the sandbox test can import it.

import { loadCommands } from "./core/load-commands.js";

export async function runCLI(args = []) {
  const registry = await loadCommands();
  const cmd = args[0] || "help";

  if (registry[cmd]) {
    return registry[cmd].run(args.slice(1));
  }

  console.log(`Unknown command: ${cmd}`);
}
