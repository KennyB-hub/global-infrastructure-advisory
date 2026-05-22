// system/voice/command-loader.js

import { CommandLibrary } from "./command-registry.js";
import { loadLearnedCommands } from "./command-learning.js";
import fs from "fs";

// ---------------------------------------------
// Load domain packs (future expansion)
// ---------------------------------------------
function loadDomainPacks() {
  const packsDir = "./system/voice/packs";
  const packs = [];

  if (!fs.existsSync(packsDir)) return packs;

  const files = fs.readdirSync(packsDir);
  for (const file of files) {
    if (file.endsWith(".json")) {
      const pack = JSON.parse(
        fs.readFileSync(`${packsDir}/${file}`, "utf8")
      );
      packs.push(pack);
    }
  }

  return packs;
}

// ---------------------------------------------
// Merge built-in + learned + domain packs
// ---------------------------------------------
export function loadAllCommands() {
  const merged = JSON.parse(JSON.stringify(CommandLibrary)); // deep clone

  // 1. Merge learned commands
  const learned = loadLearnedCommands();
  for (const cmd of learned) {
    if (!merged[cmd.role]) merged[cmd.role] = [];

    merged[cmd.role].push({
      intent: cmd.intent,
      priority: "normal",
      patterns: [cmd.phrase],
      source: "learned"
    });
  }

  // 2. Merge domain packs (future expansion)
  const packs = loadDomainPacks();
  for (const pack of packs) {
    for (const role of Object.keys(pack)) {
      if (!merged[role]) merged[role] = [];
      merged[role].push(...pack[role]);
    }
  }

  return merged;
}

// ---------------------------------------------
// Hot reload support (Seven updates without restart)
// ---------------------------------------------
export function reloadCommands() {
  return loadAllCommands();
}
