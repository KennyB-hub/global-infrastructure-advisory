// 2050 V12 Alpha — AI Memory (ephemeral in-process)

const shortTermStore = new Map(); // contextId -> { messages: [...] }

export function rememberShortTerm(contextId, message) {
  const existing = shortTermStore.get(contextId) || { messages: [] };
  existing.messages.push({ message, timestamp: Date.now() });
  shortTermStore.set(contextId, existing);
}

export function recallShortTerm(contextId) {
  return shortTermStore.get(contextId)?.messages || [];
}
