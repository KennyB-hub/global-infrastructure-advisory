import { CommandLibrary } from "./command-registry.js";
import fs from "fs";

// Path for learned commands
const learnedPath = "./data/learned-commands.json";

// ---------------------------------------------
// Normalize text for matching
// ---------------------------------------------
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

// ---------------------------------------------
// Load learned commands
// ---------------------------------------------
function loadLearnedCommands() {
  if (!fs.existsSync(learnedPath)) return [];
  return JSON.parse(fs.readFileSync(learnedPath, "utf8"));
}

// ---------------------------------------------
// Match against built-in commands
// ---------------------------------------------
function matchBuiltIn(text, role) {
  const domain = CommandLibrary[role] || CommandLibrary["rural"];
  const cleaned = normalize(text);

  for (const cmd of domain) {
    for (const pattern of cmd.patterns) {
      if (cleaned.includes(pattern)) {
        return {
          intent: cmd.intent,
          priority: cmd.priority,
          source: "builtin",
          pattern
        };
      }
    }
  }

  return null;
}

// ---------------------------------------------
// Match against learned commands
// ---------------------------------------------
function matchLearned(text, role) {
  const cleaned = normalize(text);
  const learned = loadLearnedCommands();

  for (const cmd of learned) {
    if (cmd.role === role && cleaned.includes(cmd.phrase.toLowerCase())) {
      return {
        intent: cmd.intent,
        priority: "normal",
        source: "learned",
        pattern: cmd.phrase
      };
    }
  }

  return null;
}

// ---------------------------------------------
// Fuzzy Matching (Seven understands variations)
// ---------------------------------------------
function fuzzyMatch(text, role) {
  const cleaned = normalize(text);
  const domain = CommandLibrary[role] || CommandLibrary["rural"];

  let best = null;
  let bestScore = 0;

  for (const cmd of domain) {
    for (const pattern of cmd.patterns) {
      const score = similarity(cleaned, pattern);
      if (score > bestScore && score >= 0.55) {
        best = {
          intent: cmd.intent,
          priority: cmd.priority,
          source: "fuzzy",
          pattern,
          score
        };
        bestScore = score;
      }
    }
  }

  return best;
}

// ---------------------------------------------
// Simple similarity scoring (Jaccard-like)
// ---------------------------------------------
function similarity(a, b) {
  const A = new Set(a.split(" "));
  const B = new Set(b.split(" "));
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return intersection / union;
}

// ---------------------------------------------
// MAIN MATCHER (Seven’s brain)
// ---------------------------------------------
export function matchVoiceCommand(text, role) {
  // 1. Built-in commands
  const builtIn = matchBuiltIn(text, role);
  if (builtIn) return builtIn;

  // 2. Learned commands
  const learned = matchLearned(text, role);
  if (learned) return learned;

  // 3. Fuzzy matching (understands variations)
  const fuzzy = fuzzyMatch(text, role);
  if (fuzzy) return fuzzy;

  // 4. No match → Seven will ask to learn it
  return null;
}
