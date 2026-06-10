// system/voice/command-learning.js

import fs from "fs";

const learnedPath = "./data/learned-commands.json";

// ---------------------------------------------
// Ensure storage exists
// ---------------------------------------------
function ensureStore() {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  if (!fs.existsSync(learnedPath)) {
    fs.writeFileSync(learnedPath, "[]");
  }
}

// ---------------------------------------------
// Load all learned commands
// ---------------------------------------------
export function loadLearnedCommands() {
  ensureStore();
  const raw = fs.readFileSync(learnedPath, "utf8");
  return JSON.parse(raw);
}

// ---------------------------------------------
// Persist learned commands
// ---------------------------------------------
function saveLearnedCommands(list) {
  ensureStore();
  fs.writeFileSync(learnedPath, JSON.stringify(list, null, 2));
}

// ---------------------------------------------
// Learn a new command (user-taught)
// ---------------------------------------------
export function learnNewCommand({ role, phrase, intent }) {
  if (!role || !phrase || !intent) {
    throw new Error("Missing role, phrase, or intent for learning.");
  }

  const learned = loadLearnedCommands();

  // Avoid duplicates
  const exists = learned.some(
    c =>
      c.role === role &&
      c.phrase.toLowerCase() === phrase.toLowerCase() &&
      c.intent === intent
  );
  if (exists) return { ok: true, learned: false, reason: "duplicate" };

  learned.push({
    id: `lc_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    phrase,
    intent,
    createdAt: new Date().toISOString()
  });

  saveLearnedCommands(learned);

  return { ok: true, learned: true };
}

// ---------------------------------------------
// List learned commands (for UI / audit)
// ---------------------------------------------
export function listLearnedCommands(filter = {}) {
  const learned = loadLearnedCommands();
  const { role, intent } = filter;

  return learned.filter(c => {
    if (role && c.role !== role) return false;
    if (intent && c.intent !== intent) return false;
    return true;
  });
}
