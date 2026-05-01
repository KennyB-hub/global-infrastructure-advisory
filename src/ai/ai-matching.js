/**
 * AI Intent Matcher — Sandbox Layer
 * Classifies user intent for the intelligence engine.
 */

export function matchSandboxIntent(query = "") {
  const text = query.toLowerCase();

  if (text.includes("geo") || text.includes("location")) return "geo";
  if (text.includes("convert") || text.includes("format")) return "utility";
  if (text.includes("resonance") || text.includes("deep")) return "resonance";
  if (text.includes("admin") || text.includes("verify")) return "auth";

  return "unknown";
}
