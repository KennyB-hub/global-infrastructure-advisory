// system/voice/command-fallback.js

import { learnNewCommand } from "./command-learning.js";

// ---------------------------------------------
// Step 1: Seven asks if she should learn it
// ---------------------------------------------
export function fallbackAskToLearn(text, role) {
  return {
    spokenText: "I do not recognize that command. Should I learn it?",
    displayText: `> SEVEN: Unknown command: "${text}". Learn this?`,
    priority: "normal",
    mode: role === "rescue" ? "tactical" : "rural",
    actions: [
      {
        type: "LEARN_PROMPT",
        phrase: text,
        role
      }
    ]
  };
}

// ---------------------------------------------
// Step 2: User says "yes" → Seven asks what it means
// ---------------------------------------------
export function fallbackAskIntent(phrase, role) {
  return {
    spokenText: "What should that command do?",
    displayText: `> SEVEN: What should "${phrase}" trigger?`,
    priority: "normal",
    mode: "rural",
    actions: [
      {
        type: "LEARN_INTENT_PROMPT",
        phrase,
        role
      }
    ]
  };
}

// ---------------------------------------------
// Step 3: User provides intent → Seven stores it
// ---------------------------------------------
export function fallbackStoreLearned(phrase, role, intent) {
  const result = learnNewCommand({ role, phrase, intent });

  if (!result.ok) {
    return {
      spokenText: "I could not store that command.",
      displayText: "> SEVEN: Learning failed.",
      priority: "normal",
      mode: "rural",
      actions: []
    };
  }

  return {
    spokenText: "Understood. I will remember that.",
    displayText: `> SEVEN: Learned "${phrase}" → ${intent}`,
    priority: "normal",
    mode: "rural",
    actions: []
  };
}
