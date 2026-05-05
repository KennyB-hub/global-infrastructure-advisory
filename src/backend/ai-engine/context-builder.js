// /ai-engine/context-builder.js

export async function buildContext(input, env) {
  return {
    timestamp: Date.now(),
    source: "backend-ai-engine",
    evn,
    inputSummary: input?.text?.slice(0, 50) || ""
  }
}
